const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Smtp = sequelize.define(
    "Smtp",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        host: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        senha: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        porta: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        seguranca: {
            type: DataTypes.STRING(3),
            allowNull: false,
        }
    },
    {
        tableName: "smtp",
        timestamps: false,
    },
);

module.exports = Smtp;
