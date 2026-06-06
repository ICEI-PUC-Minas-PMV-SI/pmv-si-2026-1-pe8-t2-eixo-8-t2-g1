const express = require("express");
const { Empresa, } = require("../models");
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

// GET - Obter dados da empresa (sempre retorna o primeiro registro)
router.get("/", async (req, res) => {
    try {
        const empresa = await Empresa.findByPk(1);

        if (!empresa) {
            return res.status(404).json({
                message: "Dados da empresa não configurados"
            });
        }

        return res.json(empresa);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar dados da empresa"
        });
    }
});

// POST - Criar dados da empresa (se não existir)
router.post("/", async (req, res) => {
    try {
        const {
            nome,
            apelido,
            cnpj,
            logotipo,
            email,
            telefone,
            logradouro,
            numero,
            complemente,
            bairro,
            cidade,
            uf,
            cep,
            pais
        } = req.body;

        // Validar campos obrigatórios
        if (!nome || !apelido || !cnpj || !logotipo || !email || !telefone ||
            !logradouro || !numero || !complemente || !bairro || !cidade || !uf || !cep || !pais) {
            return res.status(400).json({
                message: "Todos os campos são obrigatórios"
            });
        }

        // Verificar se já existe registro
        const empresaExistente = await Empresa.findByPk(1);

        if (empresaExistente) {
            return res.status(409).json({
                message: "Dados da empresa já foram configurados. Use PUT para atualizar."
            });
        }

        const empresa = await Empresa.create({
            id: 1,
            nome,
            apelido,
            cnpj,
            logotipo,
            email,
            telefone,
            logradouro,
            numero,
            complemente,
            bairro,
            cidade,
            uf,
            cep,
            pais
        });

        return res.status(201).json(empresa);
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
            message: "Erro interno ao criar dados da empresa"
        });
    }
});

// PUT - Atualizar dados da empresa (upsert)
router.put("/", async (req, res) => {
    try {
        const {
            nome,
            apelido,
            cnpj,
            logotipo,
            email,
            telefone,
            logradouro,
            numero,
            complemente,
            bairro,
            cidade,
            uf,
            cep,
            pais
        } = req.body;

        let empresa = await Empresa.findByPk(1);

        if (!empresa) {
            // Se não existir, criar novo registro
            empresa = await Empresa.create({
                id: 1,
                nome: nome || "",
                apelido: apelido || "",
                cnpj: cnpj || "",
                logotipo: logotipo || "",
                email: email || "",
                telefone: telefone || "",
                logradouro: logradouro || "",
                numero: numero || 0,
                complemente: complemente || "",
                bairro: bairro || "",
                cidade: cidade || "",
                uf: uf || "",
                cep: cep || "",
                pais: pais || ""
            });

            return res.status(201).json(empresa);
        }

        // Se existir, atualizar
        const empresaAtualizada = await empresa.update({
            nome: nome ?? empresa.nome,
            apelido: apelido ?? empresa.apelido,
            cnpj: cnpj ?? empresa.cnpj,
            logotipo: logotipo ?? empresa.logotipo,
            email: email ?? empresa.email,
            telefone: telefone ?? empresa.telefone,
            logradouro: logradouro ?? empresa.logradouro,
            numero: numero ?? empresa.numero,
            complemente: complemente ?? empresa.complemente,
            bairro: bairro ?? empresa.bairro,
            cidade: cidade ?? empresa.cidade,
            uf: uf ?? empresa.uf,
            cep: cep ?? empresa.cep,
            pais: pais ?? empresa.pais
        });

        return res.json(empresaAtualizada);
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
            message: "Erro interno ao atualizar dados da empresa"
        });
    }
});

module.exports = router;