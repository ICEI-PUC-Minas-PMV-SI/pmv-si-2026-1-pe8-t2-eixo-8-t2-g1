const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    idPerfil: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_perfil",
      references: {
        model: "perfis",
        key: "id",
      },
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
    createdAt: "dataCriacao",
    updatedAt: "dataAtualizacao",
    underscored: true,
  },
);

Usuario.prototype.toJSON = function () {
  const values = { ...this.get() };
  values.perfil = values.perfilInfo?.nome;
  delete values.senhaHash;
  delete values.perfilInfo;
  return values;
};

module.exports = Usuario;
