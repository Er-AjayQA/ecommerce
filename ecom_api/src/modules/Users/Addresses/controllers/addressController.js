const db = require("../../../../indexRoutes/index");
const AddressModels = db.AddressModels;
const { handleDatabaseError } = require("../../../../utils/errorHandler");
const generateCode = require("../../../../utils/generateCode");

//////////////////// ADD ADDRESS ////////////////////

exports.add_Address = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const userId = req.user.user_id;
        const { first_name, last_name, phone_number, address_line_1, address_line_2, country, city, state, postal_code, is_default, type } = req.body;

        if (is_default) {
            await AddressModels.update({ is_default: false }, { where: { user_id: userId, type }, transaction });
        } 
        const addressCode = await generateCode(AddressModels, first_name);
        const newAddress = await AddressModels.create({
            user_id: userId,
            first_name,
            last_name,
            phone_number,
            address_line_1,
            address_line_2,
            city,
            state,
            postal_code,
            country,
            type,
            is_default,
            code: addressCode
        }, { transaction });

        await transaction.commit();
        return res.status(200).send({ success: true, code: 200, message: "Address added successfully", data: newAddress });
    } catch (error) {
        await transaction.rollback();
        const formattedError = handleDatabaseError(error);
        return res.status(formattedError.code || 500).send(formattedError);
    }
};

//////////////////// GET ALL ADDRESS ////////////////////

exports.get_All_Addresses = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const addresses = await AddressModels.findAll({ where: { user_id: userId, isDeleted: false } });

        return res.status(200).send({ success: true, code: 200, message: "Addresses fetched successfully", data: addresses });
    } catch (error) {
        const formattedError = handleDatabaseError(error);
        return res.status(formattedError.code || 500).send(formattedError);
    }
};

//////////////////// DELETE ADDRESS ////////////////////

exports.delete_Address = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const userId = req.user.user_id;
        const addressId = req.params.id;

        const address = await AddressModels.findOne({ where: { address_id: addressId, user_id: userId }, transaction });
        if (!address) {
            await transaction.rollback();
            return res.status(404).send({ success: false, code: 404, message: "Address not found" });
        }

        await address.update({ isDeleted: true }, { transaction });

        await transaction.commit();
        return res.status(200).send({ success: true, code: 200, message: "Address deleted successfully" });
    } catch (error) {
        await transaction.rollback();
        const formattedError = handleDatabaseError(error);
        return res.status(formattedError.code || 500).send(formattedError);
    }
};