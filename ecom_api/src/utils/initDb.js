require("dotenv").config();
const mysql = require("mysql2/promise");

const initDb = async () => {
  const connectionConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
  };

  const databases = [
    process.env.DB_NAME || "zyno_ecom",
    process.env.TEMPLATE_DB || "zyno_ecom_template",
  ];

  let connection;

  try {
    console.log("Connecting to MySQL server to ensure databases exist...");
    connection = await mysql.createConnection(connectionConfig);

    for (const dbName of databases) {
      if (dbName) {
        console.log(`Ensuring database '${dbName}' exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database '${dbName}' is ready.`);
      }
    }
  } catch (error) {
    console.error("Error during database initialization:");
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

initDb();
