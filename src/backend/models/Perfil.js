const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Perfil = sequelize.define(
  "Perfil",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "perfis",
    timestamps: false,
  },
);

module.exports = Perfil;
