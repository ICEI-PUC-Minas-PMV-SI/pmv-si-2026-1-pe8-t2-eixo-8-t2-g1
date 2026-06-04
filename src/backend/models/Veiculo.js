const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Veiculo = sequelize.define(
  "Veiculo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    placa: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    modelo: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cor: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    quilometragem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tipoVeiculo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "tipo_veiculo",
    },
    motorizacao: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    numeroChasse: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "numero_chassi",
    },
    tipoCombustivel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "tipo_combustivel",
    },
    dataUltimaRevisao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "data_ultima_revisao",
    },
    idCliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_cliente",
      references: {
        model: "clientes",
        key: "id",
      },
    },
  },
  {
    tableName: "veiculos",
    timestamps: true,
    createdAt: "dataCriacao",
    updatedAt: "dataAtualizacao",
    underscored: true,
  },
);

module.exports = Veiculo;
