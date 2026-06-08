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

function dateDaysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

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
      assert.ok(Array.isArray(response.body.saidaMediaDiaria));
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
        estoqueMinimo: 8,
        preco: 10,
      });
      const produtoAtencao = await createProduto(context.models, {
        titulo: "Bateria",
        estoqueAtual: 3,
        estoqueMinimo: 2,
        preco: 300,
      });
      const produtoSemMinimo = await createProduto(context.models, {
        titulo: "Produto sem minimo",
        estoqueAtual: 20,
        estoqueMinimo: null,
      });
      await createItemServico(context.models, {
        idServico: concluido.servico.id,
        idProduto: produto.id,
        quantidadeUtilizada: 3,
      });
      const concluidoDezDiasAtras = await createServico(context.models, {
        idVeiculo: veiculoPrincipal.veiculo.id,
        status: "Concluida",
        dataInicio: dateDaysAgo(10),
        dataFim: dateDaysAgo(10),
        valorTotal: 0,
      });
      await createItemServico(context.models, {
        idServico: concluidoDezDiasAtras.servico.id,
        idProduto: produto.id,
        quantidadeUtilizada: 6,
      });
      const concluidoForaDoPeriodo = await createServico(context.models, {
        idVeiculo: veiculoPrincipal.veiculo.id,
        status: "Concluida",
        dataInicio: dateDaysAgo(31),
        dataFim: dateDaysAgo(31),
        valorTotal: 0,
      });
      await createItemServico(context.models, {
        idServico: concluidoForaDoPeriodo.servico.id,
        idProduto: produto.id,
        quantidadeUtilizada: 100,
      });

      const response = await apiRequest(
        context,
        "get",
        "/relatorios",
      ).expect(200);

      assert.equal(response.body.resumo.totalClientes, 2);
      assert.equal(response.body.resumo.totalVeiculos, 2);
      assert.equal(response.body.resumo.osConcluidas, 3);
      assert.equal(response.body.resumo.osTotais, 4);
      assert.equal(response.body.resumo.valorConcluidas, 100);
      assert.equal(response.body.resumo.faturamentoMesAtual, 100);
      assert.equal(response.body.resumo.ticketMedio, 33.33);

      assert.equal(response.body.topClientes[0].nome, "Cliente Principal");
      assert.equal(response.body.topClientes[0].totalGasto, 100);
      assert.equal(response.body.top5Produtos[0].produto, "Oleo de motor");
      assert.equal(response.body.top5Produtos[0].quantidadeUtilizada, 109);

      const aberta = response.body.osStatus.find(
        (item) => item.status === "Aberta",
      );
      assert.equal(aberta.quantidade, 1);
      assert.equal(aberta.valor, 50);

      const oleo = response.body.produtosEstoque.find(
        (item) => item.produto === "Oleo de motor",
      );
      assert.equal(oleo.estoque, 7);
      assert.equal(oleo.minimo, 8);
      assert.equal(oleo.status, "Crítico");

      const bateria = response.body.produtosEstoque.find(
        (item) => item.produto === "Bateria",
      );
      assert.equal(bateria.status, "Atenção");

      const semMinimo = response.body.produtosEstoque.find(
        (item) => item.produto === "Produto sem minimo",
      );
      assert.equal(semMinimo.minimo, null);
      assert.equal(semMinimo.status, "Sem mínimo definido");

      const saidaOleo = response.body.saidaMediaDiaria.find(
        (item) => item.idProduto === produto.id,
      );
      assert.equal(saidaOleo.quantidadeTotal, 9);
      assert.equal(saidaOleo.mediaDiaria, 0.3);
      assert.equal(saidaOleo.periodo.dias, 30);
      assert.equal(saidaOleo.estoqueAtual, 7);
      assert.equal(saidaOleo.estoqueMinimo, 8);

      const saidaZero = response.body.saidaMediaDiaria.find(
        (item) => item.idProduto === produtoSemMinimo.id,
      );
      assert.equal(saidaZero.quantidadeTotal, 0);
      assert.equal(saidaZero.mediaDiaria, 0);
      assert.equal(saidaZero.estoqueMinimo, null);
      assert.ok(response.body.saidaMediaDiaria.length <= 12);

      for (
        let index = 1;
        index < response.body.saidaMediaDiaria.length;
        index += 1
      ) {
        assert.ok(
          response.body.saidaMediaDiaria[index - 1].quantidadeTotal >=
            response.body.saidaMediaDiaria[index].quantidadeTotal,
        );
      }
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
