"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useStorefront } from "@/context/StorefrontContext";
import { cn } from "@/lib/utils";
import { validateWebsiteCoupon } from "@/lib/website-api";

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function CartDrawer() {
  const { host } = useStorefront();
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const {
    items,
    itemCount,
    subtotal,
    coupon,
    discountAmount,
    total,
    isCartOpen,
    setIsCartOpen,
    applyCoupon,
    updateQuantity,
    removeItem,
    removeCoupon,
    clearCart,
  } = useCart();

  const handleApplyCoupon = async (event) => {
    event.preventDefault();
    setCouponMessage("");

    try {
      const result = await validateWebsiteCoupon(host, {
        couponCode,
        subTotal: subtotal,
      });

      applyCoupon({
        code: result.coupon.code,
        discountAmount: Number(result.discountAmount || 0),
      });
      setCouponCode("");
      setCouponMessage("Coupon applied");
    } catch {
      setCouponMessage("Coupon is not valid");
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Cart</SheetTitle>
          <SheetDescription>
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <h3 className="font-semibold">Your cart is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add products to start checkout.
              </p>
              <Button className="mt-4" onClick={() => setIsCartOpen(false)}>
                Continue shopping
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3 py-4">
                  {item.image && (
                    <Link
                      href={item.href}
                      onClick={() => setIsCartOpen(false)}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-contain p-1"
                      />
                    </Link>
                  )}

                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <Link
                        href={item.href}
                        onClick={() => setIsCartOpen(false)}
                        className="line-clamp-1 font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      {item.variantTitle && (
                        <p className="text-xs text-muted-foreground">
                          {item.variantTitle}
                        </p>
                      )}
                      <p className="text-sm font-semibold">{formatMoney(item.price)}</p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-md border border-border">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.key)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-border">
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Coupon code"
              />
              <Button type="submit" variant="outline" disabled={!couponCode.trim()}>
                Apply
              </Button>
            </form>
            {couponMessage && (
              <p className="text-xs text-muted-foreground">{couponMessage}</p>
            )}
            {coupon && (
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                <span>{coupon.code}</span>
                <Button variant="ghost" size="sm" onClick={removeCoupon}>
                  Remove
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-primary">
                <span>Discount</span>
                <span>-{formatMoney(discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between font-semibold">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Taxes, shipping and discounts calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className={cn(buttonVariants(), "w-full")}
            >
              Checkout
            </Link>
            <Button variant="outline" className="w-full" onClick={clearCart}>
              Clear cart
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
