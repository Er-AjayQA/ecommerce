const { Op, DataTypes } = require("sequelize");
const db = require("../../../../indexRoutes/index");
const TenantLayoutModel = db.TenantLayoutModel;
const TenantStoreDesignModel = db.TenantStoreDesignModel;

function validateRequest(schema, payload) {
  const { error, value } = schema.validate(payload, {
    abortEarly: true,
    stripUnknown: true,
  });
  if (error) {
    return {
      isValid: false,
      message: error.details[0]?.message || "Validation failed",
    };
  }
  return { isValid: true, value };
}

const ACTIVE_WHERE = {
  isActive: true,
  isDeleted: false,
  status: "ACTIVE",
};

const findOrCreateStoreDesign = async () => {
  let storeDesign = await TenantStoreDesignModel.findOne({
    where: ACTIVE_WHERE,
    order: [["createdAt", "DESC"]],
  });

  if (!storeDesign) {
    storeDesign = await TenantStoreDesignModel.create({
      status: "ACTIVE",
      isActive: true,
      isDeleted: false,
    });
  }

  return storeDesign;
};

const normalizeThemeResponse = (storeDesign) => {
  if (!storeDesign?.theme_config) return null;

  return {
    theme_id: storeDesign.theme_id,
    ...storeDesign.theme_config,
  };
};

const normalizeLayoutResponse = (storeDesign) => {
  if (!storeDesign?.layout_config) return null;

  return {
    layout_id: storeDesign.layout_id,
    ...storeDesign.layout_config,
  };
};

const normalizeTemplateResponse = (storeDesign) => {
  if (!storeDesign?.template_config) return null;

  return {
    template_id: storeDesign.template_id,
    ...storeDesign.template_config,
  };
};

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

//////////////////// THEME CONTROLLER ////////////////////
exports.apply_theme = async (req, res) => {
  try {
    const theme = req.body;

    if (!theme?.id) {
      return res.status(400).json({
        success: false,
        message: "Theme id is required",
      });
    }

    const storeDesign = await findOrCreateStoreDesign();

    await storeDesign.update({
      theme_id: theme.id,
      theme_config: theme,
      status: "ACTIVE",
      isActive: true,
      isDeleted: false,
    });

    return res.status(201).send({
      success: true,
      code: 200,
      message: "Theme applied successfully",
      data: normalizeThemeResponse(storeDesign),
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_active_theme = async (req, res) => {
  try {
    const storeDesign = await TenantStoreDesignModel.findOne({
      where: ACTIVE_WHERE,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Fetched applied theme",
      data: normalizeThemeResponse(storeDesign),
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// LAYOUT CONTROLLER ////////////////////
exports.apply_layout = async (req, res) => {
  try {
    const layout = req.body;

    if (!layout?.id) {
      return res.status(400).json({
        success: false,
        message: "Layout id is required",
      });
    }

    const storeDesign = await findOrCreateStoreDesign();

    await storeDesign.update({
      layout_id: layout.id,
      layout_config: layout,
      status: "ACTIVE",
      isActive: true,
      isDeleted: false,
    });

    return res.status(201).send({
      success: true,
      code: 200,
      message: "Layout applied successfully",
      data: normalizeLayoutResponse(storeDesign),
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_active_layout = async (req, res) => {
  try {
    const storeDesign = await TenantStoreDesignModel.findOne({
      where: ACTIVE_WHERE,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Fetched applied layout",
      data: normalizeLayoutResponse(storeDesign),
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// TEMPLATE CONTROLLER ////////////////////
exports.apply_template = async (req, res) => {
  try {
    const template = req.body;

    const templateId = template?.id || template?.template_id;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: "Template id is required",
      });
    }

    if (!Array.isArray(template.sections)) {
      return res.status(400).json({
        success: false,
        message: "Template sections are required",
      });
    }

    const storeDesign = await findOrCreateStoreDesign();

    await storeDesign.update({
      template_id: templateId,
      template_config: {
        ...template,
        template_id: templateId,
      },
      status: "ACTIVE",
      isActive: true,
      isDeleted: false,
    });

    return res.status(201).send({
      success: true,
      code: 200,
      message: "Template applied successfully",
      data: normalizeTemplateResponse(storeDesign),
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.get_active_template = async (req, res) => {
  try {
    const storeDesign = await TenantStoreDesignModel.findOne({
      where: ACTIVE_WHERE,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Fetched applied template",
      data: normalizeTemplateResponse(storeDesign),
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.getActiveStoreDesign = async (req, res) => {
  try {
    const storeDesign = await TenantStoreDesignModel.findOne({
      where: ACTIVE_WHERE,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Active store design fetched successfully",
      data: storeDesign,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.resetStoreDesign = async (req, res) => {
  try {
    const storeDesign = await TenantStoreDesignModel.findOne({
      where: ACTIVE_WHERE,
      order: [["createdAt", "DESC"]],
    });

    if (!storeDesign) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Active store design not found",
      });
    }

    await storeDesign.update({
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
    });

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Store design reset successfully",
      data: storeDesign,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
