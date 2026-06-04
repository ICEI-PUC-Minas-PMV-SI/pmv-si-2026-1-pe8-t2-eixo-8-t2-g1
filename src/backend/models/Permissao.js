const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Permissao = sequelize.define(
  "Permissao",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "permissoes",
    timestamps: false,
  },
);

module.exports = Permissao;
