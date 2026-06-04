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
            message: "Erro interno ao buscar categorias",
        });
    }
});

module.exports = router;