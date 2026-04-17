"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { sendCustomerOtp, verifyCustomerOtp } from "@/lib/website-api";

const AUTH_STORAGE_KEY = "zyno_store_auth";
const AuthContext = createContext(null);

function readStoredAuth() {
  if (typeof window === "undefined") return { token: "", user: null };

  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsedAuth = storedAuth ? JSON.parse(storedAuth) : null;
    return {
      token: parsedAuth?.token || "",
      user: parsedAuth?.user || null,
    };
  } catch {
    return { token: "", user: null };
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);
  const token = auth.token;
  const user = auth.user;

  useEffect(() => {
    if (token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [token, user]);

  const sendOtp = useCallback((host, payload) => {
    return sendCustomerOtp(host, payload);
  }, []);

  const verifyOtp = useCallback(async (host, payload) => {
    const result = await verifyCustomerOtp(host, payload);
    setAuth({
      token: result?.token || "",
      user: result?.user || null,
    });
    return result;
  }, []);

  const logout = useCallback(() => {
    setAuth({ token: "", user: null });
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isReady: true,
      sendOtp,
      verifyOtp,
      logout,
    }),
    [logout, sendOtp, token, user, verifyOtp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
