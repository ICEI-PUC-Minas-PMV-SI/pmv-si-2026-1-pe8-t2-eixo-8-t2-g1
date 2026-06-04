const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Categoria = sequelize.define(
    "Categoria",
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
        tableName: "categorias",
        timestamps: false,
    },
);

module.exports = Categoria;
