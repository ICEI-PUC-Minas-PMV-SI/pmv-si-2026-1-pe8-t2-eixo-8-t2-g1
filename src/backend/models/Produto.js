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
      field: "nome",
    },

    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    codigoSku: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: "codigo_sku",
    },

    idMarca: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "id_marca",
      references: {
        model: "marcas",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    idCategoria: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "id_categoria",
      references: {
        model: "categorias",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    idFornecedor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "id_fornecedor",
      references: {
        model: "clientes",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
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
      field: "preco_unitario",
    },

    estoqueAtual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "quantidade",
    },

    estoqueMinimo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      field: "estoque_minimo",
    },
  },
  {
    tableName: "produtos",
    timestamps: false,
  }
);

module.exports = Produto;
