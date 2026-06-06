const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const {
  createItemServico,
  createProduto,
  produtoPayload,
} = require("../helpers/factories");
const { apiRequest } = require("../helpers/http");

module.exports = function registerProdutosTests(context) {
  describe("produtos", () => {
    test("GET /produtos lista valores numericos normalizados", async () => {
      const produto = await createProduto(context.models);

      const response = await apiRequest(context, "get", "/produtos").expect(200);

      assert.ok(Array.isArray(response.body));
      assert.equal(response.body[0].id, produto.id);
      assert.equal(typeof response.body[0].quantidade, "number");
      assert.equal(typeof response.body[0].precoUnitario, "number");
    });

    test("GET /produtos/:id retorna recurso e trata identificadores invalidos", async () => {
      const produto = await createProduto(context.models);

      const response = await apiRequest(
        context,
        "get",
        `/produtos/${produto.id}`,
      ).expect(200);

      assert.equal(response.body.nome, produto.nome);
      assert.equal(Number(response.body.quantidade), Number(produto.quantidade));

      await apiRequest(context, "get", "/produtos/abc").expect(400);
      await apiRequest(context, "get", "/produtos/999999").expect(404);
    });

    test("POST /produtos cria produto e aceita estoque zero", async () => {
      const payload = produtoPayload({
        nome: "Produto sem estoque",
        quantidade: 0,
        precoUnitario: 12.5,
      });

      const response = await apiRequest(context, "post", "/produtos")
        .send(payload)
        .expect(201);

      assert.equal(response.body.nome, payload.nome);
      assert.equal(Number(response.body.quantidade), 0);

      const persisted = await context.models.Produto.findByPk(response.body.id);
      assert.equal(Number(persisted.precoUnitario), payload.precoUnitario);
    });

    test("POST /produtos valida obrigatorios, numeros e limites", async () => {
      await apiRequest(context, "post", "/produtos").send({}).expect(400);

      const invalidPayloads = [
        produtoPayload({ quantidade: -1 }),
        produtoPayload({ quantidade: 1.5 }),
        produtoPayload({ precoUnitario: -0.01 }),
        produtoPayload({ precoUnitario: "invalido" }),
        produtoPayload({ quantidade: 100000000 }),
        produtoPayload({ precoUnitario: 100000000 }),
      ];

      for (const payload of invalidPayloads) {
        await apiRequest(context, "post", "/produtos")
          .send(payload)
          .expect(400);
      }
    });

    test("PUT /produtos/:id atualiza valores e aceita zerar estoque", async () => {
      const produto = await createProduto(context.models);

      const response = await apiRequest(
        context,
        "put",
        `/produtos/${produto.id}`,
      )
        .send({
          nome: "Produto Atualizado",
          quantidade: 0,
          precoUnitario: 99.9,
        })
        .expect(200);

      assert.equal(response.body.nome, "Produto Atualizado");
      assert.equal(Number(response.body.quantidade), 0);
      assert.equal(Number(response.body.precoUnitario), 99.9);

      await produto.reload();
      assert.equal(Number(produto.quantidade), 0);
    });

    test("PUT /produtos/:id valida ID, recurso e payload", async () => {
      await apiRequest(context, "put", "/produtos/abc")
        .send({ nome: "Teste" })
        .expect(400);
      await apiRequest(context, "put", "/produtos/999999")
        .send({ nome: "Teste" })
        .expect(404);

      const produto = await createProduto(context.models);
      const invalidPayloads = [
        { quantidade: -1 },
        { quantidade: 1.5 },
        { precoUnitario: -1 },
        { precoUnitario: "invalido" },
        { quantidade: 100000000 },
      ];

      for (const payload of invalidPayloads) {
        await apiRequest(context, "put", `/produtos/${produto.id}`)
          .send(payload)
          .expect(400);
      }
    });

    test("DELETE /produtos/:id remove produto sem itens", async () => {
      const produto = await createProduto(context.models);

      await apiRequest(context, "delete", `/produtos/${produto.id}`).expect(200);

      assert.equal(await context.models.Produto.findByPk(produto.id), null);
    });

    test("DELETE /produtos/:id trata ID, inexistencia e vinculos", async () => {
      await apiRequest(context, "delete", "/produtos/abc").expect(400);
      await apiRequest(context, "delete", "/produtos/999999").expect(404);

      const produto = await createProduto(context.models);
      await createItemServico(context.models, {
        idProduto: produto.id,
      });

      await apiRequest(context, "delete", `/produtos/${produto.id}`).expect(409);
      assert.ok(await context.models.Produto.findByPk(produto.id));
    });
  });
};
