const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const Empresa = sequelize.define(
    "Empresa",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        apelido: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        cnpj: {
            type: DataTypes.STRING(14),
            allowNull: false,
        },
        logotipo: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        telefone: {
            type: DataTypes.STRING(11),
            allowNull: false,
        },
        logradouro: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        numero: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        complemente: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        bairro: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        cidade: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        uf: {
            type: DataTypes.STRING(15),
            allowNull: false,
        },
        cep: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        pais: {
            type: DataTypes.STRING(64),
            allowNull: false,
        }
    },
    {
        tableName: "empresas",
        timestamps: true,
        createdAt: "dataCriacao",
        updatedAt: "dataAtualizacao",
        underscored: true
    },
);

module.exports = Empresa;
