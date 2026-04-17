import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Products from "../pages/products/Products";
import { MainLayout } from "../components/layout/MainLayout";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProtectedRoute } from "./ProtectedRoute";
import AddProduct from "../pages/products/AddProduct";
import { TestFormProvider } from "@/context/testFormContext";
import { TestForm } from "@/pages/TestForm";
import { ProductProvider } from "@/context/productContext";
import ForgotPassword from "../pages/auth/forgotPassword";
import ProductsListing from "@/pages/products/ProductsListing";
import { CollectionsProvider } from "@/context/collectionsContext";
import Collections from "@/pages/collections/collections";
import CollectionsListing from "@/pages/collections/CollectionsListing";
import { AddCollection } from "@/pages/collections/AddCollection";
import Domains from "@/pages/domains/Domains";
import DomainsListing from "@/pages/domains/DomainsListing";
import DomainVerification from "@/pages/domains/DomainVerification";
import { DomainProvider } from "@/context/domainContext";
import Settings from "../pages/settings/Settings";
import { UnsavedChangesProvider } from "@/context/unsavedChangesContext";
import { MenusProvider } from "@/context/menusContext";
import Menus from "@/pages/menus/Menus";
import MenusListing from "@/pages/menus/MenusListing";
import { AddMenu } from "@/pages/menus/AddMenu";
import { ThemesProvider } from "@/context/themesContext";
import ThemesListing from "@/pages/themes/ThemesListing";
import Themes from "@/pages/themes/Themes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <UnsavedChangesProvider>
        <ToastContainer transition={Slide} autoClose={1200} draggable />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/settings" element={<Settings />}>
              <Route
                path="domains"
                element={
                  <DomainProvider>
                    <Domains />
                  </DomainProvider>
                }
              >
                <Route index element={<DomainsListing />} />
                <Route path="verify" element={<DomainVerification />} />
              </Route>

              <Route
                path="themes"
                element={
                  <ThemesProvider>
                    <Themes />
                  </ThemesProvider>
                }
              >
                <Route index element={<ThemesListing />} />
              </Route>
            </Route>

            {/* Test Form */}
            <Route
              path="/test"
              element={
                <TestFormProvider>
                  <TestForm />
                </TestFormProvider>
              }
            />

            {/* Products + Nested */}
            <Route
              path="/products"
              element={
                <ProductProvider>
                  <Products />
                </ProductProvider>
              }
            >
              <Route index element={<ProductsListing />} />
              <Route path="create" element={<AddProduct />} />
              <Route path="edit/:id" element={<AddProduct />} />
              <Route path="view/:id" element={<AddProduct />} />
            </Route>

            {/* Collections + Nested */}
            <Route
              path="/collections"
              element={
                <CollectionsProvider>
                  <Collections />
                </CollectionsProvider>
              }
            >
              <Route index element={<CollectionsListing />} />
              <Route path="create" element={<AddCollection />} />
              <Route path="edit/:id" element={<AddCollection />} />
              <Route path="view/:id" element={<AddCollection />} />
            </Route>

            {/* Menus + Nested */}
            <Route
              path="/menus"
              element={
                <MenusProvider>
                  <Menus />
                </MenusProvider>
              }
            >
              <Route index element={<MenusListing />} />
              <Route path="create" element={<AddMenu />} />
              <Route path="edit/:id" element={<AddMenu />} />
              <Route path="view/:id" element={<AddMenu />} />
            </Route>
          </Route>
        </Routes>
      </UnsavedChangesProvider>
    </BrowserRouter>
  );
}
