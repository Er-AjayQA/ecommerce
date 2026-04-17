import { getLayoutStyle, normalizeLayoutConfig } from "@/lib/store-design";

export function LayoutShell({ layout, children }) {
  const normalizedLayout = normalizeLayoutConfig(layout);

  return (
    <main
      data-layout-id={normalizedLayout.id}
      data-layout-shell={normalizedLayout.shell}
      data-sidebar-enabled={normalizedLayout.sidebar.enabled}
      className="min-h-screen"
      style={getLayoutStyle(normalizedLayout)}
    >
      {children}
    </main>
  );
}
