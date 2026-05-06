const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const ItemServico = sequelize.define(
  "ItemServico",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_servico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "servicos",
        key: "id",
      },
    },
    id_produto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "produtos",
        key: "id",
      },
    },
    quantidade_utilizada: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "itens_servico",
    timestamps: false,
  },
);

module.exports = ItemServico;
