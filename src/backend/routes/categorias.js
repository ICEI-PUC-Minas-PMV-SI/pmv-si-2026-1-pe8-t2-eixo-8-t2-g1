const express = require("express");
const { Categoria, } = require("../models");
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
        const categorias = await Categoria.findAll();
        return res.json(categorias);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar categorias"
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

        const categoria = await Categoria.findByPk(id);

        if (!categoria) {
            return res.status(404).json({
                message: "Categoria não encontrada"
            });
        }

        return res.json(categoria);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar categoria"
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

        const categoria = await Categoria.create({
            titulo
        });

        return res.status(201).json(categoria);
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
            message: "Erro interno ao cadastrar categoria"
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

        const categoria = await Categoria.findByPk(id);

        if (!categoria) {
            return res.status(404).json({
                message: "Categoria não encontrada"
            });
        }

        await categoria.destroy();

        return res.status(200).json({
            message: "Categoria deletada com sucesso"
        });
    } catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
            return res.status(409).json({
                message: "Categoria possui produtos vinculados"
            });
        }

        return res.status(500).json({
            message: "Erro interno ao deletar categoria"
        });
    }
});

module.exports = router;
