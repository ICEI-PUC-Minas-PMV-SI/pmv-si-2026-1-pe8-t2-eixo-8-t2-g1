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
    data_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    data_fim: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    valor_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    id_veiculo: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
