const contentWidthMap = {
  narrow: "56rem",
  boxed: "80rem",
  wide: "96rem",
  full: "100%",
  "7xl": "80rem",
};

const colorVarMap = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  chart1: "--chart-1",
  chart2: "--chart-2",
  chart3: "--chart-3",
  chart4: "--chart-4",
  chart5: "--chart-5",
  sidebarBackground: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  sidebarPrimary: "--sidebar-primary",
  sidebarPrimaryForeground: "--sidebar-primary-foreground",
  sidebarAccent: "--sidebar-accent",
  sidebarAccentForeground: "--sidebar-accent-foreground",
  sidebarBorder: "--sidebar-border",
  sidebarRing: "--sidebar-ring",
};

export function getThemeStyle(themeConfig = {}) {
  const colors = themeConfig.colors || {};
  const style = {
    fontFamily: themeConfig.font || "Arial, Helvetica, sans-serif",
  };

  Object.entries(colorVarMap).forEach(([apiKey, cssVar]) => {
    if (colors[apiKey]) {
      style[cssVar] = `hsl(${colors[apiKey]})`;
    }
  });

  if (themeConfig.radius) {
    style["--radius"] = themeConfig.radius;
    style["--radius-sm"] = `calc(${themeConfig.radius} - 4px)`;
    style["--radius-md"] = `calc(${themeConfig.radius} - 2px)`;
    style["--radius-lg"] = themeConfig.radius;
    style["--radius-xl"] = `calc(${themeConfig.radius} + 4px)`;
  }

  if (themeConfig.shadows) {
    style["--shadow-sm"] = themeConfig.shadows.sm;
    style["--shadow-md"] = themeConfig.shadows.md;
    style["--shadow-lg"] = themeConfig.shadows.lg;
  }

  return style;
}

export function normalizeLayoutConfig(layoutConfig = {}) {
  return {
    id: layoutConfig.id || "DefaultLayout",
    name: layoutConfig.name || "Default Layout",
    description: layoutConfig.description || "",
    shell: layoutConfig.shell || "default",
    contentWidth: layoutConfig.contentWidth || "boxed",
    headerPlacement: layoutConfig.headerPlacement || "top",
    footerPlacement: layoutConfig.footerPlacement || "bottom",
    sidebar: {
      enabled:
        layoutConfig.sidebar?.enabled ??
        layoutConfig.categoryStyle === "leftSidebar" ??
        false,
      placement: layoutConfig.sidebar?.placement || "left",
      source: layoutConfig.sidebar?.source || "categories",
    },
  };
}

export function getLayoutStyle(layoutConfig = {}) {
  const layout = normalizeLayoutConfig(layoutConfig);
  return {
    "--store-content-max-width":
      contentWidthMap[layout.contentWidth] || layout.contentWidth || contentWidthMap.boxed,
  };
}

export function getOrderedSections(templateConfig = {}) {
  return (templateConfig.sections || [])
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
}
