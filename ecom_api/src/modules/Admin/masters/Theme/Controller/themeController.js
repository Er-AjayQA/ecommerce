const db = require("../../../../../indexRoutes/index");
const ThemeModels = db.ThemeModels;
const generateCode = require("../../../../../utils/generateCode");

//////////////////// CREATE THEME ////////////////////

exports.create_Theme = async (req, res) => {
  try {
    const { theme_name, description, preview, config, code } = req.body;
    const exist = await ThemeModels.findOne({ where: { code } });
    if (exist) {
      return res.status(400).send({ success: false, code: 400, message: "Theme code already exists" });
    }
    const themeCode = await generateCode(ThemeModels, theme_name);
    const theme = await ThemeModels.create({
      theme_name,
      description,
      preview,
      config,
      code: themeCode,
    });
    return res.status(200).send({ success: true, code: 200, message: "Theme Created Successfully", data: theme });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({ success: false, code: 500, message: "Internal Server Error" });
  }
};

//////////////////// GET ALL THEME ////////////////////

exports.get_All_Themes = async (req, res) => {
  try {
    const getAllData = await ThemeModels.findAll({
      where: { isDeleted: false },
      order: [["order_by", "DESC"]],
    });

    return res.status(200).send({ success: true, code: 200, message: "Fetch All Theme Data Successfully", data: getAllData });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({ success: false, code: 500, message: "Internal Server Error" });
  }
};

//////////////////// GET BYID THEME ////////////////////

exports.get_ById_Theme = async (req, res) => {
  try {
    const themeId = req.params.id;
    const getData = await ThemeModels.findOne({ where: { theme_id: themeId } });
    if (!getData) {
      return res.status(404).send({ success: false, code: 404, message: "Theme not found" });
    }
    return res.status(200).send({ success: true, code: 200, message: "Fetch Theme Data Successfully", data: getData });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({ success: false, code: 500, message: "Internal Server Error" });
  }
};

//////////////////// UPDATE THEME ////////////////////

exports.update_Theme = async (req, res) => {
  try {
    const themeId = req.params.id;
    const { theme_name, description, preview, config, code } = req.body;
    const getData = await ThemeModels.findOne({ where: { theme_id: themeId } });

    if (!getData) {
      return res.status(404).send({ success: false, code: 404, message: "Theme not found" });
    }

    const updateData = await ThemeModels.update({
      theme_name,
      description,
      preview,
      config,
      code,
    }, { where: { theme_id: themeId } });
    return res.status(200).send({ success: true, code: 200, message: "Theme Update Successfully", data: updateData });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({ success: false, code: 500, message: "Internal Server Error" });
  }
};

//////////////////// DELETE THEME ////////////////////

exports.delete_Theme = async (req, res) => {
  try {
    const themeId = req.params.id;
    const theme = await ThemeModels.findOne({ where: { theme_id: themeId } });
    if (!theme) {
      return res.status(404).send({ success: false, code: 404, message: "Theme not found" });
    }
    await theme.update({ isDeleted: true, status: "INACTIVE" });
    return res.status(200).send({ success: true, code: 200, message: "Theme deleted successfully" });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({ success: false, code: 500, message: "Internal Server Error" });
  }
};

//////////////////// TOGGLE THEME STATUS ////////////////////

exports.toggle_Theme_Status = async (req, res) => {
  try {
    const themeId = req.params.id;
    const getData = await ThemeModels.findOne({ where: { theme_id: themeId } });
    if (!getData) {
      return res.status(404).send({ success: false, code: 404, message: "Theme not found" });
    }
    getData.status = getData.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await getData.save();
    return res.status(200).send({ success: true, code: 200, message: "Status Updated Successfully", data: getData });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).send({ success: false, code: 500, message: "Internal Server Error" });
  }
};