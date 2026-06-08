const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const {
  createItemServico,
  createProduto,
  createProdutoReferences,
  produtoPayload,
} = require("../helpers/factories");
const { apiRequest } = require("../helpers/http");

function withReferences(payload, references) {
  return {
    ...payload,
    idCategoria: references.categoria.id,
    idFornecedor: references.fornecedor.id,
    idMarca: references.marca.id,
  };
}

module.exports = function registerProdutosTests(context) {
  describe("produtos", () => {
    test("GET /produtos lista valores numericos e relacionamentos", async () => {
      const references = await createProdutoReferences(context.models);
      const produto = await createProduto(context.models, {
        idCategoria: references.categoria.id,
        idFornecedor: references.fornecedor.id,
        idMarca: references.marca.id,
      });

      const response = await apiRequest(context, "get", "/produtos").expect(200);

      assert.ok(Array.isArray(response.body));
      assert.equal(response.body[0].id, produto.id);
      assert.equal(typeof response.body[0].estoqueAtual, "number");
      assert.equal(typeof response.body[0].preco, "number");
      assert.equal(response.body[0].categoria.id, references.categoria.id);
      assert.equal(response.body[0].marca.id, references.marca.id);
      assert.equal(response.body[0].fornecedor.id, references.fornecedor.id);
      assert.equal(response.body[0].precoUnitario, undefined);
    });

    test("GET /produtos/:id retorna recurso e trata identificadores invalidos", async () => {
      const produto = await createProduto(context.models);

      const response = await apiRequest(
        context,
        "get",
        `/produtos/${produto.id}`,
      ).expect(200);

      assert.equal(response.body.titulo, produto.titulo);
      assert.equal(
        Number(response.body.estoqueAtual),
        Number(produto.estoqueAtual),
      );

      await apiRequest(context, "get", "/produtos/abc").expect(400);
      await apiRequest(context, "get", "/produtos/999999").expect(404);
    });

    test("POST /produtos cria produto com categoria, marca e fornecedor", async () => {
      const references = await createProdutoReferences(context.models);
      const payload = withReferences(
        produtoPayload({
          titulo: "Produto sem estoque",
          estoqueAtual: 0,
          preco: 12.5,
        }),
        references,
      );

      const response = await apiRequest(context, "post", "/produtos")
        .send(payload)
        .expect(201);

      assert.equal(response.body.titulo, payload.titulo);
      assert.equal(response.body.estoqueAtual, 0);
      assert.equal(response.body.preco, payload.preco);
      assert.equal(response.body.marca.id, references.marca.id);
      assert.equal(response.body.categoria.id, references.categoria.id);

      const persisted = await context.models.Produto.findByPk(response.body.id);
      assert.equal(Number(persisted.preco), payload.preco);
      assert.equal(persisted.idFornecedor, references.fornecedor.id);
    });

    test("POST /produtos exige titulo, codigoSku, preco e tipoItem", async () => {
      const requiredFields = ["titulo", "codigoSku", "preco", "tipoItem"];

      for (const field of requiredFields) {
        const payload = produtoPayload();
        delete payload[field];

        await apiRequest(context, "post", "/produtos")
          .send(payload)
          .expect(400);
      }
    });

    test("POST /produtos valida obrigatorios, numeros e limites", async () => {
      const references = await createProdutoReferences(context.models);

      await apiRequest(context, "post", "/produtos").send({}).expect(400);

      const invalidPayloads = [
        produtoPayload({ estoqueAtual: -1 }),
        produtoPayload({ estoqueAtual: 1.5 }),
        produtoPayload({ preco: -0.01 }),
        produtoPayload({ preco: "invalido" }),
        produtoPayload({ estoqueAtual: 100000000 }),
        produtoPayload({ preco: 100000000 }),
      ];

      for (const payload of invalidPayloads) {
        await apiRequest(context, "post", "/produtos")
          .send(withReferences(payload, references))
          .expect(400);
      }
    });

    test("POST /produtos rejeita referencias inexistentes e SKU duplicado", async () => {
      const references = await createProdutoReferences(context.models);
      const payload = withReferences(produtoPayload(), references);

      await apiRequest(context, "post", "/produtos")
        .send({
          ...payload,
          idCategoria: 999999,
        })
        .expect(400);

      await apiRequest(context, "post", "/produtos")
        .send(payload)
        .expect(201);

      await apiRequest(context, "post", "/produtos")
        .send({
          ...withReferences(produtoPayload(), references),
          codigoSku: payload.codigoSku,
        })
        .expect(409);
    });

    test("PUT /produtos/:id atualiza campos e relacionamentos", async () => {
      const produto = await createProduto(context.models);
      const references = await createProdutoReferences(context.models);

      const response = await apiRequest(
        context,
        "put",
        `/produtos/${produto.id}`,
      )
        .send(
          withReferences(
            {
              titulo: "Produto Atualizado",
              descricao: "Nova descricao",
              codigoSku: "SKU-ATUALIZADO",
              tipoItem: "Produto",
              estoqueAtual: 0,
              preco: 99.9,
            },
            references,
          ),
        )
        .expect(200);

      assert.equal(response.body.titulo, "Produto Atualizado");
      assert.equal(response.body.estoqueAtual, 0);
      assert.equal(response.body.preco, 99.9);
      assert.equal(response.body.categoria.id, references.categoria.id);
      assert.equal(response.body.marca.id, references.marca.id);

      await produto.reload();
      assert.equal(Number(produto.estoqueAtual), 0);
      assert.equal(produto.idFornecedor, references.fornecedor.id);
    });

    test("PUT /produtos/:id aceita corpo vazio sem alterar o produto", async () => {
      const produto = await createProduto(context.models);
      const before = produto.toJSON();

      const response = await apiRequest(
        context,
        "put",
        `/produtos/${produto.id}`,
      )
        .send({})
        .expect(200);

      assert.equal(response.body.titulo, before.titulo);
      assert.equal(response.body.codigoSku, before.codigoSku);
      assert.equal(response.body.preco, Number(before.preco));
      assert.equal(response.body.estoqueAtual, Number(before.estoqueAtual));

      await produto.reload();
      assert.equal(produto.titulo, before.titulo);
      assert.equal(produto.codigoSku, before.codigoSku);
      assert.equal(Number(produto.preco), Number(before.preco));
      assert.equal(
        Number(produto.estoqueAtual),
        Number(before.estoqueAtual),
      );
    });

    test("PUT /produtos/:id valida ID, recurso e payload", async () => {
      await apiRequest(context, "put", "/produtos/abc")
        .send({ titulo: "Teste" })
        .expect(400);
      await apiRequest(context, "put", "/produtos/999999")
        .send({ titulo: "Teste" })
        .expect(404);

      const produto = await createProduto(context.models);
      const invalidPayloads = [
        { estoqueAtual: -1 },
        { estoqueAtual: 1.5 },
        { preco: -1 },
        { preco: "invalido" },
        { estoqueAtual: 100000000 },
        { idMarca: -1 },
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
