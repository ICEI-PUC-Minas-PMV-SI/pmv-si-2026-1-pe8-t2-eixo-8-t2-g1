const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const { apiRequest, request } = require("../helpers/http");

module.exports = function registerSystemTests(context) {
  describe("rotas publicas e autenticacao compartilhada", () => {
    test("GET / responde com os cabecalhos de seguranca", async () => {
      const response = await request(context.app).get("/").expect(200);

      assert.deepEqual(response.body, {
        message: "API AutoPro rodando",
      });
      assert.equal(response.headers["x-content-type-options"], "nosniff");
      assert.equal(response.headers["x-frame-options"], "DENY");
      assert.equal(response.headers["content-security-policy"], "default-src 'self'");
    });

    test("GET /swagger.json retorna o contrato OpenAPI", async () => {
      const response = await request(context.app).get("/swagger.json").expect(200);

      assert.equal(typeof response.body.openapi, "string");
      assert.equal(typeof response.body.paths, "object");
      assert.ok(response.body.paths["/usuarios/login"]);
      assert.ok(response.body.paths["/relatorios"]);
    });

    test("GET /api-docs/ disponibiliza a interface do Swagger", async () => {
      const response = await request(context.app).get("/api-docs/").expect(200);

      assert.match(response.headers["content-type"], /text\/html/);
      assert.match(response.text, /Swagger UI/);
    });

    test("todas as familias de rotas incluidas exigem cookie", async () => {
      const protectedPaths = [
        "/clientes",
        "/veiculos",
        "/servicos",
        "/itens-servico",
        "/produtos",
        "/relatorios",
        "/usuarios",
        "/perfis",
        "/permissoes",
        "/fornecedores",
      ];

      for (const path of protectedPaths) {
        const response = await apiRequest(
          context,
          "get",
          path,
          false,
        ).expect(401);

        assert.equal(typeof response.body.message, "string");
      }
    });

    test("cookie adulterado e rejeitado", async () => {
      const response = await request(context.app)
        .get("/clientes")
        .set("Cookie", "auth_token=token.invalido.assinatura")
        .expect(401);

      assert.equal(typeof response.body.message, "string");
      assert.match(response.headers["set-cookie"].join(";"), /auth_token=;/);
    });

    test("cookie de usuario removido e invalidado", async () => {
      const cookie = require("../helpers/http").buildAuthCookie(
        context.auth.usuario,
      );
      await context.auth.usuario.destroy();

      const response = await request(context.app)
        .get("/clientes")
        .set("Cookie", cookie)
        .expect(401);

      assert.equal(typeof response.body.message, "string");
    });

    test("cookie de usuario inativo recebe 403", async () => {
      await context.auth.usuario.update({ status: "Inativo" });

      const response = await apiRequest(context, "get", "/clientes").expect(403);

      assert.equal(typeof response.body.message, "string");
    });
  });
};
