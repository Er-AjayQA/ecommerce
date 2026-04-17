const db = require("../../../../indexRoutes/index");
const { handleDatabaseError } = require("../../../../utils/errorHandler");

const NotificationModels = db.NotificationModels;

exports.get_User_Notifications = async (req, res) => {
  try {
    const notifications = await NotificationModels.findAll({
      where: { user_id: req.user.user_id },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).send({ success: true, code: 200, message: "Notifications fetched successfully", data: notifications });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};
