import "./globals.css";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { StorefrontProvider } from "@/context/StorefrontContext";

export const metadata = {
  title: "Ecommerce Website",
  description: "Dynamic ecommerce storefront",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StorefrontProvider>
          <AuthProvider>
            <CartProvider>
            {children}
            <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </StorefrontProvider>
      </body>
    </html>
  );
}
