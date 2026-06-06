const express = require("express");
const { TipoVeiculo, } = require("../models");
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
        const tiposVeiculo = await TipoVeiculo.findAll();
        return res.json(tiposVeiculo);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar tipos de veículos"
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

        const tipoVeiculo = await TipoVeiculo.findByPk(id);

        if (!tipoVeiculo) {
            return res.status(404).json({
                message: "Tipo de veículo não encontrado"
            });
        }

        return res.json(tipoVeiculo);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar tipo de veículo"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const { titulo, observacao } = req.body;

        if (!titulo) {
            return res.status(400).json({
                message: "titulo é obrigatório"
            });
        }

        const tipoVeiculo = await TipoVeiculo.create({
            titulo,
            observacao: observacao || ""
        });

        return res.status(201).json(tipoVeiculo);
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
            message: "Erro interno ao cadastrar tipo de veículo"
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

        const tipoVeiculo = await TipoVeiculo.findByPk(id);

        if (!tipoVeiculo) {
            return res.status(404).json({
                message: "Tipo de veículo não encontrado"
            });
        }

        await tipoVeiculo.destroy();

        return res.status(200).json({
            message: "Tipo de veículo deletado com sucesso"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao deletar tipo de veículo"
        });
    }
});
module.exports = router;