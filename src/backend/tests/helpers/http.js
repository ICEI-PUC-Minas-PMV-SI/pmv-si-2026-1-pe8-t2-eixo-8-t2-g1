const request = require("supertest");
const { AUTH_COOKIE_NAME, signJwt } = require("../../utils/auth");

function buildAuthCookie(usuario) {
  const token = signJwt({
    sub: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    idPerfil: usuario.idPerfil,
  });

  return `${AUTH_COOKIE_NAME}=${token}`;
}

function apiRequest(context, method, path, authenticated = true) {
  const testRequest = request(context.app)[method](path);

  if (!authenticated) {
    return testRequest;
  }

  return testRequest.set("Cookie", buildAuthCookie(context.auth.usuario));
}

module.exports = {
  apiRequest,
  buildAuthCookie,
  request,
};
