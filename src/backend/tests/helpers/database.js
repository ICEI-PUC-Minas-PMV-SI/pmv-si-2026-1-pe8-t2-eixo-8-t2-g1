const path = require("node:path");
const { Client } = require("pg");

function configureTestEnvironment() {
  require("dotenv").config({
    path: path.join(__dirname, "..", "..", ".env"),
    quiet: true,
  });

  process.env.NODE_ENV = "test";
  process.env.DB_NAME = process.env.TEST_DB_NAME || "PCC_AUTO_TEST";
  process.env.JWT_SECRET = "pcc-api-test-secret";
  process.env.JWT_EXPIRES_IN_SECONDS = "3600";
  process.env.COOKIE_SECURE = "false";
  process.env.COOKIE_SAME_SITE = "lax";
}

function assertSafeTestDatabaseName(databaseName) {
  if (
    !/^[A-Za-z0-9_]+$/.test(databaseName) ||
    !databaseName.toUpperCase().endsWith("_TEST")
  ) {
    throw new Error(
      `Banco de testes inseguro: "${databaseName}". O nome deve terminar com _TEST.`,
    );
  }
}

async function ensureTestDatabase() {
  const databaseName = process.env.DB_NAME;
  assertSafeTestDatabaseName(databaseName);

  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  });

  await client.connect();

  try {
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName],
    );

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`);
    }
  } finally {
    await client.end();
  }
}

async function initializeDatabase() {
  await ensureTestDatabase();

  const { app } = require("../../index");
  const models = require("../../models");

  await models.sequelize.authenticate();
  await models.sequelize.sync({ force: true });

  return {
    app,
    models,
  };
}

function quoteTableName(tableName) {
  return `"${String(tableName).replaceAll('"', '""')}"`;
}

async function resetDatabase(models) {
  const tableNames = [
    ...new Set(
      Object.values(models.sequelize.models).map((model) =>
        model.getTableName(),
      ),
    ),
  ];

  if (tableNames.length === 0) {
    return;
  }

  const quotedTables = tableNames.map(quoteTableName).join(", ");
  await models.sequelize.query(
    `TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE`,
  );
}

async function closeDatabase(models) {
  await models.sequelize.close();
}

module.exports = {
  closeDatabase,
  configureTestEnvironment,
  initializeDatabase,
  resetDatabase,
};
