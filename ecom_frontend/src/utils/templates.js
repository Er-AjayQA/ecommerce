export const sectionVariants = {
  header: [
    { id: "classic", name: "Classic Header" },
    { id: "searchFirst", name: "Search First" },
    { id: "minimal", name: "Minimal Header" },
    { id: "promoTopbar", name: "Promo Topbar" },
    { id: "centerLogo", name: "Center Logo" },
  ],
  hero: [
    { id: "wideBanner", name: "Wide Banner" },
    { id: "offerBanner", name: "Offer Banner" },
    { id: "splitBanner", name: "Split Banner" },
    { id: "editorial", name: "Editorial Hero" },
    { id: "dealHero", name: "Deal Hero" },
  ],
  categories: [
    { id: "iconRow", name: "Icon Row" },
    { id: "imageTiles", name: "Image Tiles" },
    { id: "leftSidebar", name: "Left Sidebar" },
    { id: "megaMenu", name: "Mega Menu" },
    { id: "pillFilters", name: "Pill Filters" },
  ],
  products: [
    { id: "fourColumn", name: "Four Column" },
    { id: "compactCards", name: "Compact Cards" },
    { id: "dealCards", name: "Deal Cards" },
    { id: "masonry", name: "Masonry Cards" },
    { id: "filterGrid", name: "Filter Grid" },
  ],
  promo: [
    { id: "twoBanner", name: "Two Banner" },
    { id: "couponStrip", name: "Coupon Strip" },
    { id: "flashDeals", name: "Flash Deals" },
    { id: "testimonials", name: "Testimonials" },
    { id: "newsletter", name: "Newsletter" },
  ],
  footer: [
    { id: "multiColumn", name: "Multi Column" },
    { id: "serviceFocused", name: "Service Focused" },
    { id: "minimal", name: "Minimal Footer" },
    { id: "newsletter", name: "Newsletter Footer" },
    { id: "compact", name: "Compact Footer" },
  ],
};

export const templates = {
  groceryHome: {
    id: "GroceryHomeTemplate",
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
        settings: { sticky: true, showSearch: true },
      },
      {
        id: "grocery-hero",
        type: "hero",
        variant: "offerBanner",
        enabled: true,
        order: 2,
        settings: { title: "Fresh groceries delivered fast" },
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
        settings: { limit: 8, source: "featured" },
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
  },

  fashionHome: {
    id: "FashionHomeTemplate",
    name: "Fashion Home Template",
    description: "Editorial storefront with collection tiles and visual products.",
    templateType: "storefront",
    sections: [
      { id: "fashion-header", type: "header", variant: "minimal", enabled: true, order: 1, settings: {} },
      { id: "fashion-hero", type: "hero", variant: "editorial", enabled: true, order: 2, settings: { title: "New season arrivals" } },
      { id: "fashion-categories", type: "categories", variant: "imageTiles", enabled: true, order: 3, settings: {} },
      { id: "fashion-products", type: "products", variant: "masonry", enabled: true, order: 4, settings: { limit: 6 } },
      { id: "fashion-promo", type: "promo", variant: "testimonials", enabled: true, order: 5, settings: {} },
      { id: "fashion-footer", type: "footer", variant: "minimal", enabled: true, order: 6, settings: {} },
    ],
  },

  electronicsHome: {
    id: "ElectronicsHomeTemplate",
    name: "Electronics Home Template",
    description: "Search-heavy tech store with deals and product specifications.",
    templateType: "storefront",
    sections: [
      { id: "electronics-header", type: "header", variant: "searchFirst", enabled: true, order: 1, settings: { showSearch: true } },
      { id: "electronics-hero", type: "hero", variant: "splitBanner", enabled: true, order: 2, settings: { title: "Upgrade your setup" } },
      { id: "electronics-categories", type: "categories", variant: "megaMenu", enabled: true, order: 3, settings: {} },
      { id: "electronics-products", type: "products", variant: "filterGrid", enabled: true, order: 4, settings: { limit: 9 } },
      { id: "electronics-promo", type: "promo", variant: "flashDeals", enabled: true, order: 5, settings: {} },
      { id: "electronics-footer", type: "footer", variant: "multiColumn", enabled: true, order: 6, settings: {} },
    ],
  },

  luxuryHome: {
    id: "LuxuryHomeTemplate",
    name: "Luxury Home Template",
    description: "Premium homepage with immersive hero and curated sections.",
    templateType: "storefront",
    sections: [
      { id: "luxury-header", type: "header", variant: "centerLogo", enabled: true, order: 1, settings: {} },
      { id: "luxury-hero", type: "hero", variant: "wideBanner", enabled: true, order: 2, settings: { title: "Curated essentials" } },
      { id: "luxury-categories", type: "categories", variant: "imageTiles", enabled: true, order: 3, settings: {} },
      { id: "luxury-products", type: "products", variant: "fourColumn", enabled: true, order: 4, settings: { limit: 4 } },
      { id: "luxury-promo", type: "promo", variant: "newsletter", enabled: true, order: 5, settings: {} },
      { id: "luxury-footer", type: "footer", variant: "minimal", enabled: true, order: 6, settings: {} },
    ],
  },

  dealsHome: {
    id: "DealsHomeTemplate",
    name: "Deals Home Template",
    description: "Offer-led homepage with flash deals and bold product rows.",
    templateType: "storefront",
    sections: [
      { id: "deals-header", type: "header", variant: "promoTopbar", enabled: true, order: 1, settings: {} },
      { id: "deals-hero", type: "hero", variant: "dealHero", enabled: true, order: 2, settings: { title: "Deals ending soon" } },
      { id: "deals-categories", type: "categories", variant: "pillFilters", enabled: true, order: 3, settings: {} },
      { id: "deals-products", type: "products", variant: "dealCards", enabled: true, order: 4, settings: { limit: 6 } },
      { id: "deals-promo", type: "promo", variant: "flashDeals", enabled: true, order: 5, settings: {} },
      { id: "deals-footer", type: "footer", variant: "compact", enabled: true, order: 6, settings: {} },
    ],
  },

  catalogHome: {
    id: "CatalogHomeTemplate",
    name: "Catalog Home Template",
    description: "Product-heavy storefront with filters and dense browsing.",
    templateType: "storefront",
    sections: [
      { id: "catalog-header", type: "header", variant: "searchFirst", enabled: true, order: 1, settings: { sticky: true } },
      { id: "catalog-hero", type: "hero", variant: "wideBanner", enabled: true, order: 2, settings: { title: "Browse the full catalog" } },
      { id: "catalog-categories", type: "categories", variant: "leftSidebar", enabled: true, order: 3, settings: {} },
      { id: "catalog-products", type: "products", variant: "filterGrid", enabled: true, order: 4, settings: { limit: 9 } },
      { id: "catalog-promo", type: "promo", variant: "twoBanner", enabled: false, order: 5, settings: {} },
      { id: "catalog-footer", type: "footer", variant: "multiColumn", enabled: true, order: 6, settings: {} },
    ],
  },
};

export default templates;
