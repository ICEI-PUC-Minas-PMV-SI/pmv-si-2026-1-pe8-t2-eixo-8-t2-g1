const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Produto = sequelize.define(
  "Produto",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    quantidade: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    precoUnitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "preco_unitario",
    },
  },
  {
    tableName: "produtos",
    timestamps: false,
  },
);

module.exports = Produto;
