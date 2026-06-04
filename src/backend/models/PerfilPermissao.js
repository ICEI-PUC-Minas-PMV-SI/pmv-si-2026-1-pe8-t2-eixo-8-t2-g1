const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const PerfilPermissao = sequelize.define(
  "PerfilPermissao",
  {
    idPerfil: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: "id_perfil",
      references: {
        model: "perfis",
        key: "id",
      },
    },
    idPermissao: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: "id_permissao",
      references: {
        model: "permissoes",
        key: "id",
      },
    },
  },
  {
    tableName: "perfil_permissao",
    timestamps: false,
  },
);

module.exports = PerfilPermissao;
