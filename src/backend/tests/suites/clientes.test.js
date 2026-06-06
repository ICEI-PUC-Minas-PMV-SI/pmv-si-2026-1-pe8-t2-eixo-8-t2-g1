const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const {
  clientePayload,
  createCliente,
  createVeiculo,
} = require("../helpers/factories");
const { apiRequest } = require("../helpers/http");

module.exports = function registerClientesTests(context) {
  describe("clientes", () => {
    test("GET /clientes lista registros no formato esperado", async () => {
      const cliente = await createCliente(context.models);

      const response = await apiRequest(context, "get", "/clientes").expect(200);

      assert.ok(Array.isArray(response.body));
      assert.equal(response.body.length, 1);
      assert.equal(response.body[0].id, cliente.id);
      assert.equal(typeof response.body[0].endereco, "object");
      assert.equal(typeof response.body[0].isFornecedor, "boolean");
    });

    test("GET /clientes/:id retorna recurso e trata ID invalido ou inexistente", async () => {
      const cliente = await createCliente(context.models);

      const response = await apiRequest(
        context,
        "get",
        `/clientes/${cliente.id}`,
      ).expect(200);

      assert.equal(response.body.id, cliente.id);
      assert.equal(response.body.email, cliente.email);

      await apiRequest(context, "get", "/clientes/0").expect(400);
      await apiRequest(context, "get", "/clientes/999999").expect(404);
    });

    test("POST /clientes cria e persiste um cliente completo", async () => {
      const payload = clientePayload({
        nomeCompleto: "Cliente da API",
        email: "cliente.api@example.com",
        tipo: "Fisica",
      });

      const response = await apiRequest(context, "post", "/clientes")
        .send(payload)
        .expect(201);

      assert.equal(response.body.nomeCompleto, payload.nomeCompleto);
      assert.equal(response.body.email, payload.email);
      assert.deepEqual(response.body.endereco, payload.endereco);

      const persisted = await context.models.Cliente.findByPk(response.body.id);
      assert.equal(persisted.telefone, payload.telefone);
      assert.equal(persisted.isFornecedor, false);
    });

    test("POST /clientes rejeita obrigatorios ausentes e payloads invalidos", async () => {
      await apiRequest(context, "post", "/clientes").send({}).expect(400);

      const base = clientePayload();
      const invalidPayloads = [
        { ...base, email: "email-invalido" },
        { ...base, genero: "X" },
        { ...base, tipo: "Desconhecido" },
        { ...base, endereco: { cidade: "Sao Paulo" } },
        { ...base, isFornecedor: "sim" },
      ];

      for (const payload of invalidPayloads) {
        await apiRequest(context, "post", "/clientes")
          .send(payload)
          .expect(400);
      }
    });

    test("POST /clientes rejeita email duplicado sem alterar o banco", async () => {
      const cliente = await createCliente(context.models);
      const beforeCount = await context.models.Cliente.count();

      await apiRequest(context, "post", "/clientes")
        .send(
          clientePayload({
            email: cliente.email,
          }),
        )
        .expect(409);

      assert.equal(await context.models.Cliente.count(), beforeCount);
    });

    test("PUT /clientes/:id atualiza parcialmente e valida o payload", async () => {
      const cliente = await createCliente(context.models);

      const response = await apiRequest(
        context,
        "put",
        `/clientes/${cliente.id}`,
      )
        .send({
          nomeCompleto: "Nome Atualizado",
          isFornecedor: true,
          observacao: "Atualizada",
        })
        .expect(200);

      assert.equal(response.body.nomeCompleto, "Nome Atualizado");
      assert.equal(response.body.isFornecedor, true);
      assert.equal(response.body.email, cliente.email);

      await cliente.reload();
      assert.equal(cliente.observacao, "Atualizada");

      await apiRequest(context, "put", `/clientes/${cliente.id}`)
        .send({ email: "invalido" })
        .expect(400);
    });

    test("PUT /clientes/:id trata ID invalido, inexistente e duplicidade", async () => {
      await apiRequest(context, "put", "/clientes/abc")
        .send({ nomeCompleto: "Teste" })
        .expect(400);
      await apiRequest(context, "put", "/clientes/999999")
        .send({ nomeCompleto: "Teste" })
        .expect(404);

      const primeiro = await createCliente(context.models);
      const segundo = await createCliente(context.models);

      await apiRequest(context, "put", `/clientes/${segundo.id}`)
        .send({ email: primeiro.email })
        .expect(409);

      await segundo.reload();
      assert.notEqual(segundo.email, primeiro.email);
    });

    test("DELETE /clientes/:id remove cliente sem vinculos", async () => {
      const cliente = await createCliente(context.models);

      await apiRequest(context, "delete", `/clientes/${cliente.id}`).expect(200);

      assert.equal(await context.models.Cliente.findByPk(cliente.id), null);
    });

    test("DELETE /clientes/:id trata ID, inexistencia e integridade referencial", async () => {
      await apiRequest(context, "delete", "/clientes/abc").expect(400);
      await apiRequest(context, "delete", "/clientes/999999").expect(404);

      const cliente = await createCliente(context.models);
      await createVeiculo(context.models, { idCliente: cliente.id });

      await apiRequest(context, "delete", `/clientes/${cliente.id}`).expect(409);
      assert.ok(await context.models.Cliente.findByPk(cliente.id));
    });
  });
};
