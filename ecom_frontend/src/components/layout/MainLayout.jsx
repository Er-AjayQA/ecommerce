import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useState } from "react";
import Footer from "./Footer";
import { useLayouts } from "@/context/layoutsContext";
import { cn } from "@/lib/utils";

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { appliedLayout } = useLayouts();
  const location = useLocation();
  const isSettingsArea =
    location.pathname === "/settings" ||
    location.pathname.startsWith("/settings/");

  const sidebarPosition = appliedLayout?.sidebarPosition || "left";
  const density = appliedLayout?.density || "comfortable";
  const contentWidth = appliedLayout?.contentWidth || "full";
  const sidebarSide = sidebarPosition === "right" ? "right" : "left";
  const hideSidebar = sidebarPosition === "none";
  const forceCollapsed = sidebarPosition === "collapsed";
  const shouldShowSidebar = !isSettingsArea && !hideSidebar;
  const sidebarWidth = !shouldShowSidebar
    ? 0
    : collapsed || forceCollapsed
      ? 80
      : 256;

  const mainPadding = {
    compact: "p-4 pt-16",
    spacious: "p-8 pt-20",
    comfortable: "p-6 pt-16",
  };

  const contentClassName = cn(
    "min-h-full w-full",
    contentWidth === "boxed" && "mx-auto max-w-6xl",
    contentWidth === "wide" && "mx-auto max-w-[1440px]",
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-slate-950">
      {shouldShowSidebar && (
        <Sidebar collapsed={collapsed || forceCollapsed} side={sidebarSide} />
      )}
      <div
        className="flex flex-col flex-1"
        style={{
          marginLeft: sidebarSide === "right" ? 0 : sidebarWidth,
          marginRight: sidebarSide === "right" ? sidebarWidth : 0,
        }}
      >
        {/* Header */}
        <Header
          sidebarWidth={sidebarWidth}
          sidebarSide={sidebarSide}
          onToggleSidebar={() => setCollapsed((prev) => !prev)}
          showSidebarToggle={shouldShowSidebar && !forceCollapsed}
        />

        {/* MAIN */}
        <main
          className={cn(
            "flex-1 overflow-auto",
            mainPadding[density] || mainPadding.comfortable,
          )}
        >
          <div className={contentClassName}>
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
