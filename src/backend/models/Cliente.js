const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Cliente = sequelize.define(
  "Cliente",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nomeCompleto: {
      type: DataTypes.STRING(160),
      allowNull: false,
      field: "nome_completo",
    },
    genero: {
      type: DataTypes.ENUM("M", "F", "Outro"),
      allowNull: false,
    },
    dataNascimento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "data_nascimento",
    },
    tipo: {
      type: DataTypes.ENUM("Física", "Jurídica"),
      allowNull: false,
    },
    endereco: {
      type: DataTypes.JSONB,
      allowNull: false,
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
    isFornecedor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_fornecedor",
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "clientes",
    timestamps: true,
    createdAt: "dataCriacao",
    updatedAt: "dataAtualizacao",
  },
);

module.exports = Cliente;
