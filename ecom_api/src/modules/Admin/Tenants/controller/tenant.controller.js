const { Op, DataTypes } = require("sequelize");
const templateSequelize = require("../../../../config/templateDatabase");
const UsersModelFactory = require("../../../Users/Users/models/users.models");
const db = require("../../../../indexRoutes/index");
const UsersModels = db.UserModels;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Tenant = db.Tenant;
const TenantUser = db.TenantUser;
const {
  normalizeDomain,
  generateDatabaseName,
  generateOtp,
  addMinutes,
  createSequelizeConnection,
  closeSequelizeConnection,
  dropDatabaseIfExists,
} = require("../../../../utils/tenantHelpers");
const { getCurrentDnsValues } = require("../../../../utils/dnsLookup");
const { generateTxtToken } = require("../../../../utils/generateTxtToken");
const {
  registerTenantUserSchema,
  verifyOtpSchema,
  loginTenantUserSchema,
  addTenantUserSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  customerOtpRequestSchema,
  customerOtpVerifySchema,
} = require("../../../../dto/tenant.dto");
const { updateUserSchema } = require("../../../../dto/user.dto");
const { handleDatabaseError } = require("../../../../utils/errorHandler");

const TEMPLATE_DB = process.env.TEMPLATE_DB || "zyno_ecom_template";

const TemplateUsers = UsersModelFactory(templateSequelize, DataTypes);
const OTP_EXPIRY_MINUTES = 10;
const TRIAL_DAYS = 14;
const DEFAULT_USER_LIMIT = 10;
const DEFAULT_PACKAGE_ID = 1;

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
const isMobile = (value) => /^[0-9]{10,15}$/.test(String(value || ""));

function buildCustomerIdentifierWhere(identifier) {
  const normalizedIdentifier = String(identifier || "").trim().toLowerCase();

  if (isEmail(normalizedIdentifier)) {
    return { email_id: normalizedIdentifier };
  }

  if (isMobile(normalizedIdentifier)) {
    return { mobile_number: normalizedIdentifier };
  }

  return null;
}

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

//////////////////// REGISTER TENANT USER ////////////////////

exports.register_Tenant_User = async (req, res) => {
  try {
    const validation = validateRequest(registerTenantUserSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }
    const {
      organizationName,
      domain,
      name,
      email,
      phone,
      password,
      package_details,
    } = validation.value;

    const trimmedOrg = organizationName.trim();
    const trimmedDomain = normalizeDomain(domain);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = String(phone).trim();

    const existingCompletedUser = await TenantUser.findOne({
      where: {
        [Op.or]: [
          { email: trimmedEmail },
          { phone: trimmedPhone },
          { domain: trimmedDomain },
          { organizationName: trimmedOrg },
        ],
      },
    });

    if (existingCompletedUser) {
      return res.status(409).send({
        success: false,
        code: 409,
        message: "User/organization already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiresAt = addMinutes(new Date(), OTP_EXPIRY_MINUTES);

    const pendingUser = await TenantUser.findOne({
      where: {
        isDeleted: 0,
        completed: false,
        [Op.or]: [
          { email: trimmedEmail },
          { phone: trimmedPhone },
          { domain: trimmedDomain },
          { organizationName: trimmedOrg },
        ],
      },
    });

    if (pendingUser) {
      Object.assign(pendingUser, {
        organizationName: trimmedOrg,
        domain: trimmedDomain,
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        password: hashedPassword,
        package_details: package_details || null,
        otp,
        otpExpiresAt,
        otpAttempts: 0,
        otpVerifyStatus: false,
        completed: false,
        isActive: true,
      });

      await pendingUser.save();

      await TemplateUsers.create({
        name: trimmedName,
        email_id: trimmedEmail,
        password: hashedPassword,
        mobile_number: trimmedPhone,
        tenant_user_id: pendingUser.tenant_user_id,
        domain: trimmedDomain,
        isActive: true,
        isDeleted: false,
      });

      return res.status(200).send({
        success: true,
        code: 200,
        message: "OTP sent successfully",
        data: {
          tenant_user_id: pendingUser.tenant_user_id,
          email: pendingUser.email,
          otp,
        },
      });
    }

    const user = await TenantUser.create({
      organizationName: trimmedOrg,
      domain: trimmedDomain,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      password: hashedPassword,
      package_details: package_details || null,
      otp,
      otpExpiresAt,
      otpAttempts: 0,
      otpVerifyStatus: false,
      completed: false,
      isActive: true,
      isDeleted: false,
    });

    await TemplateUsers.create({
      name: trimmedName,
      email_id: trimmedEmail,
      password: hashedPassword,
      mobile_number: trimmedPhone,
      tenant_user_id: user.tenant_user_id,
      domain: trimmedDomain,
      isActive: true,
      isDeleted: false,
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "OTP sent successfully",
      data: {
        tenant_user_id: user.tenant_user_id,
        email: user.email,
        otp,
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// VERIFY OTP ////////////////////

exports.verify_Otp = async (req, res) => {
  try {
    const validation = validateRequest(verifyOtpSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }
    const { email, otp } = validation.value;

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await TenantUser.findOne({
      where: { email: normalizedEmail, isDeleted: 0 },
    });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "User not found" });
    }
    if (user.completed) {
      return res
        .status(200)
        .send({ success: true, code: 200, message: "Tenant already created" });
    }
    if (!user.password) {
      return res.status(400).send({
        success: false,
        code: 400,
        message: "Password not found for this user. Please register again.",
      });
    }
    if (!user.otp) {
      return res.status(400).send({
        success: false,
        code: 400,
        message: "No OTP found. Please request a new OTP.",
      });
    }
    if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
      return res.status(410).send({
        success: false,
        code: 410,
        message: "OTP expired. Please resend OTP.",
      });
    }
    if ((user.otpAttempts || 0) >= 5) {
      return res.status(429).send({
        success: false,
        code: 429,
        message: "Maximum OTP attempts exceeded. Please resend OTP.",
      });
    }

    if (String(user.otp) !== String(otp)) {
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      return res
        .status(409)
        .send({ success: false, code: 409, message: "Invalid OTP" });
    }

    user.otpVerifyStatus = true;
    user.status = "processing";
    user.otpAttempts = 0;
    await user.save();

    const result = await createTenantBackground(user, res);

    if (!result.success) {
      await TenantUser.update(
        { status: "failed" },
        { where: { tenant_user_id: user.tenant_user_id } },
      );
      return res.status(result.code || 500).send(result);
    }
    return res.status(200).send({
      success: true,
      code: 200,
      message: "OTP verified and tenant created successfully",
      data: result,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// CREATE TENANT BACKGROUND ////////////////////

async function createTenantBackground(user, res) {
  const transaction = await Tenant.sequelize.transaction();
  let dataBaseName = "";
  let rootDB = null;
  let tenantDB = null;

  try {
    const organizationName = user.organizationName?.trim();
    const email = user.email?.trim().toLowerCase();
    const name = user.name?.trim();
    const phone = String(user.phone || "").trim();
    const hashedPassword = user.password;
    const domain = normalizeDomain(user.domain || "");

    if (!organizationName || !email || !hashedPassword || !domain) {
      await transaction.rollback();
      return {
        success: false,
        code: 400,
        message: "Organization name, email, password and domain are required",
      };
    }

    const existingTenant = await Tenant.findOne({
      where: {
        isDeleted: 0,
        [Op.or]: [{ email }, { organizationName }, { domain }],
      },
      transaction,
    });

    if (existingTenant) {
      await TenantUser.update(
        {
          tenant_id: existingTenant.tenant_id,
          domain: existingTenant.domain,
          dataBaseName: existingTenant.dataBaseName,
          completed: true,
          otpVerifyStatus: true,
          status: "success",
          otp: null,
          otpExpiresAt: null,
          otpAttempts: 0,
        },
        { where: { tenant_user_id: user.tenant_user_id }, transaction },
      );

      await transaction.commit();

      return {
        success: true,
        code: 200,
        message: "Tenant already exists, linked successfully",
        data: {
          tenant_user_id: user.tenant_user_id,
          tenant_id: existingTenant.tenant_id,
          organizationName: existingTenant.organizationName,
          email: existingTenant.email,
          domain: existingTenant.domain,
          dataBaseName: existingTenant.dataBaseName,
        },
      };
    }

    // Generate DB and create tenant
    dataBaseName = generateDatabaseName(organizationName);
    const now = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(now.getDate() + TRIAL_DAYS);

    const tenantRecord = await Tenant.create(
      {
        organizationName,
        domain,
        subDomain: domain,
        dataBaseName,
        email,
        userLimit: DEFAULT_USER_LIMIT,
        packageid: DEFAULT_PACKAGE_ID,
        status: "success",
        name,
        createdAt: now,
        trial_end_date: trialEnd,
      },
      { transaction },
    );

    // Connect root and template DB
    rootDB = createSequelizeConnection(process.env.DB_NAME);
    await rootDB.authenticate();

    const [dbList] = await rootDB.query(
      `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = :templateDB`,
      { replacements: { templateDB: TEMPLATE_DB } },
    );
    if (!dbList || dbList.length === 0) {
      await transaction.rollback();
      return {
        success: false,
        code: 404,
        message: `Template database not found: ${TEMPLATE_DB}`,
      };
    }

    await rootDB.query(
      `CREATE DATABASE IF NOT EXISTS \`${dataBaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
    tenantDB = createSequelizeConnection(dataBaseName);
    await tenantDB.authenticate();

    const [tables] = await rootDB.query(`SHOW TABLES FROM \`${TEMPLATE_DB}\``);
    if (!tables || tables.length === 0) {
      await transaction.rollback();
      return {
        success: false,
        code: 404,
        message: `No tables found in template database: ${TEMPLATE_DB}`,
      };
    }

    await tenantDB.query("SET FOREIGN_KEY_CHECKS = 0");
    try {
      for (const row of tables) {
        const tableName = Object.values(row)[0];
        if (!tableName) continue;
        await tenantDB.query(
          `CREATE TABLE \`${tableName}\` LIKE \`${TEMPLATE_DB}\`.\`${tableName}\`;`,
        );
        await tenantDB.query(
          `INSERT INTO \`${tableName}\` SELECT * FROM \`${TEMPLATE_DB}\`.\`${tableName}\`;`,
        );
      }
    } finally {
      await tenantDB.query("SET FOREIGN_KEY_CHECKS = 1");
    }

    const nowTs = new Date();
    const [domainResult] = await tenantDB.query(
      "INSERT INTO tenant_domain (domain, createdAt, updatedAt) VALUES (:domain, :createdAt, :updatedAt)",
      {
        replacements: {
          domain: tenantRecord.domain,
          createdAt: nowTs,
          updatedAt: nowTs,
        },
      },
    );

    const [[domainRow]] = await tenantDB.query(
      "SELECT tenant_domain_id FROM tenant_domain WHERE domain = :domain",
      { replacements: { domain: tenantRecord.domain } },
    );
    const tenantDomainId = domainRow.tenant_domain_id;

    const platformIp = process.env.PLATFORM_IP || "";
    const platformDomain = process.env.PLATFORM_DOMAIN || "";

    const currentDns = await getCurrentDnsValues(tenantRecord.domain);
    const txtToken = generateTxtToken();

    const aCustomerValues =
      (currentDns.records &&
        currentDns.records.A &&
        currentDns.records.A[0] &&
        currentDns.records.A[0].values) ||
      [];
    const cnameCustomerValues =
      (currentDns.records &&
        currentDns.records.CNAME &&
        currentDns.records.CNAME[0] &&
        currentDns.records.CNAME[0].values) ||
      [];
    const txtRecords = (currentDns.records && currentDns.records.TXT) || [];
    const txtCustomerValues = txtRecords
      .map((r) => (r && r.value != null ? String(r.value).trim() : ""))
      .filter(Boolean);

    await tenantDB.query(
      `INSERT INTO tenant_domain_dns_records
        (tenant_domain_id, name, record_type, zyno_values, customer_values, verified, createdAt, updatedAt)
       VALUES
        (:tenant_domain_id, :a_name, :a_type, :a_zyno, :a_customer, :a_verified, :createdAt, :updatedAt),
        (:tenant_domain_id, :c_name, :c_type, :c_zyno, :c_customer, :c_verified, :createdAt, :updatedAt),
        (:tenant_domain_id, :t_name, :t_type, :t_zyno, :t_customer, :t_verified, :createdAt, :updatedAt)`,
      {
        replacements: {
          tenant_domain_id: tenantDomainId,
          createdAt: nowTs,
          updatedAt: nowTs,

          a_name: "@",
          a_type: "A",
          a_zyno: platformIp,
          a_customer: JSON.stringify(aCustomerValues),
          a_verified: false,

          c_name: "www",
          c_type: "CNAME",
          c_zyno: platformDomain,
          c_customer: JSON.stringify(cnameCustomerValues),
          c_verified: false,

          t_name: "@",
          t_type: "TXT",
          t_zyno: txtToken,
          t_customer: JSON.stringify(txtCustomerValues),
          t_verified: false,
        },
      },
    );

    // Update default admin user
    await tenantDB.query(
      `UPDATE Users
       SET tenant_user_id = :tenant_user_id,
           tenant_id = :tenant_id,
           name = :name,
           email_id = :email,
           password = :password,
           mobile_number = :phone,
           domain = :domain,
           status = :status
       WHERE tenant_user_id = :tenant_user_id`,
      {
        replacements: {
          tenant_user_id: user.tenant_user_id,
          tenant_id: tenantRecord.tenant_id,
          name,
          email,
          password: hashedPassword,
          phone,
          domain: tenantRecord.domain,
          status: "active",
        },
      },
    );

    await TenantUser.update(
      {
        tenant_id: tenantRecord.tenant_id,
        domain: tenantRecord.domain,
        dataBaseName: tenantRecord.dataBaseName,
        completed: true,
        otpVerifyStatus: true,
        status: "success",
        otp: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
      { where: { tenant_user_id: user.tenant_user_id }, transaction },
    );

    await transaction.commit();

    return {
      success: true,
      code: 200,
      message: "Tenant created successfully",
      data: {
        tenant_user_id: user.tenant_user_id,
        tenant_id: tenantRecord.tenant_id,
        organizationName: tenantRecord.organizationName,
        email: tenantRecord.email,
        domain: tenantRecord.domain,
        dataBaseName: tenantRecord.dataBaseName,
      },
    };
  } catch (error) {
    await transaction.rollback().catch(() => {});
    if (dataBaseName) {
      await dropDatabaseIfExists(dataBaseName);
    }
    console.error("Tenant creation error:", error);
    return {
      success: false,
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    };
  } finally {
    await closeSequelizeConnection(tenantDB);
    await closeSequelizeConnection(rootDB);
  }
}

//////////////////// RESEND OTP ////////////////////

exports.resend_Otp = async (req, res) => {
  try {
    const validation = validateRequest(resendOtpSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }
    const { email } = validation.value;
    const user = await TenantUser.findOne({ where: { email, isDeleted: 0 } });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "User not found" });
    }
    if (user.completed) {
      return res.status(409).send({
        success: false,
        code: 409,
        message: "Tenant already created, OTP resend not allowed",
      });
    }

    const otp = generateOtp();
    const otpExpiresAt = addMinutes(new Date(), OTP_EXPIRY_MINUTES);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    user.otpVerifyStatus = false;
    user.otpAttempts = 0;
    user.status = "pending";

    await user.save();

    return res.status(200).send({
      success: true,
      code: 200,
      message: "OTP resent successfully",
      data: {
        tenant_user_id: user.tenant_user_id,
        otp,
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// LOGIN TENANT USER ////////////////////

exports.login_Tenant_User = async (req, res) => {
  try {
    const validation = validateRequest(loginTenantUserSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }
    const { email, password } = validation.value;

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await UsersModels.findOne({
      where: { email_id: normalizedEmail },
    });
    if (!user) {
      return res.status(404).send({
        success: false,
        code: 404,
        message: "User not found for this tenant",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ success: false, code: 401, message: "Invalid password" });
    }

    const dbName =
      req.tenant.dataBaseName || req.tenant.database_name || req.tenant.db_name;
    const token = jwt.sign(
      {
        user_id: user.user_id || user.id,
        email: user.email_id,
        tenant_id: req.tenant.tenant_id,
        domain: req.tenant.domain,
        dbName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    const { password: removedPassword, ...safeUser } = user.toJSON();

    return res.status(200).send({
      success: true,
      code: 200,
      message: "Login Successfully",
      data: {
        token,
        loggedInDomain: req.tenant.domain || req.tenant.subDomain,
        loggedInDb: dbName,
        user: safeUser,
        tenantDetails: req.tenant,
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// CUSTOMER OTP LOGIN / REGISTER ////////////////////

exports.send_Customer_Otp = async (req, res) => {
  try {
    const validation = validateRequest(customerOtpRequestSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }

    const { identifier, mode, name } = validation.value;
    const normalizedIdentifier = String(identifier).trim().toLowerCase();
    const where = buildCustomerIdentifierWhere(normalizedIdentifier);

    if (!where) {
      return res.status(400).send({
        success: false,
        code: 400,
        message: "Enter a valid email or 10-15 digit mobile number",
      });
    }

    let user = await UsersModels.findOne({
      where: { ...where, isDeleted: 0 },
    });

    if (mode === "login" && !user) {
      return res.status(404).send({
        success: false,
        code: 404,
        message: "Customer not found. Please register first.",
      });
    }

    if (mode === "register" && !user) {
      user = await UsersModels.create({
        tenant_id: req.tenant?.tenant_id || null,
        domain: req.tenant?.domain || req.tenantDomain || null,
        name: name || "Customer",
        email_id: where.email_id || null,
        mobile_number: where.mobile_number || null,
        password: null,
        status: "ACTIVE",
        isActive: true,
        isDeleted: false,
      });
    }

    if (mode === "register" && user && name && !user.name) {
      await user.update({ name });
    }

    const otp = generateOtp();
    const otpExpiry = addMinutes(new Date(), OTP_EXPIRY_MINUTES);
    await user.update({ otp, otp_expiry: otpExpiry });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "OTP sent successfully",
      data: {
        identifier: normalizedIdentifier,
        mode,
        otp,
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

exports.verify_Customer_Otp = async (req, res) => {
  try {
    const validation = validateRequest(customerOtpVerifySchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }

    const { identifier, otp } = validation.value;
    const normalizedIdentifier = String(identifier).trim().toLowerCase();
    const where = buildCustomerIdentifierWhere(normalizedIdentifier);

    if (!where) {
      return res.status(400).send({
        success: false,
        code: 400,
        message: "Enter a valid email or 10-15 digit mobile number",
      });
    }

    const user = await UsersModels.findOne({
      where: { ...where, isDeleted: 0 },
    });

    if (!user) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "Customer not found" });
    }

    if (!user.otp || !user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
      return res
        .status(410)
        .send({ success: false, code: 410, message: "OTP expired" });
    }

    if (String(user.otp) !== String(otp)) {
      return res
        .status(409)
        .send({ success: false, code: 409, message: "Invalid OTP" });
    }

    await user.update({ otp: null, otp_expiry: null });

    const dbName =
      req.tenant?.dataBaseName || req.tenant?.database_name || req.tenant?.db_name;
    const token = jwt.sign(
      {
        user_id: user.user_id || user.id,
        email: user.email_id,
        mobile_number: user.mobile_number,
        tenant_id: req.tenant?.tenant_id,
        domain: req.tenant?.domain,
        dbName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password: removedPassword, otp: removedOtp, otp_expiry: removedOtpExpiry, ...safeUser } = user.toJSON();

    return res.status(200).send({
      success: true,
      code: 200,
      message: "OTP verified successfully",
      data: {
        token,
        loggedInDomain: req.tenant?.domain || req.tenantDomain,
        loggedInDb: dbName,
        user: safeUser,
        tenantDetails: req.tenant,
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// ADD TENANT USER ////////////////////

exports.add_Tenant_User = async (req, res) => {
  try {
    const validation = validateRequest(addTenantUserSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }
    const { name, email_id, password, mobile_number, role_id } =
      validation.value;

    const normalizedEmail = String(email_id).trim().toLowerCase();
    const normalizedMobile = mobile_number
      ? String(mobile_number).trim()
      : null;

    const existingEmailUser = await UsersModels.findOne({
      where: { email_id: normalizedEmail },
    });
    if (existingEmailUser) {
      return res.status(409).send({
        success: false,
        code: 409,
        message: "User with this email already exists",
      });
    }

    if (normalizedMobile) {
      const existingMobileUser = await UsersModels.findOne({
        where: { mobile_number: normalizedMobile },
      });
      if (existingMobileUser) {
        return res.status(409).send({
          success: false,
          code: 409,
          message: "User with this mobile number already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UsersModels.create({
      tenant_id: req.tenant.tenant_id,
      name,
      email_id: normalizedEmail,
      password: hashedPassword,
      mobile_number: normalizedMobile,
      role_id: role_id || null,
      domain: req.tenant.domain,
    });
    return res.status(201).send({
      success: true,
      code: 201,
      message: "User added successfully",
      data: newUser,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// CHECK REGISTRATION ////////////////////

exports.check_Registration = async (req, res) => {
  try {
    const { tenant_user_id } = req.params;
    const user = await TenantUser.findOne({
      where: { tenant_user_id, isDeleted: 0 },
    });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "Invalid link" });
    }
    return res.status(200).send({
      success: true,
      code: 200,
      message: "Fetch Data Successfully",
      data: {
        otpVerifyStatus: user.otpVerifyStatus,
        completed: user.completed,
        status: user.status || "pending",
      },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET ALL TENANT USERS ////////////////////

exports.get_All_Tenant_Users = async (req, res) => {
  try {
    const getAllData = await UsersModels.findAll({ where: { isDeleted: 0 } });
    return res.status(200).send({
      success: true,
      code: 200,
      message: "Tenant users fetched successfully",
      data: getAllData,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// GET BY ID TENANT USER ////////////////////

exports.get_ById_Tenant_User = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: "user_id is required" });
    }
    const userData = await UsersModels.findOne({
      where: { user_id: userId, isDeleted: 0 },
    });
    if (!userData) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "User not found" });
    }
    return res.status(200).send({
      success: true,
      code: 200,
      message: "Tenant user fetched successfully",
      data: userData,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// UPDATE TENANT USER ////////////////////

exports.update_Tenant_User = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: "user_id is required" });
    }
    const validation = validateRequest(updateUserSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }
    const { name, email_id, mobile_number, role_id, status } = validation.value;
    const userData = await UsersModels.findOne({
      where: { user_id: userId, isDeleted: 0 },
    });
    if (!userData) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "User not found" });
    }
    if (email_id && email_id.trim().toLowerCase() !== userData.email_id) {
      const existingEmailUser = await UsersModels.findOne({
        where: {
          email_id: email_id.trim().toLowerCase(),
          user_id: { [Op.ne]: userId },
        },
      });
      if (existingEmailUser) {
        return res
          .status(409)
          .send({ success: false, code: 409, message: "Email already in use" });
      }
    }
    if (
      mobile_number &&
      mobile_number.trim() !== String(userData.mobile_number || "")
    ) {
      const existingMobileUser = await UsersModels.findOne({
        where: {
          mobile_number: mobile_number.trim(),
          user_id: { [Op.ne]: userId },
        },
      });
      if (existingMobileUser) {
        return res.status(409).send({
          success: false,
          code: 409,
          message: "Mobile already in use",
        });
      }
    }

    await userData.update({
      name: name || userData.name,
      email_id: email_id ? email_id.trim().toLowerCase() : userData.email_id,
      mobile_number: mobile_number
        ? mobile_number.trim()
        : userData.mobile_number,
      role_id: role_id || userData.role_id,
      status: status || userData.status,
    });

    return res.status(200).send({
      success: true,
      code: 200,
      message: "User updated successfully",
      data: userData,
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// DELETE ////////////////////

exports.delete_Tenant_User = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: "user_id is required" });
    }
    const user = await UsersModels.findOne({
      where: { user_id: userId, isDeleted: 0 },
    });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "User not found" });
    }
    await user.update({ isDeleted: true, status: "inactive" });
    return res.status(200).send({
      success: true,
      code: 200,
      message: "User deleted successfully",
      data: { user_id: user.user_id },
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// CHANGE PASSWORD ////////////////////

exports.change_Password = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res
        .status(401)
        .send({ success: false, code: 401, message: "Unauthorized" });
    }
    const validation = validateRequest(changePasswordSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }
    const { oldPassword, newPassword } = validation.value;
    const user = await UsersModels.findOne({
      where: { user_id: userId, isDeleted: 0 },
    });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "User not found" });
    }
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res
        .status(401)
        .send({ success: false, code: 401, message: "Old password incorrect" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });
    return res.status(200).send({
      success: true,
      code: 200,
      message: "Password changed successfully",
    });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// FORGOT PASSWORD ////////////////////

exports.forgot_Password = async (req, res) => {
  try {
    const validation = validateRequest(forgotPasswordSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }
    const { email } = validation.value;
    const user = await UsersModels.findOne({
      where: {
        email_id: email.trim().toLowerCase(),
        isDeleted: 0,
      },
    });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.update({ otp, otp_expiry: expiry });
    return res
      .status(200)
      .send({ success: true, code: 200, message: "OTP sent", otp });
  } catch (error) {
    const formattedError = handleDatabaseError(error);
    return res.status(formattedError.code || 500).send(formattedError);
  }
};

//////////////////// RESET PASSWORD ////////////////////

exports.reset_Password = async (req, res) => {
  try {
    const validation = validateRequest(resetPasswordSchema, req.body);
    if (!validation.isValid) {
      return res
        .status(400)
        .send({ success: false, code: 400, message: validation.message });
    }
    const { email, otp, newPassword } = validation.value;
    const user = await UsersModels.findOne({
      where: {
        email_id: email.trim().toLowerCase(),
        isDeleted: 0,
      },
    });
    if (!user) {
      return res
        .status(404)
        .send({ success: false, code: 404, message: "User not found" });
    }
    if (
      !user.otp ||
      !user.otp_expiry ||
      new Date() > new Date(user.otp_expiry)
    ) {
      return res
        .status(410)
        .send({ success: false, code: 410, message: "OTP expired" });
    }
    if (String(user.otp) !== String(otp)) {
      return res
        .status(409)
        .send({ success: false, code: 409, message: "Invalid OTP" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashed,
      otp: null,
      otp_expiry: null,
    });
    return res.status(200).send({
      success: true,
      code: 200,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .send({ success: false, code: 500, message: "Internal Server Error" });
  }
};
