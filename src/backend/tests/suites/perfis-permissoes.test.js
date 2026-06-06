const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const {
  createPerfil,
  createPermissao,
  createUsuario,
} = require("../helpers/factories");
const { apiRequest } = require("../helpers/http");

module.exports = function registerPerfisPermissoesTests(context) {
  describe("permissoes", () => {
    test("GET /permissoes lista registros ordenados", async () => {
      await createPermissao(context.models, { chave: "clientes.editar" });
      await createPermissao(context.models, { chave: "clientes.adicionar" });

      const response = await apiRequest(
        context,
        "get",
        "/permissoes",
      ).expect(200);

      assert.ok(Array.isArray(response.body));
      const keys = response.body.map((permissao) => permissao.chave);
      assert.deepEqual(keys, [...keys].sort());
    });

    test("GET /permissoes/:id retorna recurso e trata identificadores", async () => {
      const permissao = await createPermissao(context.models);

      const response = await apiRequest(
        context,
        "get",
        `/permissoes/${permissao.id}`,
      ).expect(200);

      assert.equal(response.body.chave, permissao.chave);
      await apiRequest(context, "get", "/permissoes/abc").expect(400);
      await apiRequest(context, "get", "/permissoes/999999").expect(404);
    });

    test("POST /permissoes cria registro e valida chave obrigatoria", async () => {
      const response = await apiRequest(context, "post", "/permissoes")
        .send({
          chave: "produtos.adicionar",
          descricao: "Adicionar produtos",
        })
        .expect(201);

      assert.equal(response.body.chave, "produtos.adicionar");
      assert.ok(await context.models.Permissao.findByPk(response.body.id));

      await apiRequest(context, "post", "/permissoes")
        .send({ descricao: "Sem chave" })
        .expect(400);
    });

    test("POST /permissoes rejeita chave duplicada", async () => {
      const permissao = await createPermissao(context.models);

      await apiRequest(context, "post", "/permissoes")
        .send({ chave: permissao.chave })
        .expect(409);

      assert.equal(
        await context.models.Permissao.count({
          where: { chave: permissao.chave },
        }),
        1,
      );
    });

    test("PUT /permissoes/:id atualiza e valida payload", async () => {
      const permissao = await createPermissao(context.models);

      const response = await apiRequest(
        context,
        "put",
        `/permissoes/${permissao.id}`,
      )
        .send({
          chave: "produtos.editar",
          descricao: "Editar produtos",
        })
        .expect(200);

      assert.equal(response.body.chave, "produtos.editar");
      assert.equal(response.body.descricao, "Editar produtos");

      await apiRequest(context, "put", `/permissoes/${permissao.id}`)
        .send({ chave: "" })
        .expect(400);
    });

    test("PUT /permissoes/:id trata ID, inexistencia e duplicidade", async () => {
      await apiRequest(context, "put", "/permissoes/abc")
        .send({ chave: "teste" })
        .expect(400);
      await apiRequest(context, "put", "/permissoes/999999")
        .send({ chave: "teste" })
        .expect(404);

      const primeira = await createPermissao(context.models);
      const segunda = await createPermissao(context.models);
      await apiRequest(context, "put", `/permissoes/${segunda.id}`)
        .send({ chave: primeira.chave })
        .expect(409);
    });

    test("DELETE /permissoes/:id remove permissao sem vinculos", async () => {
      const permissao = await createPermissao(context.models);

      await apiRequest(
        context,
        "delete",
        `/permissoes/${permissao.id}`,
      ).expect(200);

      assert.equal(
        await context.models.Permissao.findByPk(permissao.id),
        null,
      );
    });

    test("DELETE /permissoes/:id protege IDs e vinculos com perfis", async () => {
      await apiRequest(context, "delete", "/permissoes/abc").expect(400);
      await apiRequest(context, "delete", "/permissoes/999999").expect(404);

      const permissao = await createPermissao(context.models);
      const perfil = await createPerfil(context.models);
      await perfil.setPermissoes([permissao]);

      await apiRequest(
        context,
        "delete",
        `/permissoes/${permissao.id}`,
      ).expect(409);
      assert.ok(await context.models.Permissao.findByPk(permissao.id));
    });
  });

  describe("perfis", () => {
    test("GET /perfis lista perfis com permissoes", async () => {
      const perfil = await createPerfil(context.models, { nome: "Atendente" });
      const permissao = await createPermissao(context.models);
      await perfil.setPermissoes([permissao]);

      const response = await apiRequest(context, "get", "/perfis").expect(200);

      assert.ok(Array.isArray(response.body));
      const returned = response.body.find((item) => item.id === perfil.id);
      assert.equal(returned.nome, perfil.nome);
      assert.equal(returned.permissoes[0].id, permissao.id);
    });

    test("GET /perfis/:id retorna perfil e trata identificadores", async () => {
      const perfil = await createPerfil(context.models);

      const response = await apiRequest(
        context,
        "get",
        `/perfis/${perfil.id}`,
      ).expect(200);

      assert.equal(response.body.nome, perfil.nome);
      assert.ok(Array.isArray(response.body.permissoes));

      await apiRequest(context, "get", "/perfis/abc").expect(400);
      await apiRequest(context, "get", "/perfis/999999").expect(404);
    });

    test("POST /perfis cria perfil e valida nome obrigatorio", async () => {
      const response = await apiRequest(context, "post", "/perfis")
        .send({ nome: "Consultor" })
        .expect(201);

      assert.equal(response.body.nome, "Consultor");
      assert.ok(await context.models.Perfil.findByPk(response.body.id));

      await apiRequest(context, "post", "/perfis").send({}).expect(400);
    });

    test("POST /perfis rejeita nome duplicado", async () => {
      const perfil = await createPerfil(context.models);

      await apiRequest(context, "post", "/perfis")
        .send({ nome: perfil.nome })
        .expect(409);
    });

    test("PUT /perfis/:id atualiza nome e valida payload", async () => {
      const perfil = await createPerfil(context.models);

      const response = await apiRequest(
        context,
        "put",
        `/perfis/${perfil.id}`,
      )
        .send({ nome: "Supervisor" })
        .expect(200);

      assert.equal(response.body.nome, "Supervisor");
      await perfil.reload();
      assert.equal(perfil.nome, "Supervisor");

      await apiRequest(context, "put", `/perfis/${perfil.id}`)
        .send({ nome: "" })
        .expect(400);
    });

    test("PUT /perfis/:id trata ID, inexistencia e duplicidade", async () => {
      await apiRequest(context, "put", "/perfis/abc")
        .send({ nome: "Teste" })
        .expect(400);
      await apiRequest(context, "put", "/perfis/999999")
        .send({ nome: "Teste" })
        .expect(404);

      const primeiro = await createPerfil(context.models);
      const segundo = await createPerfil(context.models);
      await apiRequest(context, "put", `/perfis/${segundo.id}`)
        .send({ nome: primeiro.nome })
        .expect(409);
    });

    test("GET /perfis/:id/permissoes retorna associacoes e trata erros", async () => {
      const perfil = await createPerfil(context.models);
      const permissao = await createPermissao(context.models);
      await perfil.setPermissoes([permissao]);

      const response = await apiRequest(
        context,
        "get",
        `/perfis/${perfil.id}/permissoes`,
      ).expect(200);

      assert.deepEqual(
        response.body.map((item) => item.id),
        [permissao.id],
      );
      await apiRequest(context, "get", "/perfis/abc/permissoes").expect(400);
      await apiRequest(
        context,
        "get",
        "/perfis/999999/permissoes",
      ).expect(404);
    });

    test("PUT /perfis/:id/permissoes substitui associacoes sem duplicar", async () => {
      const perfil = await createPerfil(context.models);
      const primeira = await createPermissao(context.models);
      const segunda = await createPermissao(context.models);

      const response = await apiRequest(
        context,
        "put",
        `/perfis/${perfil.id}/permissoes`,
      )
        .send({
          ids_permissoes: [primeira.id, segunda.id, primeira.id],
        })
        .expect(200);

      assert.deepEqual(
        response.body.permissoes
          .map((item) => item.id)
          .sort((a, b) => a - b),
        [primeira.id, segunda.id].sort((a, b) => a - b),
      );
      assert.equal(
        await context.models.PerfilPermissao.count({
          where: { idPerfil: perfil.id },
        }),
        2,
      );

      await apiRequest(
        context,
        "put",
        `/perfis/${perfil.id}/permissoes`,
      )
        .send({})
        .expect(200);
      assert.equal(
        await context.models.PerfilPermissao.count({
          where: { idPerfil: perfil.id },
        }),
        0,
      );
    });

    test("PUT /perfis/:id/permissoes valida perfil, formato e IDs", async () => {
      const perfil = await createPerfil(context.models);

      await apiRequest(context, "put", "/perfis/abc/permissoes")
        .send({ ids_permissoes: [] })
        .expect(400);
      await apiRequest(context, "put", "/perfis/999999/permissoes")
        .send({ ids_permissoes: [] })
        .expect(404);
      await apiRequest(
        context,
        "put",
        `/perfis/${perfil.id}/permissoes`,
      )
        .send({ ids_permissoes: "invalido" })
        .expect(400);
      await apiRequest(
        context,
        "put",
        `/perfis/${perfil.id}/permissoes`,
      )
        .send({ ids_permissoes: [0] })
        .expect(400);
      await apiRequest(
        context,
        "put",
        `/perfis/${perfil.id}/permissoes`,
      )
        .send({ ids_permissoes: [999999] })
        .expect(404);
    });

    test("DELETE /perfis/:id remove perfil e suas associacoes", async () => {
      const perfil = await createPerfil(context.models);
      const permissao = await createPermissao(context.models);
      await perfil.setPermissoes([permissao]);

      await apiRequest(context, "delete", `/perfis/${perfil.id}`).expect(200);

      assert.equal(await context.models.Perfil.findByPk(perfil.id), null);
      assert.equal(
        await context.models.PerfilPermissao.count({
          where: { idPerfil: perfil.id },
        }),
        0,
      );
    });

    test("DELETE /perfis/:id protege IDs e perfis com usuarios", async () => {
      await apiRequest(context, "delete", "/perfis/abc").expect(400);
      await apiRequest(context, "delete", "/perfis/999999").expect(404);

      const perfil = await createPerfil(context.models);
      await createUsuario(context.models, {
        perfil,
        idPerfil: perfil.id,
      });

      await apiRequest(context, "delete", `/perfis/${perfil.id}`).expect(409);
      assert.ok(await context.models.Perfil.findByPk(perfil.id));
    });
  });
};
