const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const {
  createItemServico,
  createProduto,
  createServico,
} = require("../helpers/factories");
const { apiRequest } = require("../helpers/http");

async function createItemThroughApi(context, servico, produto, quantidade) {
  return apiRequest(context, "post", "/itens-servico")
    .send({
      idServico: servico.id,
      idProduto: produto.id,
      quantidadeUtilizada: quantidade,
    })
    .expect(201);
}

module.exports = function registerItensServicoTests(context) {
  describe("itens de servico", () => {
    test("GET /itens-servico lista itens com servico e produto", async () => {
      const created = await createItemServico(context.models);

      const response = await apiRequest(
        context,
        "get",
        "/itens-servico",
      ).expect(200);

      assert.ok(Array.isArray(response.body));
      assert.equal(response.body[0].id, created.itemServico.id);
      assert.equal(response.body[0].servico.id, created.servico.id);
      assert.equal(response.body[0].produto.id, created.produto.id);
    });

    test("GET /itens-servico/:id retorna recurso e trata identificadores", async () => {
      const created = await createItemServico(context.models);

      const response = await apiRequest(
        context,
        "get",
        `/itens-servico/${created.itemServico.id}`,
      ).expect(200);

      assert.equal(response.body.id, created.itemServico.id);
      assert.equal(response.body.produto.id, created.produto.id);

      await apiRequest(context, "get", "/itens-servico/abc").expect(400);
      await apiRequest(context, "get", "/itens-servico/999999").expect(404);
    });

    test("POST /itens-servico persiste item, baixa estoque e recalcula servico", async () => {
      const createdService = await createServico(context.models);
      const produto = await createProduto(context.models, {
        estoqueAtual: 10,
        preco: 12.5,
      });

      const response = await createItemThroughApi(
        context,
        createdService.servico,
        produto,
        2,
      );

      assert.equal(response.body.idServico, createdService.servico.id);
      assert.equal(response.body.idProduto, produto.id);
      assert.equal(Number(response.body.quantidadeUtilizada), 2);

      await produto.reload();
      await createdService.servico.reload();
      assert.equal(Number(produto.estoqueAtual), 8);
      assert.equal(Number(createdService.servico.valorTotal), 25);
      assert.ok(await context.models.ItemServico.findByPk(response.body.id));
    });

    test("POST /itens-servico valida obrigatorios e numeros", async () => {
      await apiRequest(context, "post", "/itens-servico")
        .send({})
        .expect(400);

      const createdService = await createServico(context.models);
      const produto = await createProduto(context.models);
      const invalidPayloads = [
        {
          idServico: 0,
          idProduto: produto.id,
          quantidadeUtilizada: 1,
        },
        {
          idServico: createdService.servico.id,
          idProduto: 0,
          quantidadeUtilizada: 1,
        },
        {
          idServico: createdService.servico.id,
          idProduto: produto.id,
          quantidadeUtilizada: 0,
        },
        {
          idServico: createdService.servico.id,
          idProduto: produto.id,
          quantidadeUtilizada: 1.5,
        },
      ];

      for (const payload of invalidPayloads) {
        await apiRequest(context, "post", "/itens-servico")
          .send(payload)
          .expect(400);
      }
    });

    test("POST /itens-servico trata servico e produto inexistentes", async () => {
      const createdService = await createServico(context.models);
      const produto = await createProduto(context.models);

      await apiRequest(context, "post", "/itens-servico")
        .send({
          idServico: 999999,
          idProduto: produto.id,
          quantidadeUtilizada: 1,
        })
        .expect(404);

      await apiRequest(context, "post", "/itens-servico")
        .send({
          idServico: createdService.servico.id,
          idProduto: 999999,
          quantidadeUtilizada: 1,
        })
        .expect(404);
    });

    test("POST /itens-servico faz rollback quando estoque e insuficiente", async () => {
      const createdService = await createServico(context.models);
      const produto = await createProduto(context.models, {
        estoqueAtual: 2,
        preco: 10,
      });

      await apiRequest(context, "post", "/itens-servico")
        .send({
          idServico: createdService.servico.id,
          idProduto: produto.id,
          quantidadeUtilizada: 3,
        })
        .expect(409);

      await produto.reload();
      await createdService.servico.reload();
      assert.equal(Number(produto.estoqueAtual), 2);
      assert.equal(Number(createdService.servico.valorTotal), 0);
      assert.equal(await context.models.ItemServico.count(), 0);
    });

    test("PUT /itens-servico/:id ajusta estoque e valor total", async () => {
      const createdService = await createServico(context.models);
      const produto = await createProduto(context.models, {
        estoqueAtual: 10,
        preco: 10,
      });
      const creation = await createItemThroughApi(
        context,
        createdService.servico,
        produto,
        2,
      );

      const response = await apiRequest(
        context,
        "put",
        `/itens-servico/${creation.body.id}`,
      )
        .send({ quantidadeUtilizada: 4 })
        .expect(200);

      assert.equal(Number(response.body.quantidadeUtilizada), 4);
      await produto.reload();
      await createdService.servico.reload();
      assert.equal(Number(produto.estoqueAtual), 6);
      assert.equal(Number(createdService.servico.valorTotal), 40);
    });

    test("PUT /itens-servico/:id troca produto e servico preservando integridade", async () => {
      const servicoAntigo = await createServico(context.models);
      const servicoNovo = await createServico(context.models);
      const produtoAntigo = await createProduto(context.models, {
        estoqueAtual: 10,
        preco: 5,
      });
      const produtoNovo = await createProduto(context.models, {
        estoqueAtual: 20,
        preco: 15,
      });
      const creation = await createItemThroughApi(
        context,
        servicoAntigo.servico,
        produtoAntigo,
        2,
      );

      await apiRequest(
        context,
        "put",
        `/itens-servico/${creation.body.id}`,
      )
        .send({
          idServico: servicoNovo.servico.id,
          idProduto: produtoNovo.id,
          quantidadeUtilizada: 3,
        })
        .expect(200);

      await Promise.all([
        produtoAntigo.reload(),
        produtoNovo.reload(),
        servicoAntigo.servico.reload(),
        servicoNovo.servico.reload(),
      ]);

      assert.equal(Number(produtoAntigo.estoqueAtual), 10);
      assert.equal(Number(produtoNovo.estoqueAtual), 17);
      assert.equal(Number(servicoAntigo.servico.valorTotal), 0);
      assert.equal(Number(servicoNovo.servico.valorTotal), 45);
    });

    test("PUT /itens-servico/:id valida ID, recurso e referencias", async () => {
      await apiRequest(context, "put", "/itens-servico/abc")
        .send({ quantidadeUtilizada: 1 })
        .expect(400);
      await apiRequest(context, "put", "/itens-servico/999999")
        .send({ quantidadeUtilizada: 1 })
        .expect(404);

      const created = await createItemServico(context.models);
      const invalidPayloads = [
        { idServico: 0 },
        { idProduto: 0 },
        { quantidadeUtilizada: 0 },
        { quantidadeUtilizada: 1.5 },
      ];

      for (const payload of invalidPayloads) {
        await apiRequest(
          context,
          "put",
          `/itens-servico/${created.itemServico.id}`,
        )
          .send(payload)
          .expect(400);
      }

      await apiRequest(
        context,
        "put",
        `/itens-servico/${created.itemServico.id}`,
      )
        .send({ idServico: 999999 })
        .expect(404);
      await apiRequest(
        context,
        "put",
        `/itens-servico/${created.itemServico.id}`,
      )
        .send({ idProduto: 999999 })
        .expect(404);
    });

    test("PUT /itens-servico/:id faz rollback se novo estoque for insuficiente", async () => {
      const createdService = await createServico(context.models);
      const produto = await createProduto(context.models, {
        estoqueAtual: 5,
        preco: 10,
      });
      const creation = await createItemThroughApi(
        context,
        createdService.servico,
        produto,
        2,
      );

      await apiRequest(
        context,
        "put",
        `/itens-servico/${creation.body.id}`,
      )
        .send({ quantidadeUtilizada: 6 })
        .expect(409);

      const item = await context.models.ItemServico.findByPk(creation.body.id);
      await produto.reload();
      await createdService.servico.reload();
      assert.equal(Number(item.quantidadeUtilizada), 2);
      assert.equal(Number(produto.estoqueAtual), 3);
      assert.equal(Number(createdService.servico.valorTotal), 20);
    });

    test("DELETE /itens-servico/:id devolve estoque e recalcula servico", async () => {
      const createdService = await createServico(context.models);
      const produto = await createProduto(context.models, {
        estoqueAtual: 10,
        preco: 10,
      });
      const creation = await createItemThroughApi(
        context,
        createdService.servico,
        produto,
        3,
      );

      await apiRequest(
        context,
        "delete",
        `/itens-servico/${creation.body.id}`,
      ).expect(200);

      await produto.reload();
      await createdService.servico.reload();
      assert.equal(Number(produto.estoqueAtual), 10);
      assert.equal(Number(createdService.servico.valorTotal), 0);
      assert.equal(
        await context.models.ItemServico.findByPk(creation.body.id),
        null,
      );
    });

    test("DELETE /itens-servico/:id trata ID invalido e inexistente", async () => {
      await apiRequest(context, "delete", "/itens-servico/abc").expect(400);
      await apiRequest(context, "delete", "/itens-servico/999999").expect(404);
    });
  });
};
