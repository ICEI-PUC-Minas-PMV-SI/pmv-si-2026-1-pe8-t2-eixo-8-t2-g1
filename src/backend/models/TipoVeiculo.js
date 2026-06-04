const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const TipoVeiculo = sequelize.define(
    "TipoVeiculo",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        titulo: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        observacao: {
            type: DataTypes.STRING(200),
            allowNull: false,
        }
    },
    {
        tableName: "veiculo_tipos",
        timestamps: false,
    },
);

module.exports = TipoVeiculo;
