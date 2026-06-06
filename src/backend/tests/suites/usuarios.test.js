const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const { verifyPassword } = require("../../utils/auth");
const {
  createPerfil,
  createUsuario,
} = require("../helpers/factories");
const {
  apiRequest,
  buildAuthCookie,
  request,
} = require("../helpers/http");

module.exports = function registerUsuariosTests(context) {
  describe("usuarios: sessao", () => {
    test("POST /usuarios/login autentica, retorna permissoes e cria cookie seguro", async () => {
      const response = await request(context.app)
        .post("/usuarios/login")
        .send({
          email: context.auth.usuario.email,
          senha: context.auth.password,
        })
        .expect(200);

      assert.equal(response.body.usuario.id, context.auth.usuario.id);
      assert.equal(response.body.usuario.perfil, context.auth.perfil.nome);
      assert.deepEqual(response.body.usuario.permissoes, [
        context.auth.permissao.chave,
      ]);
      assert.equal(response.body.usuario.senhaHash, undefined);

      const cookies = response.headers["set-cookie"].join(";");
      assert.match(cookies, /auth_token=/);
      assert.match(cookies, /HttpOnly/i);
      assert.match(cookies, /SameSite=Lax/i);
    });

    test("POST /usuarios/login valida campos obrigatorios e email", async () => {
      await request(context.app)
        .post("/usuarios/login")
        .send({})
        .expect(400);

      await request(context.app)
        .post("/usuarios/login")
        .send({ email: "email-invalido", senha: "senha123" })
        .expect(400);
    });

    test("POST /usuarios/login rejeita credenciais incorretas", async () => {
      await request(context.app)
        .post("/usuarios/login")
        .send({
          email: context.auth.usuario.email,
          senha: "senha-errada",
        })
        .expect(401);
    });

    test("POST /usuarios/login rejeita usuario inativo", async () => {
      await context.auth.usuario.update({ status: "Inativo" });

      await request(context.app)
        .post("/usuarios/login")
        .send({
          email: context.auth.usuario.email,
          senha: context.auth.password,
        })
        .expect(403);
    });

    test("GET /usuarios/me restaura a sessao pelo cookie", async () => {
      const response = await request(context.app)
        .get("/usuarios/me")
        .set("Cookie", buildAuthCookie(context.auth.usuario))
        .expect(200);

      assert.equal(response.body.usuario.id, context.auth.usuario.id);
      assert.ok(Array.isArray(response.body.usuario.permissoes));
      assert.equal(response.body.usuario.senhaHash, undefined);
    });

    test("GET /usuarios/me rejeita sessao ausente, removida e inativa", async () => {
      await request(context.app).get("/usuarios/me").expect(401);

      const removed = await createUsuario(context.models);
      const removedCookie = buildAuthCookie(removed.usuario);
      await removed.usuario.destroy();
      await request(context.app)
        .get("/usuarios/me")
        .set("Cookie", removedCookie)
        .expect(401);

      const inactive = await createUsuario(context.models, {
        status: "Inativo",
      });
      await request(context.app)
        .get("/usuarios/me")
        .set("Cookie", buildAuthCookie(inactive.usuario))
        .expect(403);
    });

    test("POST /usuarios/logout limpa o cookie", async () => {
      const response = await request(context.app)
        .post("/usuarios/logout")
        .set("Cookie", buildAuthCookie(context.auth.usuario))
        .expect(204);

      assert.match(response.headers["set-cookie"].join(";"), /auth_token=;/);
    });
  });

  describe("usuarios: CRUD", () => {
    test("GET /usuarios lista usuarios sem expor hashes", async () => {
      const created = await createUsuario(context.models);
      const response = await apiRequest(context, "get", "/usuarios").expect(200);

      assert.ok(Array.isArray(response.body));
      assert.ok(response.body.some((usuario) => usuario.id === created.usuario.id));
      assert.ok(response.body.every((usuario) => usuario.senhaHash === undefined));
    });

    test("GET /usuarios/:id retorna usuario e trata ID invalido ou inexistente", async () => {
      const created = await createUsuario(context.models);
      const response = await apiRequest(
        context,
        "get",
        `/usuarios/${created.usuario.id}`,
      ).expect(200);

      assert.equal(response.body.id, created.usuario.id);
      assert.equal(response.body.perfil, created.perfil.nome);
      assert.equal(response.body.senhaHash, undefined);

      await apiRequest(context, "get", "/usuarios/abc").expect(400);
      await apiRequest(context, "get", "/usuarios/999999").expect(404);
    });

    test("POST /usuarios cria usuario com senha hasheada e perfil", async () => {
      const perfil = await createPerfil(context.models, {
        nome: "Atendente",
      });
      const payload = {
        nome: "Novo Usuario",
        email: "novo.usuario@example.com",
        perfil: perfil.nome,
        status: "Ativo",
        senha: "segredo123",
      };

      const response = await apiRequest(context, "post", "/usuarios")
        .send(payload)
        .expect(201);

      assert.equal(response.body.nome, payload.nome);
      assert.equal(response.body.perfil, perfil.nome);
      assert.equal(response.body.senhaHash, undefined);

      const persisted = await context.models.Usuario.findByPk(response.body.id);
      assert.equal(persisted.email, payload.email);
      assert.notEqual(persisted.senhaHash, payload.senha);
      assert.equal(verifyPassword(payload.senha, persisted.senhaHash), true);
    });

    test("POST /usuarios valida obrigatorios, formato e perfil", async () => {
      await apiRequest(context, "post", "/usuarios").send({}).expect(400);

      const invalidPayloads = [
        {
          nome: "Teste",
          email: "invalido",
          perfil: context.auth.perfil.nome,
          status: "Ativo",
          senha: "senha123",
        },
        {
          nome: "Teste",
          email: "teste1@example.com",
          perfil: context.auth.perfil.nome,
          status: "Bloqueado",
          senha: "senha123",
        },
        {
          nome: "Teste",
          email: "teste2@example.com",
          perfil: context.auth.perfil.nome,
          status: "Ativo",
          senha: "123",
        },
        {
          nome: "Teste",
          email: "teste3@example.com",
          perfil: "Perfil inexistente",
          status: "Ativo",
          senha: "senha123",
        },
      ];

      for (const payload of invalidPayloads) {
        await apiRequest(context, "post", "/usuarios")
          .send(payload)
          .expect(400);
      }
    });

    test("POST /usuarios rejeita email duplicado sem criar registro", async () => {
      const beforeCount = await context.models.Usuario.count();

      await apiRequest(context, "post", "/usuarios")
        .send({
          nome: "Duplicado",
          email: context.auth.usuario.email,
          perfil: context.auth.perfil.nome,
          status: "Ativo",
          senha: "senha123",
        })
        .expect(409);

      assert.equal(await context.models.Usuario.count(), beforeCount);
    });

    test("PUT /usuarios/:id atualiza todos os campos e a senha", async () => {
      const created = await createUsuario(context.models);
      const novoPerfil = await createPerfil(context.models, {
        nome: "Gerente",
      });
      const payload = {
        nome: "Usuario Atualizado",
        email: "atualizado@example.com",
        perfil: novoPerfil.nome,
        status: "Inativo",
        senha: "novaSenha123",
      };

      const response = await apiRequest(
        context,
        "put",
        `/usuarios/${created.usuario.id}`,
      )
        .send(payload)
        .expect(200);

      assert.equal(response.body.nome, payload.nome);
      assert.equal(response.body.email, payload.email);
      assert.equal(response.body.status, payload.status);
      assert.equal(response.body.perfil, novoPerfil.nome);

      const persisted = await context.models.Usuario.findByPk(
        created.usuario.id,
      );
      assert.equal(persisted.idPerfil, novoPerfil.id);
      assert.equal(verifyPassword(payload.senha, persisted.senhaHash), true);
    });

    test("PUT /usuarios/:id permite atualizacao parcial de status", async () => {
      const created = await createUsuario(context.models);

      const response = await apiRequest(
        context,
        "put",
        `/usuarios/${created.usuario.id}`,
      )
        .send({ status: "Inativo" })
        .expect(200);

      assert.equal(response.body.status, "Inativo");
      assert.equal(response.body.nome, created.usuario.nome);
    });

    test("PUT /usuarios/:id valida ID, recurso, payload e perfil", async () => {
      await apiRequest(context, "put", "/usuarios/abc")
        .send({ nome: "Teste" })
        .expect(400);
      await apiRequest(context, "put", "/usuarios/999999")
        .send({ nome: "Teste" })
        .expect(404);

      const created = await createUsuario(context.models);
      const invalidPayloads = [
        { email: "invalido" },
        { status: "Bloqueado" },
        { senha: "123" },
        { perfil: "Perfil inexistente" },
      ];

      for (const payload of invalidPayloads) {
        await apiRequest(
          context,
          "put",
          `/usuarios/${created.usuario.id}`,
        )
          .send(payload)
          .expect(400);
      }
    });

    test("PUT /usuarios/:id rejeita email duplicado e preserva dados", async () => {
      const created = await createUsuario(context.models);

      await apiRequest(
        context,
        "put",
        `/usuarios/${created.usuario.id}`,
      )
        .send({ email: context.auth.usuario.email })
        .expect(409);

      await created.usuario.reload();
      assert.notEqual(created.usuario.email, context.auth.usuario.email);
    });

    test("DELETE /usuarios/:id remove o usuario e trata erros", async () => {
      const created = await createUsuario(context.models);

      await apiRequest(
        context,
        "delete",
        `/usuarios/${created.usuario.id}`,
      ).expect(200);

      assert.equal(
        await context.models.Usuario.findByPk(created.usuario.id),
        null,
      );

      await apiRequest(context, "delete", "/usuarios/abc").expect(400);
      await apiRequest(context, "delete", "/usuarios/999999").expect(404);
    });
  });
};
