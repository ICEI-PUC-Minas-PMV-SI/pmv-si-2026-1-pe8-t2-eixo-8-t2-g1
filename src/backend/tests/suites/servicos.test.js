const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const {
  createItemServico,
  createServico,
  createVeiculo,
  servicoPayload,
} = require("../helpers/factories");
const { apiRequest } = require("../helpers/http");

module.exports = function registerServicosTests(context) {
  describe("servicos", () => {
    test("GET /servicos lista ordens com veiculo, cliente e itens", async () => {
      const created = await createServico(context.models);

      const response = await apiRequest(context, "get", "/servicos").expect(200);

      assert.ok(Array.isArray(response.body));
      assert.equal(response.body[0].id, created.servico.id);
      assert.equal(response.body[0].veiculo.id, created.veiculo.id);
      assert.equal(response.body[0].veiculo.cliente.id, created.cliente.id);
      assert.ok(Array.isArray(response.body[0].itens));
    });

    test("GET /servicos/:id retorna recurso e trata identificadores", async () => {
      const created = await createServico(context.models);

      const response = await apiRequest(
        context,
        "get",
        `/servicos/${created.servico.id}`,
      ).expect(200);

      assert.equal(response.body.descricao, created.servico.descricao);
      assert.equal(response.body.veiculo.id, created.veiculo.id);

      await apiRequest(context, "get", "/servicos/abc").expect(400);
      await apiRequest(context, "get", "/servicos/999999").expect(404);
    });

    test("POST /servicos cria ordem vinculada ao veiculo", async () => {
      const createdVehicle = await createVeiculo(context.models);
      const payload = servicoPayload(createdVehicle.veiculo.id, {
        descricao: "Revisao completa",
        valorTotal: 150.25,
      });

      const response = await apiRequest(context, "post", "/servicos")
        .send(payload)
        .expect(201);

      assert.equal(response.body.descricao, payload.descricao);
      assert.equal(response.body.veiculo.id, createdVehicle.veiculo.id);
      assert.equal(Number(response.body.valorTotal), payload.valorTotal);

      const persisted = await context.models.Servico.findByPk(response.body.id);
      assert.equal(persisted.idVeiculo, createdVehicle.veiculo.id);
    });

    test("POST /servicos valida obrigatorios, valor e veiculo", async () => {
      await apiRequest(context, "post", "/servicos").send({}).expect(400);

      const createdVehicle = await createVeiculo(context.models);
      await apiRequest(context, "post", "/servicos")
        .send(servicoPayload(createdVehicle.veiculo.id, { valorTotal: -1 }))
        .expect(400);
      await apiRequest(context, "post", "/servicos")
        .send(servicoPayload(0))
        .expect(400);
      await apiRequest(context, "post", "/servicos")
        .send(servicoPayload(999999))
        .expect(404);
    });

    test("PUT /servicos/:id atualiza ordem e troca o veiculo", async () => {
      const created = await createServico(context.models);
      const novoVeiculo = await createVeiculo(context.models);

      const response = await apiRequest(
        context,
        "put",
        `/servicos/${created.servico.id}`,
      )
        .send({
          descricao: "Servico atualizado",
          status: "Concluida",
          dataFim: "2026-06-05",
          valorTotal: 450,
          idVeiculo: novoVeiculo.veiculo.id,
        })
        .expect(200);

      assert.equal(response.body.descricao, "Servico atualizado");
      assert.equal(response.body.veiculo.id, novoVeiculo.veiculo.id);
      assert.equal(Number(response.body.valorTotal), 450);

      await created.servico.reload();
      assert.equal(created.servico.idVeiculo, novoVeiculo.veiculo.id);
    });

    test("PUT /servicos/:id valida ID, recurso, valor e veiculo", async () => {
      await apiRequest(context, "put", "/servicos/abc")
        .send({ descricao: "Teste" })
        .expect(400);
      await apiRequest(context, "put", "/servicos/999999")
        .send({ descricao: "Teste" })
        .expect(404);

      const created = await createServico(context.models);
      await apiRequest(context, "put", `/servicos/${created.servico.id}`)
        .send({ valorTotal: -1 })
        .expect(400);
      await apiRequest(context, "put", `/servicos/${created.servico.id}`)
        .send({ idVeiculo: 0 })
        .expect(400);
      await apiRequest(context, "put", `/servicos/${created.servico.id}`)
        .send({ idVeiculo: 999999 })
        .expect(404);
    });

    test("DELETE /servicos/:id remove ordem sem itens", async () => {
      const created = await createServico(context.models);

      await apiRequest(
        context,
        "delete",
        `/servicos/${created.servico.id}`,
      ).expect(200);

      assert.equal(
        await context.models.Servico.findByPk(created.servico.id),
        null,
      );
    });

    test("DELETE /servicos/:id trata ID, inexistencia e vinculos", async () => {
      await apiRequest(context, "delete", "/servicos/abc").expect(400);
      await apiRequest(context, "delete", "/servicos/999999").expect(404);

      const created = await createServico(context.models);
      await createItemServico(context.models, {
        idServico: created.servico.id,
      });

      await apiRequest(
        context,
        "delete",
        `/servicos/${created.servico.id}`,
      ).expect(409);
      assert.ok(await context.models.Servico.findByPk(created.servico.id));
    });
  });
};
