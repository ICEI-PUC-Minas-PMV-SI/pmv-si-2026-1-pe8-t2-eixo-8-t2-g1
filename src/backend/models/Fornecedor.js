const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Fornecedor = sequelize.define(
  "Fornecedor",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    nome: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },

    cnpj: {
      type: DataTypes.STRING(18),
      allowNull: false,
      unique: true,
    },

    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "fornecedores",
    timestamps: true,
    createdAt: "dataCriacao",
    updatedAt: "dataAtualizacao",
  },
);

module.exports = Fornecedor;