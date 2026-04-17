const db = require("../../../../../indexRoutes/index");
const generateCode = require("../../../../../utils/generateCode");
const Tag = db.Tag;
const { handleDatabaseError } = require("../../../../../utils/errorHandler");

exports.create_tags = async (req, res) => {
  try {
    const { tag_name } = req.body;

    const exist = await Tag.findOne({
      where: {
        tag_name,
        isDeleted: false,
      },
    });

    if (exist) {
      return res.status(409).json({
        success: false,
        message: "Tag already exists",
      });
    }

    const code = await generateCode(Tag, tag_name, "code");

    const data = await Tag.create({
      tag_name,
      code: code,
    });

    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).json(formattedError);
  }
};

exports.getAll_tags = async (req, res) => {
  try {
    const data = await Tag.findAll({
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

exports.getById_tags = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Tag.findOne({
      where: { tag_id: id, isDeleted: false },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
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
