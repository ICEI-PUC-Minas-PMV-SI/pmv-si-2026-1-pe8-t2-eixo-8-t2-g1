const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Usuario = sequelize.define(
  "Usuario",
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
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    perfil: {
      type: DataTypes.ENUM("Administrador", "Supervisor", "Padrão"),
      allowNull: false,
      defaultValue: "Padrão",
    },
    status: {
      type: DataTypes.ENUM("Ativo", "Inativo"),
      allowNull: false,
      defaultValue: "Ativo",
    },
    senhaHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "senha_hash",
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
    createdAt: "dataCriacao",
    updatedAt: "dataAtualizacao",
  },
);

Usuario.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.senhaHash;
  return values;
};

module.exports = Usuario;
