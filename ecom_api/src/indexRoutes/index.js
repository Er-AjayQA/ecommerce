"use strict";

require("dotenv").config();
const { Sequelize } = require("sequelize");
const asyncLocalStorage = require("../utils/tenantContext");

const commonConfig = {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// 1. MAIN SEQUELIZE: FOR GLOBAL METADATA (Tenants, TenantUsers)
const mainSequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  commonConfig,
);

// 2. DYNAMIC SEQUELIZE: FOR TENANT-SPECIFIC DATA
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  commonConfig,
);

const originalQuery = sequelize.query.bind(sequelize);
sequelize.query = async function (...args) {
  const store = asyncLocalStorage.getStore();
  if (store && store.tenantDB) {
    return store.tenantDB.query(...args);
  }
  return originalQuery(...args);
};

const originalTransaction = sequelize.transaction.bind(sequelize);
sequelize.transaction = async function (...args) {
  const store = asyncLocalStorage.getStore();
  if (store && store.tenantDB) {
    return store.tenantDB.transaction(...args);
  }
  return originalTransaction(...args);
};

const db = {};

db.sequelize = sequelize;
db.mainSequelize = mainSequelize;
db.Sequelize = Sequelize;

db.Tenant = require("../modules/Admin/Tenants/models/Tenant.js")(
  mainSequelize,
  Sequelize,
);
db.TenantUser = require("../modules/Admin/Tenants/models/TenantUser.js")(
  mainSequelize,
  Sequelize,
);
db.CartModels = require("../modules/Users/Cart/models/cart.model.js")(
  sequelize,
  Sequelize,
);
db.CartItemModels = require("../modules/Users/Cart/models/cartItems.model.js")(
  sequelize,
  Sequelize,
);
db.UserModels = require("../modules/Users/Users/models/users.models.js")(
  sequelize,
  Sequelize,
);
db.Category =
  require("../modules/Admin/masters/Category/models/category.models.js")(
    sequelize,
    Sequelize,
  );
db.Product = require("../modules/Admin/Product/models/Product.model.js")(
  sequelize,
  Sequelize,
);
db.ProductMedia =
  require("../modules/Admin/Product/models/ProductMedia.model.js")(
    sequelize,
    Sequelize,
  );
db.ProductVariant =
  require("../modules/Admin/Product/models/ProductVariant.model.js")(
    sequelize,
    Sequelize,
  );
db.ProductOption =
  require("../modules/Admin/Product/models/ProductOption.model.js")(
    sequelize,
    Sequelize,
  );
db.Tag = require("../modules/Admin/masters/Tags/models/tag.model.js")(
  sequelize,
  Sequelize,
);
db.ProductTag = require("../modules/Admin/Product/models/product_tag.model.js")(
  sequelize,
  Sequelize,
);
db.ProductSEO = require("../modules/Admin/Product/models/ProductSEO.model.js")(
  sequelize,
  Sequelize,
);
db.InventoryItem =
  require("../modules/Admin/Product/models/InventoryItem.model.js")(
    sequelize,
    Sequelize,
  );
db.OptionValue =
  require("../modules/Admin/Product/models/OptionValue.model.js")(
    sequelize,
    Sequelize,
  );
db.InventoryLevel =
  require("../modules/Admin/Product/models/InventoryLevel.model.js")(
    sequelize,
    Sequelize,
  );
db.ProductChannel =
  require("../modules/Admin/Product/models/ProductChannel.model.js")(
    sequelize,
    Sequelize,
  );
db.ShippingProfile =
  require("../modules/Admin/Product/models/ShippingProfile.model.js")(
    sequelize,
    Sequelize,
  );
db.Collection =
  require("../modules/Admin/masters/Collections/models/collection.model.js")(
    sequelize,
    Sequelize,
  );
db.CollectionProduct =
  require("../modules/Admin/masters/Collections/models/CollectionProduct.model.js")(
    sequelize,
    Sequelize,
  );
db.CollectionMedia =
  require("../modules/Admin/masters/Collections/models/CollectionMedia.model.js")(
    sequelize,
    Sequelize,
  );
db.CollectionConditions =
  require("../modules/Admin/masters/Collections/models/collectionConditions.model.js")(
    sequelize,
    Sequelize,
  );
db.Vendor = require("../modules/Admin/masters/Vendors/models/vendor.model.js")(
  sequelize,
  Sequelize,
);
db.ProductType =
  require("../modules/Admin/masters/Product_Types/models/product_type.model.js")(
    sequelize,
    Sequelize,
  );
db.VariantOptionValue =
  require("../modules/Admin/Product/models/VariantOptionValue.model.js")(
    sequelize,
    Sequelize,
  );
db.Menu = require("../modules/Admin/Menus/models/menus.model.js")(
  sequelize,
  Sequelize,
);
db.MenuItem = require("../modules/Admin/Menus/models/menu_item.model.js")(
  sequelize,
  Sequelize,
);
db.TenantDomain =
  require("../modules/Admin/Domain/models/TenantDomain.model.js")(
    sequelize,
    Sequelize,
  );
db.TenantDomainDnsRecord =
  require("../modules/Admin/Domain/models/TenantDomainDnsRecord.model.js")(
    sequelize,
    Sequelize,
  );
db.WishlistModels =
  require("../modules/Users/Wishlist/models/wishlist.model.js")(
    sequelize,
    Sequelize,
  );
db.AddressModels =
  require("../modules/Users/Addresses/models/address.model.js")(
    sequelize,
    Sequelize,
  );
db.OrderModels = require("../modules/Users/Orders/models/order.model.js")(
  sequelize,
  Sequelize,
);
db.OrderItemModels =
  require("../modules/Users/Orders/models/orderItem.model.js")(
    sequelize,
    Sequelize,
  );
db.OrderTrackingEventModels =
  require("../modules/Users/Orders/models/orderTrackingEvent.model.js")(
    sequelize,
    Sequelize,
  );
db.CouponModels = require("../modules/Admin/Coupons/models/coupon.model.js")(
  sequelize,
  Sequelize,
);
db.CouponUsageModels =
  require("../modules/Admin/Coupons/models/couponUsage.model.js")(
    sequelize,
    Sequelize,
  );
db.NotificationModels =
  require("../modules/Users/Notifications/models/notification.model.js")(
    sequelize,
    Sequelize,
  );
db.InvoiceModels = require("../modules/Users/Invoices/models/invoice.model.js")(
  sequelize,
  Sequelize,
);
db.TenantStoreDesignModel =
  require("../modules/Admin/TenantsThemes/models/TenantStoreDesign.js")(
    sequelize,
    Sequelize,
  );

// ✅ ASSOCIATIONS
Object.keys(db).forEach((modelName) => {
  if (db[modelName]?.associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
