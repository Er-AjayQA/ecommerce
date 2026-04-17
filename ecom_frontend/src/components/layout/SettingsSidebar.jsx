import { NavLink } from "react-router-dom";
import React, { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "../../lib/utils";

export function SettingsSidebar({ collapsed = false, embedded = false }) {
  const [isHover, setIsHover] = useState(false);
  const finalCollapsed = embedded ? false : collapsed && !isHover;

  const menuData = [
    { name: "Domains", icon: Globe, route: "/settings/domains" },
    { name: "Themes & Layouts", icon: Globe, route: "/settings/themes" },
  ];

  return (
    <aside
      onMouseEnter={() => !embedded && setIsHover(true)}
      onMouseLeave={() => !embedded && setIsHover(false)}
      className={cn(
        "flex flex-col",
        "transition-all duration-300 ease-in-out",
        finalCollapsed ? "w-20" : "w-64",
        "bg-[#343a40]",
        "border border-white/10",
        embedded
          ? [
              "sticky top-4 z-10 shrink-0 self-start",
              "max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl",
              "shadow-[0_0_24px_rgba(0,0,0,0.2)]",
            ]
          : [
              "fixed top-0 left-0 z-50 h-screen",
              "border-r shadow-[0_0_30px_rgba(0,0,0,0.4)]",
            ],
      )}
    >
      {/* HEADER */}
      <div className="sticky top-0 z-10 flex items-center justify-center h-16 px-3 border-b border-white/10 bg-[#343a40]">
        <div className="flex items-center gap-2">
          <div className="overflow-hidden border rounded-full w-9 h-9 border-white/20">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="admin"
              className="object-cover w-full h-full"
            />
          </div>

          {!finalCollapsed && (
            <span className="flex gap-2 text-sm font-semibold whitespace-nowrap">
              <span className="text-gray-300">ZYNO</span>
              <span className="tracking-[0.1em] text-gray-300">ECOMMERCE</span>
            </span>
          )}
        </div>
      </div>

      {/* MENU */}
      <nav className="flex flex-col flex-1 p-3 mt-2">
        {menuData.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.route}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium mb-2",
                  "transition-all duration-200",
                  !isActive &&
                    "text-gray-300 hover:text-white hover:bg-white/5",
                  isActive && "text-white bg-[#3f464f]",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive
                        ? "text-white"
                        : "text-gray-300 group-hover:text-white group-hover:scale-110",
                    )}
                  />

                  {!finalCollapsed && (
                    <span className="transition-all duration-200">
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}
      {!finalCollapsed && (
        <div className="p-4 text-xs text-center text-gray-300 border-t border-white/10">
          Zyno Ecommerce
        </div>
      )}
    </aside>
  );
}
