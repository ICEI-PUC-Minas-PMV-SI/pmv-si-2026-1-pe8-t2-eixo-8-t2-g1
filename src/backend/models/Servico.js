const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Servico = sequelize.define(
  "Servico",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "data_inicio",
    },
    dataFim: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: "data_fim",
    },
    valorTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: "valor_total",
    },
    idVeiculo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "id_veiculo",
      references: {
        model: "veiculos",
        key: "id",
      },
    },
  },
  {
    tableName: "servicos",
    timestamps: false,
  },
);

module.exports = Servico;
