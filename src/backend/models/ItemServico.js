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
    idServico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_servico",
      references: {
        model: "servicos",
        key: "id",
      },
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_produto",
      references: {
        model: "produtos",
        key: "id",
      },
    },
    quantidadeUtilizada: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "quantidade_utilizada",
    },
  },
  {
    tableName: "itens_servico",
    timestamps: false,
  },
);

module.exports = ItemServico;
