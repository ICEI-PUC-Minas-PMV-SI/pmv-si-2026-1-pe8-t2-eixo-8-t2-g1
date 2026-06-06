const express = require("express");
const { Smtp, } = require("../models");
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

// GET - Obter configurações SMTP (sempre retorna o primeiro registro)
router.get("/", async (req, res) => {
    try {
        const smtp = await Smtp.findByPk(1);

        if (!smtp) {
            return res.status(404).json({
                message: "Configurações SMTP não configuradas"
            });
        }

        return res.json(smtp);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar configurações SMTP"
        });
    }
});

// POST - Criar configurações SMTP (se não existir)
router.post("/", async (req, res) => {
    try {
        const { host, email, senha, porta, seguranca } = req.body;

        // Validar campos obrigatórios
        if (!host || !email || !senha || !porta || !seguranca) {
            return res.status(400).json({
                message: "Todos os campos são obrigatórios"
            });
        }

        // Verificar se já existe registro
        const smtpExistente = await Smtp.findByPk(1);

        if (smtpExistente) {
            return res.status(409).json({
                message: "Configurações SMTP já foram definidas. Use PUT para atualizar."
            });
        }

        const smtp = await Smtp.create({
            id: 1,
            host,
            email,
            senha,
            porta,
            seguranca
        });

        return res.status(201).json(smtp);
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

        return res.status(500).json({
            message: "Erro interno ao criar configurações SMTP"
        });
    }
});

// PUT - Atualizar configurações SMTP (upsert)
router.put("/", async (req, res) => {
    try {
        const { host, email, senha, porta, seguranca } = req.body;

        let smtp = await Smtp.findByPk(1);

        if (!smtp) {
            // Se não existir, criar novo registro
            smtp = await Smtp.create({
                id: 1,
                host: host || "",
                email: email || "",
                senha: senha || "",
                porta: porta || 587,
                seguranca: seguranca || "TLS"
            });

            return res.status(201).json(smtp);
        }

        // Se existir, atualizar
        const smtpAtualizado = await smtp.update({
            host: host ?? smtp.host,
            email: email ?? smtp.email,
            senha: senha ?? smtp.senha,
            porta: porta ?? smtp.porta,
            seguranca: seguranca ?? smtp.seguranca
        });

        return res.json(smtpAtualizado);
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

        return res.status(500).json({
            message: "Erro interno ao atualizar configurações SMTP"
        });
    }
});

module.exports = router;