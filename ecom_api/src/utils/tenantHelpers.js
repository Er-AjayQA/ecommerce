"use strict";

require("dotenv").config();
const { Sequelize } = require("sequelize");

const connections = {};

function sanitizeDomainName(name) {
    return String(name || "")
        .trim()
        .replace(/\s+/g, "_")
        .toLowerCase();
}

function normalizeDomain(domain) {
    if (!domain) return "";
    domain = domain.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, "");
    domain = domain.replace(/\/$/, "");
    return domain;
}

function generateDatabaseName(orgName) {
    const base = sanitizeDomainName(orgName) || "tenant";
    return `tenant_${base}_${Date.now()}`;
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60 * 1000);
}

function createSequelizeConnection(database) {
    return new Sequelize(
        database,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT || "mysql",
            logging: false,
        }
    );
}

async function getTenantConnection(tenant) {
    if (!tenant || !tenant.dataBaseName) {
        throw new Error("Invalid tenant or database name missing");
    }

    if (!connections[tenant.dataBaseName]) {
        console.log("🔄 Creating new connection for:", tenant.dataBaseName);
        const sequelize = createSequelizeConnection(tenant.dataBaseName);
        await sequelize.authenticate();
        connections[tenant.dataBaseName] = sequelize;
        console.log("✅ Connected TENANT DB:", tenant.dataBaseName);
    } else {
        console.log("⚡ Connection already exists:", tenant.dataBaseName);
    }
    return connections[tenant.dataBaseName];
}

async function closeSequelizeConnection(instance) {
    if (instance) {
        await instance.close().catch(() => { });
    }
}

async function dropDatabaseIfExists(dbName) {
    let rootDB;
    try {
        rootDB = createSequelizeConnection(process.env.DB_NAME);
        await rootDB.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
        console.log("🗑️ Cleanup DB dropped:", dbName);
    } catch (err) {
        console.log("❌ DB cleanup failed:", err.message);
    } finally {
        await closeSequelizeConnection(rootDB);
    }
}

module.exports = {
    connections,
    sanitizeDomainName,
    normalizeDomain,
    generateDatabaseName,
    generateOtp,
    addMinutes,
    createSequelizeConnection,
    getTenantConnection,
    closeSequelizeConnection,
    dropDatabaseIfExists,
};