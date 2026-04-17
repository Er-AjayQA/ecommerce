"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStorefront } from "@/context/StorefrontContext";
import {
  addCustomerCartItem,
  applyCustomerCartCoupon,
  clearCustomerCart,
  getCustomerCart,
  removeCustomerCartCoupon,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "@/lib/website-api";

const CART_STORAGE_KEY = "zyno_store_cart";
const CartContext = createContext(null);

function readStoredCart() {
  if (typeof window === "undefined") return [];

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = storedCart ? JSON.parse(storedCart) : [];
    return Array.isArray(parsedCart) ? parsedCart : parsedCart.items || [];
  } catch {
    return [];
  }
}

function readStoredCoupon() {
  if (typeof window === "undefined") return null;

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = storedCart ? JSON.parse(storedCart) : null;
    return Array.isArray(parsedCart) ? null : parsedCart?.coupon || null;
  } catch {
    return null;
  }
}

function getItemKey(productId, variantId) {
  return `${productId || "product"}:${variantId || "default"}`;
}

function getVariantPrice(variant, product) {
  const value = variant?.price || product?.raw?.price || product?.price || 0;
  const price = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(price) ? price : 0;
}

function normalizeServerCart(cart) {
  const items = (cart?.cart_items || []).map((item) => {
    const product = item.product || {};
    const variant = item.variant || null;
    const productId = item.product_id || product.product_id;
    const variantId = item.product_variant_id || variant?.product_variant_id || "";
    const productCode = product.code || productId;

    return {
      key: item.cart_item_id || getItemKey(productId, variantId),
      cartItemId: item.cart_item_id,
      productId,
      variantId,
      name: product.title || product.name || "Product",
      href: `/products/${productCode}`,
      image: "",
      variantTitle: variant?.title || "",
      sku: variant?.sku || product.sku || "",
      price: Number(item.final_price || item.unit_price || variant?.price || 0),
      quantity: Number(item.quantity || 1),
      isServerItem: true,
    };
  });

  const coupon = cart?.applied_coupon_code
    ? {
        code: cart.applied_coupon_code,
        discountAmount: Number(cart.discount_amount || 0),
      }
    : null;

  return { items, coupon };
}

export function CartProvider({ children }) {
  const { host } = useStorefront();
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState(readStoredCart);
  const [coupon, setCoupon] = useState(readStoredCoupon);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, coupon }));
  }, [coupon, items]);

  const syncCartFromServer = useCallback(async (nextToken = token) => {
    if (!nextToken) return null;

    const serverCart = await getCustomerCart(host, nextToken);
    const normalizedCart = normalizeServerCart(serverCart);
    setItems(normalizedCart.items);
    setCoupon(normalizedCart.coupon);
    return serverCart;
  }, [host, token]);

  const replaceCartFromServer = useCallback((serverCart) => {
    const normalizedCart = normalizeServerCart(serverCart);
    setItems(normalizedCart.items);
    setCoupon(normalizedCart.coupon);
  }, []);

  const addItem = useCallback(({ product, variant, quantity = 1 }) => {
    if (!product) return;

    const itemKey = getItemKey(product.id, variant?.product_variant_id);
    const nextQuantity = Math.max(1, Number(quantity) || 1);
    setCartError("");

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.key === itemKey);

      if (existingItem) {
        return currentItems.map((item) =>
          item.key === itemKey
            ? { ...item, quantity: item.quantity + nextQuantity }
            : item
        );
      }

      return [
        ...currentItems,
        {
          key: itemKey,
          productId: product.id,
          variantId: variant?.product_variant_id || "",
          name: product.name,
          href: product.href,
          image: product.image || product.images?.[0] || "",
          variantTitle: variant?.title || "",
          sku: variant?.sku || product.sku || "",
          price: getVariantPrice(variant, product),
          quantity: nextQuantity,
        },
      ];
    });

    setIsCartOpen(true);

    if (isAuthenticated && token) {
      addCustomerCartItem(host, token, {
        productId: product.id,
        productVariantId: variant?.product_variant_id || null,
        quantity: nextQuantity,
      })
        .then(replaceCartFromServer)
        .catch((error) => {
          setCartError(error?.response?.data?.message || "Cart update failed");
        });
    }
  }, [host, isAuthenticated, replaceCartFromServer, token]);

  const removeItem = useCallback((key) => {
    const removedItem = items.find((item) => item.key === key);
    setItems((currentItems) => currentItems.filter((item) => item.key !== key));

    if (isAuthenticated && token && removedItem?.cartItemId) {
      removeCustomerCartItem(host, token, removedItem.cartItemId)
        .then(replaceCartFromServer)
        .catch((error) => {
          setCartError(error?.response?.data?.message || "Cart update failed");
        });
    }
  }, [host, isAuthenticated, items, replaceCartFromServer, token]);

  const updateQuantity = useCallback((key, quantity) => {
    const nextQuantity = Number(quantity);

    if (!Number.isFinite(nextQuantity) || nextQuantity <= 0) {
      removeItem(key);
      return;
    }

    const targetItem = items.find((item) => item.key === key);
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.key === key ? { ...item, quantity: nextQuantity } : item
      )
    );

    if (isAuthenticated && token && targetItem?.cartItemId) {
      updateCustomerCartItem(host, token, targetItem.cartItemId, nextQuantity)
        .then(replaceCartFromServer)
        .catch((error) => {
          setCartError(error?.response?.data?.message || "Cart update failed");
        });
    }
  }, [host, isAuthenticated, items, removeItem, replaceCartFromServer, token]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    if (isAuthenticated && token) {
      clearCustomerCart(host, token).catch((error) => {
        setCartError(error?.response?.data?.message || "Cart clear failed");
      });
    }
  }, [host, isAuthenticated, token]);

  const applyCoupon = useCallback((nextCoupon) => {
    setCoupon(nextCoupon);
    if (isAuthenticated && token && nextCoupon?.code) {
      applyCustomerCartCoupon(host, token, nextCoupon.code)
        .then(replaceCartFromServer)
        .catch((error) => {
          setCartError(error?.response?.data?.message || "Coupon apply failed");
        });
    }
  }, [host, isAuthenticated, replaceCartFromServer, token]);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    if (isAuthenticated && token) {
      removeCustomerCartCoupon(host, token)
        .then(replaceCartFromServer)
        .catch((error) => {
          setCartError(error?.response?.data?.message || "Coupon remove failed");
        });
    }
  }, [host, isAuthenticated, replaceCartFromServer, token]);

  const mergeLocalCartToServer = useCallback(async (nextToken = token) => {
    if (!nextToken) return null;

    const guestItems = items.filter((item) => !item.isServerItem);
    setCartError("");

    for (const item of guestItems) {
      await addCustomerCartItem(host, nextToken, {
        productId: item.productId,
        productVariantId: item.variantId || null,
        quantity: item.quantity,
      });
    }

    if (coupon?.code) {
      try {
        await applyCustomerCartCoupon(host, nextToken, coupon.code);
      } catch {
        setCoupon(null);
      }
    }

    return syncCartFromServer(nextToken);
  }, [coupon, host, items, syncCartFromServer, token]);

  const value = useMemo(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const discountAmount = coupon?.discountAmount || 0;
    const total = Math.max(0, subtotal - discountAmount);

    return {
      items,
      itemCount,
      subtotal,
      coupon,
      discountAmount,
      total,
      cartError,
      isCartOpen,
      setIsCartOpen,
      addItem,
      applyCoupon,
      mergeLocalCartToServer,
      syncCartFromServer,
      updateQuantity,
      removeItem,
      removeCoupon,
      clearCart,
    };
  }, [
    addItem,
    applyCoupon,
    clearCart,
    coupon,
    cartError,
    isCartOpen,
    items,
    mergeLocalCartToServer,
    removeCoupon,
    removeItem,
    syncCartFromServer,
    updateQuantity,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
