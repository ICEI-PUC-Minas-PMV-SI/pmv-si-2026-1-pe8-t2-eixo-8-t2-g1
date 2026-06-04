const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Marca = sequelize.define(
    "Marca",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        titulo: {
            type: DataTypes.STRING(64),
            allowNull: false,
        }
    },
    {
        tableName: "marcas",
        timestamps: false,
    },
);

module.exports = Marca;
