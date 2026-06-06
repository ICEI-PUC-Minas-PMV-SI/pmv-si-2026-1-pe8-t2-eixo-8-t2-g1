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

    titulo: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    codigoSku: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "codigo_sku",
    },

    idMarca: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_marca",
      references: {
        model: "marca",
        key: "id",
      },
    },

    idCategoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_categoria",
      references: {
        model: "categoria",
        key: "id",
      },
    },

    idFornecedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_fornecedor",
    },

    tipoItem: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Produto",
      field: "tipo_item",
    },

    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    estoqueAtual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "estoque_atual",
    },
  },
  {
    tableName: "produtos",
    timestamps: false,
  }
);

module.exports = Produto;
