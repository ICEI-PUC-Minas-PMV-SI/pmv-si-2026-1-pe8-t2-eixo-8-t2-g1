const assert = require("node:assert/strict");
const { describe, test } = require("node:test");
const {
  createCliente,
  createItemServico,
  createProduto,
  createServico,
  createVeiculo,
} = require("../helpers/factories");
const { apiRequest } = require("../helpers/http");

module.exports = function registerConsultasTests(context) {
  describe("fornecedores", () => {
    test("GET /fornecedores retorna apenas clientes fornecedores", async () => {
      const fornecedor = await createCliente(context.models, {
        isFornecedor: true,
      });
      await createCliente(context.models, {
        isFornecedor: false,
      });

      const response = await apiRequest(
        context,
        "get",
        "/fornecedores",
      ).expect(200);

      assert.equal(response.body.length, 1);
      assert.equal(response.body[0].id, fornecedor.id);
      assert.equal(response.body[0].isFornecedor, true);
    });

    test("GET /fornecedores retorna 500 no erro de persistencia", async () => {
      const originalFindAll = context.models.Cliente.findAll;
      context.models.Cliente.findAll = async () => {
        throw new Error("falha simulada");
      };

      try {
        const response = await apiRequest(
          context,
          "get",
          "/fornecedores",
        ).expect(500);
        assert.equal(typeof response.body.message, "string");
      } finally {
        context.models.Cliente.findAll = originalFindAll;
      }
    });
  });

  describe("relatorios", () => {
    test("GET /relatorios retorna estrutura completa sem dados operacionais", async () => {
      const response = await apiRequest(
        context,
        "get",
        "/relatorios",
      ).expect(200);

      assert.ok(Array.isArray(response.body.osStatus));
      assert.ok(Array.isArray(response.body.topClientes));
      assert.ok(Array.isArray(response.body.produtosEstoque));
      assert.ok(Array.isArray(response.body.faturamento));
      assert.ok(Array.isArray(response.body.top5Produtos));
      assert.equal(typeof response.body.resumo, "object");
      assert.equal(response.body.resumo.totalClientes, 0);
      assert.equal(response.body.resumo.totalVeiculos, 0);
      assert.equal(response.body.resumo.osTotais, 0);
      assert.equal(response.body.faturamento.length, 6);
    });

    test("GET /relatorios agrega status, faturamento, clientes e produtos", async () => {
      const today = new Date().toISOString().slice(0, 10);
      const clientePrincipal = await createCliente(context.models, {
        nomeCompleto: "Cliente Principal",
      });
      const clienteSecundario = await createCliente(context.models, {
        nomeCompleto: "Cliente Secundario",
      });
      const veiculoPrincipal = await createVeiculo(context.models, {
        idCliente: clientePrincipal.id,
      });
      const veiculoSecundario = await createVeiculo(context.models, {
        idCliente: clienteSecundario.id,
      });
      const concluido = await createServico(context.models, {
        idVeiculo: veiculoPrincipal.veiculo.id,
        status: "Concluida",
        dataInicio: today,
        dataFim: today,
        valorTotal: 100,
      });
      await createServico(context.models, {
        idVeiculo: veiculoSecundario.veiculo.id,
        status: "Aberta",
        dataInicio: today,
        valorTotal: 50,
      });
      await createServico(context.models, {
        idVeiculo: veiculoSecundario.veiculo.id,
        status: "Cancelada",
        dataInicio: today,
        valorTotal: 20,
      });
      const produto = await createProduto(context.models, {
        titulo: "Oleo de motor",
        estoqueAtual: 7,
        preco: 10,
      });
      await createProduto(context.models, {
        titulo: "Bateria",
        estoqueAtual: 3,
        preco: 300,
      });
      await createItemServico(context.models, {
        idServico: concluido.servico.id,
        idProduto: produto.id,
        quantidadeUtilizada: 3,
      });

      const response = await apiRequest(
        context,
        "get",
        "/relatorios",
      ).expect(200);

      assert.equal(response.body.resumo.totalClientes, 2);
      assert.equal(response.body.resumo.totalVeiculos, 2);
      assert.equal(response.body.resumo.osConcluidas, 1);
      assert.equal(response.body.resumo.osTotais, 2);
      assert.equal(response.body.resumo.valorConcluidas, 100);
      assert.equal(response.body.resumo.faturamentoMesAtual, 100);
      assert.equal(response.body.resumo.ticketMedio, 100);

      assert.equal(response.body.topClientes[0].nome, "Cliente Principal");
      assert.equal(response.body.topClientes[0].totalGasto, 100);
      assert.equal(response.body.top5Produtos[0].produto, "Oleo de motor");
      assert.equal(response.body.top5Produtos[0].quantidadeUtilizada, 3);

      const aberta = response.body.osStatus.find(
        (item) => item.status === "Aberta",
      );
      assert.equal(aberta.quantidade, 1);
      assert.equal(aberta.valor, 50);

      const oleo = response.body.produtosEstoque.find(
        (item) => item.produto === "Oleo de motor",
      );
      assert.equal(oleo.estoque, 7);
      assert.equal(oleo.minimo, 40);
    });

    test("GET /relatorios retorna 500 quando uma consulta falha", async () => {
      const originalFindAll = context.models.Servico.findAll;
      context.models.Servico.findAll = async () => {
        throw new Error("falha simulada");
      };

      try {
        const response = await apiRequest(
          context,
          "get",
          "/relatorios",
        ).expect(500);
        assert.equal(typeof response.body.message, "string");
      } finally {
        context.models.Servico.findAll = originalFindAll;
      }
    });
  });
};
