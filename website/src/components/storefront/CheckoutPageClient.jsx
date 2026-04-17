"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useStorefront } from "@/context/StorefrontContext";
import { cn } from "@/lib/utils";
import {
  addCustomerAddress,
  getCustomerAddresses,
  placeCustomerOrder,
} from "@/lib/website-api";

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatAddress(address) {
  return [
    address.address_line_1,
    address.address_line_2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export function CheckoutPageClient() {
  const { host } = useStorefront();
  const { token, user, isAuthenticated, sendOtp, verifyOtp } = useAuth();
  const {
    items,
    itemCount,
    subtotal,
    discountAmount,
    total,
    coupon,
    cartError,
    clearCart,
    mergeLocalCartToServer,
  } = useCart();
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    identifier: "",
    name: "",
    subscribeNewsletter: true,
  });
  const [otp, setOtp] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    notes: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isAddressSaving, setIsAddressSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const didInitialSync = useRef(false);

  const isAddressFormValid = useMemo(
    () =>
      addressForm.firstName &&
      addressForm.lastName &&
      addressForm.phone &&
      addressForm.address &&
      addressForm.city &&
      addressForm.state &&
      addressForm.postalCode,
    [addressForm],
  );

  const updateAuthField = (field, value) => {
    setAuthForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const updateAddressField = (field, value) => {
    setAddressForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const loadCustomerCheckoutData = useCallback(
    async (nextToken = token, shouldMergeCart = false) => {
      if (!nextToken) return;

      setIsDataLoading(true);
      setError("");

      try {
        if (shouldMergeCart) {
          await mergeLocalCartToServer(nextToken);
        }

        const nextAddresses = await getCustomerAddresses(host, nextToken);
        setAddresses(nextAddresses);
        const defaultAddress =
          nextAddresses.find((address) => address.is_default) ||
          nextAddresses[0];
        setSelectedAddressId(defaultAddress?.address_id || "");
      } catch (loadError) {
        setError(
          loadError?.response?.data?.message ||
            "Checkout data load nahi ho paya.",
        );
      } finally {
        setIsDataLoading(false);
      }
    },
    [host, mergeLocalCartToServer, token],
  );

  useEffect(() => {
    if (!isAuthenticated || !token || didInitialSync.current) return;
    didInitialSync.current = true;
    loadCustomerCheckoutData(token, true);
  }, [isAuthenticated, loadCustomerCheckoutData, token]);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (isAuthLoading) return;

    setIsAuthLoading(true);
    setError("");

    try {
      const result = await sendOtp(host, {
        mode: authMode,
        identifier: authForm.identifier,
        name: authForm.name,
        subscribeNewsletter: authForm.subscribeNewsletter,
      });
      setOtpHint(result?.otp ? `Dev OTP: ${result.otp}` : "");
      setOtp("");
      setIsOtpOpen(true);
    } catch (otpError) {
      setError(otpError?.response?.data?.message || "OTP send nahi ho paya.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!otp || isAuthLoading) return;

    setIsAuthLoading(true);
    setError("");

    try {
      const result = await verifyOtp(host, {
        identifier: authForm.identifier,
        otp,
      });
      setIsOtpOpen(false);
      await loadCustomerCheckoutData(result.token, true);
    } catch (verifyError) {
      setError(
        verifyError?.response?.data?.message || "OTP verify nahi ho paya.",
      );
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleAddAddress = async (event) => {
    event.preventDefault();
    if (!isAddressFormValid || !token || isAddressSaving) return;

    setIsAddressSaving(true);
    setError("");

    try {
      const newAddress = await addCustomerAddress(host, token, {
        first_name: addressForm.firstName,
        last_name: addressForm.lastName,
        phone_number: addressForm.phone,
        address_line_1: addressForm.address,
        address_line_2: addressForm.notes,
        city: addressForm.city,
        state: addressForm.state,
        postal_code: addressForm.postalCode,
        country: "India",
        type: "SHIPPING",
        is_default: addresses.length === 0,
      });

      const nextAddresses = [...addresses, newAddress];
      setAddresses(nextAddresses);
      setSelectedAddressId(newAddress.address_id);
      setAddressForm({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        notes: "",
      });
    } catch (addressError) {
      setError(
        addressError?.response?.data?.message || "Address save nahi ho paya.",
      );
    } finally {
      setIsAddressSaving(false);
    }
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (!token || !selectedAddressId || items.length === 0 || isSubmitting)
      return;

    setIsSubmitting(true);
    setError("");

    try {
      const order = await placeCustomerOrder(host, token, {
        shippingAddressId: selectedAddressId,
        billingAddressId: selectedAddressId,
        couponCode: coupon?.code || "",
      });

      setOrderNumber(order?.code || String(order?.order_number || ""));
      clearCart();
    } catch (orderError) {
      setError(
        orderError?.response?.data?.message || "Order place nahi ho paya.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderNumber) {
    return (
      <StorePageShell>
        <section className="mx-auto max-w-2xl px-4 py-16 text-center lg:px-6">
          <div className="rounded-lg border border-border bg-card p-8">
            <p className="text-sm font-medium text-primary">Order placed</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Thank you for your order
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your order number is {orderNumber}.
            </p>
            <Link href="/products" className={cn(buttonVariants(), "mt-6")}>
              Continue shopping
            </Link>
          </div>
        </section>
      </StorePageShell>
    );
  }

  return (
    <StorePageShell>
      <section className="mx-auto max-w-[var(--store-content-max-width)] px-4 py-10 lg:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Login, choose address and place your order.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">Your cart is empty</h2>
            <Link href="/products" className={cn(buttonVariants(), "mt-4")}>
              Shop products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              {!isAuthenticated ? (
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="flex rounded-lg border border-border p-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode("login")}
                      className={cn(
                        "flex-1 rounded-md px-3 py-2 text-sm font-medium",
                        authMode === "login" &&
                          "bg-primary text-primary-foreground",
                      )}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("register")}
                      className={cn(
                        "flex-1 rounded-md px-3 py-2 text-sm font-medium",
                        authMode === "register" &&
                          "bg-primary text-primary-foreground",
                      )}
                    >
                      Register
                    </button>
                  </div>

                  <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
                    {authMode === "register" && (
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={authForm.name}
                          onChange={(event) =>
                            updateAuthField("name", event.target.value)
                          }
                          placeholder="Your name"
                        />
                      </div>
                    )}

                    <div>
                      <Label>Email or mobile</Label>
                      <Input
                        value={authForm.identifier}
                        onChange={(event) =>
                          updateAuthField("identifier", event.target.value)
                        }
                        placeholder="you@example.com or 9876543210"
                        required
                      />
                    </div>
                    {authMode === "register" && (
                      <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm">
                        <Checkbox
                          checked={authForm.subscribeNewsletter}
                          onCheckedChange={(checked) =>
                            updateAuthField(
                              "subscribeNewsletter",
                              Boolean(checked),
                            )
                          }
                          aria-label="Need future updates"
                        />
                        <span>
                          <span className="font-medium">
                            Need future updates
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            Get emails about offers, new products and store
                            updates.
                          </span>
                        </span>
                      </label>
                    )}
                    <Button className="w-full" disabled={isAuthLoading}>
                      {isAuthLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Signed in as
                      </p>
                      <h2 className="font-semibold">
                        {user?.name || user?.email_id || "Customer"}
                      </h2>
                    </div>
                    {isDataLoading && (
                      <p className="text-sm text-muted-foreground">
                        Syncing cart
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isAuthenticated && (
                <>
                  <div className="rounded-lg border border-border bg-card p-5">
                    <h2 className="text-lg font-semibold">Saved addresses</h2>
                    {addresses.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        No saved address found. Add one below.
                      </p>
                    ) : (
                      <div className="mt-4 grid gap-3">
                        {addresses.map((address) => (
                          <label
                            key={address.address_id}
                            className={cn(
                              "cursor-pointer rounded-lg border border-border p-4 text-sm",
                              selectedAddressId === address.address_id &&
                                "border-primary bg-primary/5",
                            )}
                          >
                            <input
                              type="radio"
                              name="address"
                              className="mr-2"
                              checked={selectedAddressId === address.address_id}
                              onChange={() =>
                                setSelectedAddressId(address.address_id)
                              }
                            />
                            <span className="font-medium">
                              {address.first_name} {address.last_name}
                            </span>
                            <p className="mt-1 text-muted-foreground">
                              {formatAddress(address)}
                            </p>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={handleAddAddress}
                    className="rounded-lg border border-border bg-card p-5"
                  >
                    <h2 className="text-lg font-semibold">Add new address</h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Input
                        value={addressForm.firstName}
                        onChange={(event) =>
                          updateAddressField("firstName", event.target.value)
                        }
                        placeholder="First name"
                        required
                      />
                      <Input
                        value={addressForm.lastName}
                        onChange={(event) =>
                          updateAddressField("lastName", event.target.value)
                        }
                        placeholder="Last name"
                        required
                      />
                      <Input
                        value={addressForm.phone}
                        onChange={(event) =>
                          updateAddressField("phone", event.target.value)
                        }
                        placeholder="Phone"
                        required
                      />
                      <Input
                        value={addressForm.city}
                        onChange={(event) =>
                          updateAddressField("city", event.target.value)
                        }
                        placeholder="City"
                        required
                      />
                      <Input
                        className="sm:col-span-2"
                        value={addressForm.address}
                        onChange={(event) =>
                          updateAddressField("address", event.target.value)
                        }
                        placeholder="Address"
                        required
                      />
                      <Input
                        value={addressForm.state}
                        onChange={(event) =>
                          updateAddressField("state", event.target.value)
                        }
                        placeholder="State"
                        required
                      />
                      <Input
                        value={addressForm.postalCode}
                        onChange={(event) =>
                          updateAddressField("postalCode", event.target.value)
                        }
                        placeholder="Postal code"
                        required
                      />
                      <Textarea
                        className="sm:col-span-2"
                        value={addressForm.notes}
                        onChange={(event) =>
                          updateAddressField("notes", event.target.value)
                        }
                        placeholder="Delivery notes"
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      className="mt-4"
                      disabled={!isAddressFormValid || isAddressSaving}
                    >
                      {isAddressSaving ? "Saving..." : "Save address"}
                    </Button>
                  </form>

                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={
                        !selectedAddressId || isSubmitting || isDataLoading
                      }
                    >
                      {isSubmitting ? "Placing order..." : "Place order"}
                    </Button>
                  </form>
                </>
              )}

              {(error || cartError) && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error || cartError}
                </div>
              )}
            </div>

            <aside className="h-fit rounded-lg border border-border bg-card p-5">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>

              <div className="mt-5 divide-y divide-border">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3 py-4">
                    {item.image && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">
                        {item.name}
                      </p>
                      {item.variantTitle && (
                        <p className="text-xs text-muted-foreground">
                          {item.variantTitle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatMoney(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-primary">
                    <span>Discount ({coupon.code})</span>
                    <span>-{formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Calculated later</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
            <DialogDescription>
              OTP sent to {authForm.identifier}. Enter it to continue checkout.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              inputMode="numeric"
              autoFocus
              required
            />
            {otpHint && (
              <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                {otpHint}
              </p>
            )}
            <Button className="w-full" disabled={!otp || isAuthLoading}>
              {isAuthLoading ? "Verifying..." : "Verify and continue"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </StorePageShell>
  );
}
