const db = require("../../../../../indexRoutes/index");
const generateCode = require("../../../../../utils/generateCode");
const Vendor = db.Vendor;
const { handleDatabaseError } = require("../../../../../utils/errorHandler");

exports.create_vendors = async (req, res) => {
  try {
    const { vendor_name } = req.body;

    // prevent duplicate vendor
    const exist = await Vendor.findOne({
      where: {
        vendor_name,
        isDeleted: false,
      },
    });

    if (exist) {
      return res.status(409).json({
        success: false,
        message: "vendor already exists",
      });
    }

    const code = await generateCode(Vendor, vendor_name, "code");

    const data = await Vendor.create({
      vendor_name,
      code: code,
    });

    return res.status(201).json({
      success: true,
      message: "vendor created successfully",
      data,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).json(formattedError);
  }
};

exports.getAll_vendors = async (req, res) => {
  try {
    const data = await Vendor.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).json(formattedError);
  }
};

exports.getById_vendors = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Vendor.findOne({
      where: { vendor_id: id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "vendor not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).json(formattedError);
  }
};
