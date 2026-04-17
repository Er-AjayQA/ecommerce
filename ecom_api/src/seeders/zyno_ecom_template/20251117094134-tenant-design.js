const { v4: uuidv4 } = require("uuid");

const themeConfig = {
  id: "ForestMist",
  name: "Forest Mist",
  font: "Poppins, sans-serif",
  radius: "0.6rem",
  colors: {
    background: "120 40% 97%",
    foreground: "145 35% 16%",

    card: "0 0% 100%",
    cardForeground: "145 35% 16%",

    popover: "0 0% 100%",
    popoverForeground: "145 35% 16%",

    primary: "142 76% 36%",
    primaryForeground: "0 0% 100%",

    secondary: "120 25% 91%",
    secondaryForeground: "145 30% 22%",

    muted: "120 20% 93%",
    mutedForeground: "145 15% 40%",

    accent: "84 60% 45%",
    accentForeground: "0 0% 100%",

    destructive: "0 84% 60%",
    destructiveForeground: "0 0% 100%",

    warning: "38 92% 50%",
    warningForeground: "0 0% 100%",

    border: "120 18% 85%",
    input: "120 18% 85%",
    ring: "142 76% 36%",

    sidebarBackground: "145 55% 24%",
    sidebarForeground: "120 40% 98%",
    sidebarPrimary: "120 40% 98%",
    sidebarPrimaryForeground: "145 55% 24%",
    sidebarAccent: "145 45% 20%",
    sidebarAccentForeground: "120 40% 98%",
    sidebarBorder: "145 45% 20%",
    sidebarRing: "84 60% 45%",

    chart1: "142 76% 36%",
    chart2: "84 60% 45%",
    chart3: "38 92% 50%",
    chart4: "200 70% 45%",
    chart5: "340 70% 55%",
  },
  shadows: {
    sm: "0 1px 2px 0 hsl(145 35% 16% / 0.05)",
    md: "0 4px 6px -1px hsl(145 35% 16% / 0.1)",
    lg: "0 10px 15px -3px hsl(145 35% 16% / 0.12)",
  },
};

const layoutConfig = {
  id: "GroceryQuickShop",
  name: "Grocery Quick Shop",
  description: "Boxed grocery storefront shell with category navigation.",
  shell: "default",
  contentWidth: "boxed",
  headerPlacement: "top",
  footerPlacement: "bottom",
  sidebar: {
    enabled: true,
    placement: "left",
    source: "categories",
  },
  preview: {
    nav: "sidebar",
    shell: "boxed",
    sidebar: true,
  },
};

const templateConfig = {
  id: "GroceryHomeTemplate",
  template_id: "GroceryHomeTemplate",
  name: "Grocery Home Template",
  description: "Fast shopping flow with offers, categories and compact cards.",
  templateType: "storefront",
  sections: [
    {
      id: "grocery-header",
      type: "header",
      variant: "searchFirst",
      enabled: true,
      order: 1,
      settings: {
        sticky: true,
        showSearch: true,
      },
    },
    {
      id: "grocery-hero",
      type: "hero",
      variant: "offerBanner",
      enabled: true,
      order: 2,
      settings: {
        title: "Fresh groceries delivered fast",
      },
    },
    {
      id: "grocery-categories",
      type: "categories",
      variant: "leftSidebar",
      enabled: true,
      order: 3,
      settings: {},
    },
    {
      id: "grocery-products",
      type: "products",
      variant: "compactCards",
      enabled: true,
      order: 4,
      settings: {
        limit: 8,
        source: "featured",
      },
    },
    {
      id: "grocery-promo",
      type: "promo",
      variant: "couponStrip",
      enabled: true,
      order: 5,
      settings: {},
    },
    {
      id: "grocery-footer",
      type: "footer",
      variant: "serviceFocused",
      enabled: true,
      order: 6,
      settings: {},
    },
  ],
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("tenant_store_design", [
      {
        tenant_store_design_id: uuidv4(),

        theme_id: themeConfig.id,
        layout_id: layoutConfig.id,
        template_id: templateConfig.id,

        theme_config: JSON.stringify(themeConfig),
        layout_config: JSON.stringify(layoutConfig),
        template_config: JSON.stringify(templateConfig),

        status: "ACTIVE",
        isActive: true,
        isDeleted: false,

        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      "tenant_store_design",
      {
        theme_id: themeConfig.id,
        layout_id: layoutConfig.id,
        template_id: templateConfig.id,
      },
      {},
    );
  },
};
