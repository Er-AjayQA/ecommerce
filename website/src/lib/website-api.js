import axios from "axios";
import { normalizeLayoutConfig } from "@/lib/store-design";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.STORE_API_URL ||
  "http://localhost:5000/api/v1/website";

const APP_API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_API_BASE_URL ||
  API_BASE_URL.replace(/\/website\/?$/, "");

export function getTenantDomain(host) {
  return (
    process.env.NEXT_PUBLIC_TENANT_DOMAIN ||
    process.env.STORE_TENANT_DOMAIN ||
    host ||
    ""
  );
}

async function websiteRequest(path, { host, searchParams } = {}) {
  const tenantDomain = getTenantDomain(host);
  const response = await axios.get(`${API_BASE_URL}${path}`, {
    params: searchParams,
    headers: tenantDomain
      ? {
          "x-tenant-domain": tenantDomain,
        }
      : undefined,
  });

  return response.data;
}

async function websitePost(path, body, { host } = {}) {
  const tenantDomain = getTenantDomain(host);
  const response = await axios.post(`${API_BASE_URL}${path}`, body, {
    headers: tenantDomain
      ? {
          "x-tenant-domain": tenantDomain,
        }
      : undefined,
  });

  return response.data;
}

async function appRequest(path, { host, token, method = "GET", body } = {}) {
  const tenantDomain = getTenantDomain(host);
  const response = await axios({
    url: `${APP_API_BASE_URL}${path}`,
    method,
    data: body,
    headers: {
      ...(tenantDomain ? { "x-tenant-domain": tenantDomain } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return response.data;
}

async function safeFetch(path, options, fallback) {
  try {
    const result = await websiteRequest(path, options);
    return result?.data ?? fallback;
  } catch {
    return fallback;
  }
}

function parseConfig(value, fallback) {
  if (!value) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isVisible(item) {
  if (!item) return false;
  if (item.isDeleted === true || item.isDeleted === 1) return false;
  if (item.isActive === false || item.isActive === 0) return false;
  if (item.status && !["ACTIVE", "PUBLISHED"].includes(item.status)) return false;
  return true;
}

function isUsableChildItem(item) {
  if (!item) return false;
  if (item.isDeleted === true || item.isDeleted === 1) return false;
  if (item.isActive === false || item.isActive === 0) return false;
  return true;
}

function isUsableMedia(item) {
  if (!item) return false;
  if (item.isDeleted === true || item.isDeleted === 1) return false;
  return true;
}

function normalizeDesign(design) {
  if (!design) return null;

  return {
    ...design,
    theme_config: parseConfig(design?.theme_config, {}),
    layout_config: normalizeLayoutConfig(
      parseConfig(design?.layout_config, {})
    ),
    template_config: parseConfig(design?.template_config, {}),
  };
}

export async function getActiveStoreDesign(host) {
  const design = await safeFetch(
    "/getActiveStoreDesign",
    { host },
    null
  );

  return normalizeDesign(design);
}

export async function getActiveTheme(host) {
  return safeFetch("/get_active_theme", { host }, null);
}

export async function getActiveLayout(host) {
  return safeFetch("/get_active_layout", { host }, null);
}

export async function getActiveTemplate(host) {
  return safeFetch("/get_active_template", { host }, null);
}

export async function getWebsiteProducts(host, { limit = 12, page = 1, search = "" } = {}) {
  try {
    const result = await websiteRequest("/get_All_Product", {
      host,
      searchParams: {
        page,
        limit,
        statusBy: "PUBLISHED",
        ...(search ? { search } : {}),
      },
    });

    return {
      items: asArray(result?.data),
      total: result?.total || result?.totalRecords || 0,
      currentPage: result?.currentPage || 1,
      totalPages: result?.totalPages || 1,
    };
  } catch {
    return {
      items: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
    };
  }
}

export async function getWebsiteProduct(host, id) {
  const product = await safeFetch(`/get_ById_Product/${id}`, { host }, null);
  return isVisible(product) ? product : null;
}

export async function getWebsiteCategories(host) {
  return safeFetch("/get_All_Category", { host }, []);
}

export async function getWebsiteMenus(host) {
  return safeFetch(
    "/get_All_Menus",
    {
      host,
      searchParams: {
        page: 1,
        limit: 50,
        statusBy: "PUBLISHED",
      },
    },
    []
  );
}

export async function getWebsiteCollections(host) {
  try {
    const result = await websiteRequest("/get_All_Collections", {
      host,
      searchParams: {
        page: 1,
        limit: 20,
        statusBy: "PUBLISHED",
      },
    });

    return {
      items: asArray(result?.data),
      total: result?.total || result?.totalRecords || 0,
      currentPage: result?.currentPage || 1,
      totalPages: result?.totalPages || 1,
    };
  } catch {
    return {
      items: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
    };
  }
}

export function normalizeCategoryOption(category) {
  if (!category) return null;

  const id =
    category.category_id ||
    category.id ||
    category.product_code ||
    category.code ||
    category.category_name;
  const name = category.category_name || category.name || "";

  if (!id || !name) return null;

  return {
    id,
    code: category.code || category.product_code || "",
    name,
  };
}

export function normalizeCollectionOption(collection) {
  if (!collection) return null;

  const id = collection.collection_id || collection.id || collection.code || collection.title;
  const title = collection.title || collection.name || "";

  if (!id || !title) return null;

  return {
    id,
    code: collection.code || "",
    title,
  };
}

export async function getWebsiteCollection(host, id) {
  const collection = await safeFetch(`/get_ById_Collections/${id}`, { host }, null);
  return isVisible(collection) ? collection : null;
}

export async function getWebsiteCollectionProducts(host, id, { limit = 200 } = {}) {
  try {
    const result = await websiteRequest(`/get_Collection_Products/${id}`, {
      host,
      searchParams: {
        page: 1,
        limit,
        statusBy: "PUBLISHED",
      },
    });

    return {
      items: asArray(result?.data),
      total: result?.total || result?.totalRecords || 0,
      currentPage: result?.currentPage || 1,
      totalPages: result?.totalPages || 1,
    };
  } catch {
    return {
      items: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
    };
  }
}

export async function validateWebsiteCoupon(host, { couponCode, subTotal }) {
  const result = await websitePost(
    "/validate_Coupon",
    {
      couponCode,
      subTotal,
    },
    { host }
  );

  return result?.data || null;
}

export async function sendCustomerOtp(host, payload) {
  const result = await appRequest("/tenants/send_Customer_Otp", {
    host,
    method: "POST",
    body: payload,
  });

  return result?.data || null;
}

export async function verifyCustomerOtp(host, payload) {
  const result = await appRequest("/tenants/verify_Customer_Otp", {
    host,
    method: "POST",
    body: payload,
  });

  return result?.data || null;
}

export async function getCustomerCart(host, token) {
  const result = await appRequest("/get_ById_Cart", { host, token });
  return result?.data || null;
}

export async function addCustomerCartItem(host, token, item) {
  const result = await appRequest("/add_To_Cart", {
    host,
    token,
    method: "POST",
    body: item,
  });

  return result?.data || null;
}

export async function updateCustomerCartItem(host, token, cartItemId, quantity) {
  const result = await appRequest(`/update_Cart_Item/${cartItemId}`, {
    host,
    token,
    method: "PUT",
    body: { quantity },
  });

  return result?.data || null;
}

export async function removeCustomerCartItem(host, token, cartItemId) {
  const result = await appRequest(`/remove_Cart_Item/${cartItemId}`, {
    host,
    token,
    method: "DELETE",
  });

  return result?.data || null;
}

export async function applyCustomerCartCoupon(host, token, couponCode) {
  const result = await appRequest("/cart/apply-coupon", {
    host,
    token,
    method: "POST",
    body: { couponCode },
  });

  return result?.data || null;
}

export async function removeCustomerCartCoupon(host, token) {
  const result = await appRequest("/cart/remove-coupon", {
    host,
    token,
    method: "DELETE",
  });

  return result?.data || null;
}

export async function clearCustomerCart(host, token) {
  await appRequest("/clear_Cart", {
    host,
    token,
    method: "DELETE",
  });
  return null;
}

export async function getCustomerAddresses(host, token) {
  const result = await appRequest("/get_All_Addresses", { host, token });
  return asArray(result?.data);
}

export async function addCustomerAddress(host, token, address) {
  const result = await appRequest("/add_Address", {
    host,
    token,
    method: "POST",
    body: address,
  });

  return result?.data || null;
}

export async function placeCustomerOrder(host, token, payload) {
  const result = await appRequest("/place_Order", {
    host,
    token,
    method: "POST",
    body: payload,
  });

  return result?.data || null;
}

function sortByPosition(items = []) {
  return items
    .slice()
    .sort((a, b) => (a.position || a.order_by || 0) - (b.position || b.order_by || 0));
}

function getImagesFromMedia(media = []) {
  return sortByPosition(media)
    .filter((item) => item.type !== "video" && item.url && isUsableMedia(item))
    .map((item) => item.url);
}

function getImageFromMedia(media = []) {
  return getImagesFromMedia(media)[0] || null;
}

function getActiveVariants(product) {
  return asArray(product?.variants)
    .filter(isVisible)
    .sort((a, b) => (a.order_by || 0) - (b.order_by || 0));
}

function getProductPrice(product, variants = getActiveVariants(product)) {
  const variant = variants[0];
  const price = variant?.price ?? product?.price;

  if (price === undefined || price === null || price === "") {
    return "";
  }

  return `$${Number(price).toFixed(2)}`;
}

function getProductPriceRange(variants = []) {
  const prices = variants
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price));

  if (prices.length === 0) return "";

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return `$${min.toFixed(2)}`;
  }

  return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
}

function normalizeOption(option) {
  return {
    id: option.product_option_id,
    name: option.name || "",
    values: asArray(option.OptionValues || option.OptionValue || option.optionValues)
      .filter(isVisible)
      .slice()
      .sort((a, b) => (a.order_by || 0) - (b.order_by || 0))
      .map((value) => ({
        id: value.option_value_id,
        value: value.value || "",
      })),
  };
}

function normalizeTag(tagItem) {
  const tag = tagItem?.tag || tagItem;
  const id = tag?.tag_id || tagItem?.tag_id || tag?.id || tag?.code || tag?.tag_name;
  const name = tag?.tag_name || tag?.name || tag?.title || "";

  if (!id || !name) return null;

  return {
    id,
    code: tag?.code || "",
    name,
  };
}

export function normalizeProduct(product) {
  if (!product) return null;

  const variants = getActiveVariants(product);
  const images = getImagesFromMedia(product.media);
  const detailHref = `/products/${product.code || product.product_id || product.id}`;

  return {
    id: product.product_id || product.id || product.title,
    code: product.code || "",
    href: detailHref,
    name: product.title || product.name || "",
    description: product.description || "",
    sku: product.sku || "",
    price: getProductPrice(product, variants),
    priceRange: getProductPriceRange(variants),
    tag: product.category?.category_name || product.product_types?.name || "",
    vendor: product.vendors?.vendor_name || "",
    productType: product.product_types?.product_type_name || "",
    productTypeId: product.product_types?.product_type_id || product.product_type_id || "",
    productTypeCode: product.product_types?.code || "",
    categoryId: product.category?.category_id || product.category_id || "",
    categoryCode: product.category?.code || product.category?.product_code || "",
    category: product.category?.category_name || "",
    image: getImageFromMedia(product.media),
    images,
    variants,
    options: asArray(product.options).filter(isVisible).map(normalizeOption),
    tags: asArray(product.tags)
      .filter(isVisible)
      .map(normalizeTag)
      .filter(Boolean),
    collections: asArray(product.collectionProducts)
      .map((item) => item.collection)
      .filter(isVisible)
      .filter(Boolean)
      .map(normalizeCollectionOption)
      .filter(Boolean),
    raw: product,
  };
}

function flattenCategories(items = [], result = []) {
  items.forEach((item) => {
    if (!isVisible(item)) return;
    result.push(item);
    flattenCategories(item.children || [], result);
  });

  return result;
}

function normalizeCategory(category) {
  return {
    id: category.category_id || category.product_code || category.category_name,
    name: category.category_name || category.name || "",
    count: category.children?.length
      ? `${category.children.length} sub categories`
      : "",
    image: getImageFromMedia(category.media),
  };
}

function normalizeMenuItems(items = []) {
  return items
    .filter(isUsableChildItem)
    .slice()
    .sort((a, b) => (a.order_by || 0) - (b.order_by || 0))
    .map((item) => {
      const href = item.menu_link || item.href || "#";

      return {
        label: item.menu_label || item.label || item.name,
        href,
        type: href === "__newsletter" ? "newsletter" : "link",
        children: normalizeMenuItems(item.children || []),
      };
    });
}

function findMenuByName(menus, names) {
  return menus.find((menu) => {
    const menuName = String(menu.name || "").toLowerCase();
    return names.some((name) => menuName.includes(name));
  });
}

function normalizeMenus(menus = []) {
  const activeMenus = menus.filter(isVisible);
  const headerMenu = findMenuByName(activeMenus, ["header", "main", "top"]);
  const footerMenu = findMenuByName(activeMenus, ["footer"]);
  const sidebarMenu = findMenuByName(activeMenus, ["sidebar", "category", "side"]);
  const firstMenu = activeMenus.find((menu) => menu?.menuItems?.length);

  return {
    header: (headerMenu || firstMenu)?.menuItems?.length
      ? normalizeMenuItems((headerMenu || firstMenu).menuItems)
      : [],
    footer: footerMenu?.menuItems?.length
      ? normalizeMenuItems(footerMenu.menuItems)
      : [],
    sidebar: sidebarMenu?.menuItems?.length
      ? normalizeMenuItems(sidebarMenu.menuItems)
      : [],
  };
}

function normalizeCollection(collection) {
  return {
    id: collection.collection_id || collection.id || collection.title,
    href: `/collections/${collection.code || collection.collection_id || collection.id}`,
    title: collection.title || "",
    description: collection.description || "",
    image: getImageFromMedia(collection.media),
    products: asArray(collection.products).filter(isVisible),
    raw: collection,
  };
}

export async function getStorefrontData(host) {
  const [design, products, categories, menus, collections] = await Promise.all([
    getActiveStoreDesign(host),
    getWebsiteProducts(host, { limit: 12 }),
    getWebsiteCategories(host),
    getWebsiteMenus(host),
    getWebsiteCollections(host),
  ]);

  const safeProducts = asArray(products.items).filter(isVisible);
  const safeCategories = asArray(categories);
  const safeCollections = asArray(collections.items).filter(isVisible);
  const flatCategories = flattenCategories(safeCategories);

  return {
    design,
    products: safeProducts.map(normalizeProduct).filter(Boolean),
    productPage: {
      total: products.total,
      currentPage: products.currentPage,
      totalPages: products.totalPages,
    },
    categories: flatCategories.slice(0, 6).map(normalizeCategory),
    menus: normalizeMenus(asArray(menus)),
    collections: safeCollections.map(normalizeCollection),
    collectionPage: {
      total: collections.total,
      currentPage: collections.currentPage,
      totalPages: collections.totalPages,
    },
  };
}
