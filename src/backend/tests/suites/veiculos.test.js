const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const {
  createCliente,
  createServico,
  createVeiculo,
  veiculoPayload,
} = require("../helpers/factories");
const { apiRequest } = require("../helpers/http");

module.exports = function registerVeiculosTests(context) {
  describe("veiculos", () => {
    test("GET /veiculos lista registros com cliente associado", async () => {
      const created = await createVeiculo(context.models);

      const response = await apiRequest(context, "get", "/veiculos").expect(200);

      assert.ok(Array.isArray(response.body));
      assert.equal(response.body[0].id, created.veiculo.id);
      assert.equal(response.body[0].cliente.id, created.cliente.id);
    });

    test("GET /veiculos/:id retorna recurso e trata erros de identificacao", async () => {
      const created = await createVeiculo(context.models);

      const response = await apiRequest(
        context,
        "get",
        `/veiculos/${created.veiculo.id}`,
      ).expect(200);

      assert.equal(response.body.placa, created.veiculo.placa);
      assert.equal(response.body.cliente.id, created.cliente.id);

      await apiRequest(context, "get", "/veiculos/abc").expect(400);
      await apiRequest(context, "get", "/veiculos/999999").expect(404);
    });

    test("POST /veiculos cria registro vinculado a cliente existente", async () => {
      const cliente = await createCliente(context.models);
      const payload = veiculoPayload(cliente.id, {
        placa: "API1A23",
      });

      const response = await apiRequest(context, "post", "/veiculos")
        .send(payload)
        .expect(201);

      assert.equal(response.body.placa, payload.placa);
      assert.equal(response.body.idCliente, cliente.id);

      const persisted = await context.models.Veiculo.findByPk(response.body.id);
      assert.equal(persisted.modelo, payload.modelo);
      assert.equal(persisted.ano, payload.ano);
    });

    test("POST /veiculos valida obrigatorios, numeros e cliente", async () => {
      await apiRequest(context, "post", "/veiculos").send({}).expect(400);

      const cliente = await createCliente(context.models);
      await apiRequest(context, "post", "/veiculos")
        .send(veiculoPayload(cliente.id, { ano: "invalido" }))
        .expect(400);
      await apiRequest(context, "post", "/veiculos")
        .send(veiculoPayload(0))
        .expect(400);
      await apiRequest(context, "post", "/veiculos")
        .send(veiculoPayload(999999))
        .expect(404);
    });

    test("POST /veiculos rejeita placa duplicada", async () => {
      const created = await createVeiculo(context.models);

      await apiRequest(context, "post", "/veiculos")
        .send(
          veiculoPayload(created.cliente.id, {
            placa: created.veiculo.placa,
          }),
        )
        .expect(409);

      assert.equal(
        await context.models.Veiculo.count({
          where: { placa: created.veiculo.placa },
        }),
        1,
      );
    });

    test("PUT /veiculos/:id atualiza campos e troca o cliente", async () => {
      const created = await createVeiculo(context.models);
      const novoCliente = await createCliente(context.models);

      const response = await apiRequest(
        context,
        "put",
        `/veiculos/${created.veiculo.id}`,
      )
        .send({
          modelo: "Modelo Atualizado",
          ano: 2025,
          idCliente: novoCliente.id,
        })
        .expect(200);

      assert.equal(response.body.modelo, "Modelo Atualizado");
      assert.equal(response.body.ano, 2025);
      assert.equal(response.body.idCliente, novoCliente.id);

      await created.veiculo.reload();
      assert.equal(created.veiculo.idCliente, novoCliente.id);
    });

    test("PUT /veiculos/:id valida ID, recurso e referencias", async () => {
      await apiRequest(context, "put", "/veiculos/abc")
        .send({ modelo: "Teste" })
        .expect(400);
      await apiRequest(context, "put", "/veiculos/999999")
        .send({ modelo: "Teste" })
        .expect(404);

      const created = await createVeiculo(context.models);
      await apiRequest(context, "put", `/veiculos/${created.veiculo.id}`)
        .send({ ano: 0 })
        .expect(400);
      await apiRequest(context, "put", `/veiculos/${created.veiculo.id}`)
        .send({ idCliente: 0 })
        .expect(400);
      await apiRequest(context, "put", `/veiculos/${created.veiculo.id}`)
        .send({ idCliente: 999999 })
        .expect(404);
    });

    test("PUT /veiculos/:id rejeita placa duplicada e preserva registro", async () => {
      const primeiro = await createVeiculo(context.models);
      const segundo = await createVeiculo(context.models);

      await apiRequest(context, "put", `/veiculos/${segundo.veiculo.id}`)
        .send({ placa: primeiro.veiculo.placa })
        .expect(409);

      await segundo.veiculo.reload();
      assert.notEqual(segundo.veiculo.placa, primeiro.veiculo.placa);
    });

    test("DELETE /veiculos/:id remove veiculo sem servicos", async () => {
      const created = await createVeiculo(context.models);

      await apiRequest(
        context,
        "delete",
        `/veiculos/${created.veiculo.id}`,
      ).expect(200);

      assert.equal(
        await context.models.Veiculo.findByPk(created.veiculo.id),
        null,
      );
    });

    test("DELETE /veiculos/:id trata ID, inexistencia e vinculos", async () => {
      await apiRequest(context, "delete", "/veiculos/abc").expect(400);
      await apiRequest(context, "delete", "/veiculos/999999").expect(404);

      const created = await createVeiculo(context.models);
      await createServico(context.models, {
        idVeiculo: created.veiculo.id,
      });

      await apiRequest(
        context,
        "delete",
        `/veiculos/${created.veiculo.id}`,
      ).expect(409);
      assert.ok(await context.models.Veiculo.findByPk(created.veiculo.id));
    });
  });
};
