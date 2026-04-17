const boxedSidebarPreview = {
  nav: "sidebar",
  hero: "offer",
  sections: ["categories", "products", "promo"],
  productCards: 8,
};

const topNavPreview = {
  nav: "top",
  hero: "wide",
  sections: ["categories", "products", "promo"],
  productCards: 4,
};

export const layouts = {
  classicStorefront: {
    id: "ClassicStorefront",
    name: "Classic Storefront",
    description: "Boxed shell with top navigation and balanced content bands.",
    shell: "default",
    contentWidth: "boxed",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: false, placement: "left", source: "categories" },
    preview: topNavPreview,
  },

  modernMarketplace: {
    id: "ModernMarketplace",
    name: "Modern Marketplace",
    description: "Wide marketplace shell for search-led browsing.",
    shell: "marketplace",
    contentWidth: "wide",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: false, placement: "left", source: "categories" },
    preview: {
      nav: "search",
      hero: "split",
      sections: ["deals", "categories", "products"],
      productCards: 5,
    },
  },

  fashionEditorial: {
    id: "FashionEditorial",
    name: "Fashion Editorial",
    description: "Narrow editorial shell for visual storytelling.",
    shell: "editorial",
    contentWidth: "wide",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: false, placement: "left", source: "categories" },
    preview: {
      nav: "minimal",
      hero: "editorial",
      sections: ["collections", "products", "lookbook"],
      productCards: 6,
    },
  },

  groceryQuickShop: {
    id: "GroceryQuickShop",
    name: "Grocery Quick Shop",
    description: "Boxed grocery shell with category sidebar.",
    shell: "default",
    contentWidth: "boxed",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: true, placement: "left", source: "categories" },
    preview: boxedSidebarPreview,
  },

  electronicsHub: {
    id: "ElectronicsHub",
    name: "Electronics Hub",
    description: "Wide shell for specs-heavy catalogs and category browsing.",
    shell: "marketplace",
    contentWidth: "wide",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: false, placement: "left", source: "categories" },
    preview: {
      nav: "mega",
      hero: "carousel",
      sections: ["categories", "deals", "products"],
      productCards: 6,
    },
  },

  luxuryBoutique: {
    id: "LuxuryBoutique",
    name: "Luxury Boutique",
    description: "Narrow premium shell with focused browsing.",
    shell: "editorial",
    contentWidth: "narrow",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: false, placement: "left", source: "categories" },
    preview: {
      nav: "centerLogo",
      hero: "immersive",
      sections: ["story", "collections", "products"],
      productCards: 3,
    },
  },

  dealsOutlet: {
    id: "DealsOutlet",
    name: "Deals Outlet",
    description: "Wide promotional shell for flash-sale browsing.",
    shell: "promo",
    contentWidth: "wide",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: false, placement: "left", source: "categories" },
    preview: {
      nav: "promo",
      hero: "deal",
      sections: ["countdown", "deals", "products"],
      productCards: 6,
    },
  },

  brandStoryShop: {
    id: "BrandStoryShop",
    name: "Brand Story Shop",
    description: "Editorial shell for story-led commerce.",
    shell: "story",
    contentWidth: "boxed",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: false, placement: "left", source: "categories" },
    preview: {
      nav: "transparent",
      hero: "story",
      sections: ["story", "products", "newsletter"],
      productCards: 4,
    },
  },

  catalogGrid: {
    id: "CatalogGrid",
    name: "Catalog Grid",
    description: "Dense catalog shell with filter/sidebar space.",
    shell: "catalog",
    contentWidth: "wide",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: true, placement: "left", source: "filters" },
    preview: {
      nav: "filters",
      hero: "compact",
      sections: ["filters", "products", "pagination"],
      productCards: 9,
    },
  },

  socialProofShop: {
    id: "SocialProofShop",
    name: "Social Proof Shop",
    description: "Boxed shell for trust-led product discovery.",
    shell: "default",
    contentWidth: "boxed",
    headerPlacement: "top",
    footerPlacement: "bottom",
    sidebar: { enabled: false, placement: "left", source: "categories" },
    preview: {
      nav: "top",
      hero: "reviews",
      sections: ["bestsellers", "reviews", "products"],
      productCards: 4,
    },
  },
};

export default layouts;
