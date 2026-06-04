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

router.get("/", async (req, res) => {
    try {
        const empresa = await Empresa.findByPk(1);

        return res.json(empresa);
    } catch (error) {
        return res.status(500).json({
            message: "Erro interno ao buscar empresa",
        });
    }
});

module.exports = router;