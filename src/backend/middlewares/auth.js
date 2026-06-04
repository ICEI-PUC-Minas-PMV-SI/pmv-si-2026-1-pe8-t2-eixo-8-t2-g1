const { Usuario } = require("../models");
const { AUTH_COOKIE_NAME, getClearAuthCookieOptions, verifyJwt } = require("../utils/auth");

async function autenticarCookie(req, res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    const payload = verifyJwt(token);
    const usuario = await Usuario.findByPk(payload.sub);

    if (!usuario) {
      res.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());
      return res.status(401).json({
        message: "Sessao invalida",
      });
    }

    if (usuario.status !== "Ativo") {
      res.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());
      return res.status(403).json({
        message: "Usuario inativo",
      });
    }

    req.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      idPerfil: usuario.idPerfil,
    };
    req.authPayload = payload;

    return next();
  } catch (error) {
    res.clearCookie(AUTH_COOKIE_NAME, getClearAuthCookieOptions());
    return res.status(401).json({
      message: "Sessao invalida",
    });
  }
}

module.exports = autenticarCookie;
