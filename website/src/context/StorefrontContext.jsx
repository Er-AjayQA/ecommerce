"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getStorefrontData } from "@/lib/website-api";

const fallbackData = {
  design: null,
  products: [],
  categories: [],
  menus: {
    header: [],
    footer: [],
    sidebar: [],
  },
  collections: [],
  productPage: {
    total: 0,
    currentPage: 1,
    totalPages: 1,
  },
  collectionPage: {
    total: 0,
    currentPage: 1,
    totalPages: 1,
  },
};

const StorefrontContext = createContext(null);

export function StorefrontProvider({ children }) {
  const [host, setHost] = useState("");
  const [data, setData] = useState(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const currentHost = window.location.host;

    async function loadStorefront() {
      setHost(currentHost);
      setIsLoading(true);
      setError("");

      const result = await getStorefrontData(currentHost);

      if (!isMounted) return;

      setData(result);
      setError(result.design ? "" : "Store design is not configured for this tenant.");
      setIsLoading(false);
    }

    loadStorefront();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      host,
      data,
      design: data.design,
      isLoading,
      error,
    }),
    [data, error, host, isLoading]
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }

  return context;
}
