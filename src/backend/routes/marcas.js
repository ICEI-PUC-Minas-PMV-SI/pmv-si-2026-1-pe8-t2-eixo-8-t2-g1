const express = require("express");
const { Marca, } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");
const autenticarCookie = require("../middlewares/auth");
const {
    AUTH_COOKIE_NAME,
    getAuthCookieOptions,
    getClearAuthCookieOptions,
    hashPassword,
    signJwt,
    verifyJwt,
    verifyPassword,
} = require("../utils/auth");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const marcas = await Marca.findAll();
        return res.json(marcas);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar marcas"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID deve ser um número inteiro maior que zero"
            });
        }

        const marca = await Marca.findByPk(id);

        if (!marca) {
            return res.status(404).json({
                message: "Marca não encontrada"
            });
        }

        return res.json(marca);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar marca"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const { titulo } = req.body;

        if (!titulo) {
            return res.status(400).json({
                message: "titulo é obrigatório"
            });
        }

        const marca = await Marca.create({
            titulo
        });

        return res.status(201).json(marca);
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Erro de validação",
                errors: error.errors.map((err) => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Registro duplicado",
                errors: error.errors.map((err) => ({
                    field: err.path,
                    message: err.message,
                    value: err.value
                }))
            });
        }

        return res.status(500).json({
            message: "Erro interno ao cadastrar marca"
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID deve ser um número inteiro maior que zero"
            });
        }

        const marca = await Marca.findByPk(id);

        if (!marca) {
            return res.status(404).json({
                message: "Marca não encontrada"
            });
        }

        await marca.destroy();

        return res.status(200).json({
            message: "Marca deletada com sucesso"
        });
    } catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
            return res.status(409).json({
                message: "Marca possui produtos vinculados"
            });
        }

        return res.status(500).json({
            message: "Erro interno ao deletar marca"
        });
    }
});

module.exports = router;
