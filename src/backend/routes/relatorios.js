const express = require("express");
const { Cliente, Produto, Servico, Veiculo, ItemServico } = require("../models");

const router = express.Router();
const DAILY_OUTPUT_PERIOD_DAYS = 30;

const STATUS_ORDER = [
  "Aberta",
  "Em Andamento",
  "Aguardando Peças",
  "Concluída",
  "Cancelada",
];

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  timeZone: "UTC",
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toMoney(value) {
  return Number(toNumber(value).toFixed(2));
}

function toQuantity(value) {
  return Number(toNumber(value).toFixed(2));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function canonicalizeStatus(status) {
  const normalized = normalizeText(status);

  if (normalized.includes("cancel")) {
    return "Cancelada";
  }

  if (normalized.startsWith("conclu")) {
    return "Concluída";
  }

  if (normalized.includes("aguardando")) {
    return "Aguardando Peças";
  }

  if (normalized.includes("andamento")) {
    return "Em Andamento";
  }

  if (normalized.includes("aberta")) {
    return "Aberta";
  }

  return status || "Sem status";
}

function isConcluido(status) {
  return normalizeText(status).startsWith("conclu");
}

function isCancelada(status) {
  return normalizeText(status).includes("cancel");
}

function parseDateOnly(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return new Date(
      Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
    );
  }

  const datePart = String(value).split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

function getMonthKey(value) {
  const date = parseDateOnly(value);

  if (!date) {
    return null;
  }

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function buildMonthBuckets(totalMonths = 6) {
  const now = new Date();
  const firstMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - totalMonths + 1, 1),
  );

  return Array.from({ length: totalMonths }, (_, index) => {
    const date = new Date(
      Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + index, 1),
    );
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

    return {
      key,
      mes: monthFormatter.format(date),
      valor: 0,
    };
  });
}

function formatDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function buildDailyOutputPeriod(totalDays = DAILY_OUTPUT_PERIOD_DAYS) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - totalDays + 1);

  return {
    dias: totalDays,
    fim: formatDateOnly(end),
    inicio: formatDateOnly(start),
    start,
    end,
  };
}

function isWithinPeriod(value, period) {
  const date = parseDateOnly(value);
  return Boolean(date && date >= period.start && date <= period.end);
}

function getStockStatus(estoqueAtual, estoqueMinimo) {
  if (estoqueMinimo === null) {
    return "Sem mínimo definido";
  }

  if (estoqueAtual <= estoqueMinimo) {
    return "Crítico";
  }

  if (estoqueAtual <= Math.ceil(estoqueMinimo * 1.2)) {
    return "Atenção";
  }

  return "Ok";
}

router.get("/", async (req, res) => {
  try {
    const [clientes, servicos, produtos, veiculos, itensServico] = await Promise.all([
      Cliente.findAll({
        attributes: ["id", "nomeCompleto", "dataCriacao"],
      }),
      Servico.findAll({
        include: [
          {
            model: Veiculo,
            as: "veiculo",
            attributes: ["id", "idCliente"],
            include: [
              {
                model: Cliente,
                as: "cliente",
                attributes: ["id", "nomeCompleto"],
              },
            ],
          },
        ],
      }),
      Produto.findAll({
        order: [["titulo", "ASC"]],
      }),
      Veiculo.findAll({
        attributes: ["id", "idCliente"],
      }),
      ItemServico.findAll({
        attributes: ["idProduto", "quantidadeUtilizada"],
        include: [
          {
            model: Servico,
            as: "servico",
            attributes: ["status", "dataInicio", "dataFim"],
          },
        ],
      })
    ]);

    const osStatus = new Map(
      STATUS_ORDER.map((status, index) => [
        status,
        {
          id: index + 1,
          status,
          quantidade: 0,
          valor: 0,
        },
      ]),
    );
    const topClientes = new Map();
    const faturamentoMensal = buildMonthBuckets();
    const faturamentoPorMes = new Map(
      faturamentoMensal.map((item) => [item.key, item]),
    );
    const produtosPorId = new Map(
      produtos.map((produto) => [produto.id, produto]),
    );
    const saidaTotalPorProduto = new Map();
    const saidaPeriodoPorProduto = new Map();
    const periodoSaida = buildDailyOutputPeriod();

    for (const item of itensServico) {
      const quantidade = toNumber(item.quantidadeUtilizada);

      saidaTotalPorProduto.set(
        item.idProduto,
        toNumber(saidaTotalPorProduto.get(item.idProduto)) + quantidade,
      );

      const servico = item.servico;
      const dataMovimentacao = servico?.dataFim || servico?.dataInicio;

      if (
        servico &&
        !isCancelada(servico.status) &&
        isWithinPeriod(dataMovimentacao, periodoSaida)
      ) {
        saidaPeriodoPorProduto.set(
          item.idProduto,
          toNumber(saidaPeriodoPorProduto.get(item.idProduto)) + quantidade,
        );
      }
    }

    let osConcluidas = 0;
    let valorConcluidas = 0;

    for (const servico of servicos) {
      const status = canonicalizeStatus(servico.status);
      const valor = toNumber(servico.valorTotal);
      const statusBucket = osStatus.get(status) || {
        status,
        quantidade: 0,
        valor: 0,
      };

      statusBucket.quantidade += 1;
      statusBucket.valor += valor;
      osStatus.set(status, statusBucket);

      if (!isConcluido(servico.status)) {
        continue;
      }

      osConcluidas += 1;
      valorConcluidas += valor;

      const cliente = servico.veiculo?.cliente;
      const clienteId = cliente?.id || "sem-cliente";
      const clienteNome = cliente?.nomeCompleto || "Cliente não informado";
      const clienteBucket = topClientes.get(clienteId) || {
        nome: clienteNome,
        totalGasto: 0,
      };

      clienteBucket.totalGasto += valor;
      topClientes.set(clienteId, clienteBucket);

      const monthKey = getMonthKey(servico.dataFim || servico.dataInicio);
      const monthBucket = monthKey ? faturamentoPorMes.get(monthKey) : null;

      if (monthBucket) {
        monthBucket.valor += valor;
      }
    }

    const currentMonthKey = getMonthKey(new Date().toISOString().slice(0, 10));
    const clientesEsteMes = clientes.filter(
      (cliente) => getMonthKey(cliente.dataCriacao) === currentMonthKey,
    ).length;
    const mesAtual = faturamentoPorMes.get(currentMonthKey) || faturamentoMensal.at(-1);
    const prioridadeEstoque = {
      "Crítico": 0,
      "Atenção": 1,
      "Sem mínimo definido": 2,
      Ok: 3,
    };
    const produtosEstoque = produtos
      .map((produto) => {
        const estoque = toNumber(produto.estoqueAtual);
        const minimo =
          produto.estoqueMinimo === null
            ? null
            : toNumber(produto.estoqueMinimo);

        return {
          produto: produto.titulo,
          estoque,
          minimo,
          preco: toNumber(produto.preco),
          status: getStockStatus(estoque, minimo),
        };
      })
      .sort(
        (a, b) =>
          prioridadeEstoque[a.status] - prioridadeEstoque[b.status] ||
          a.estoque - b.estoque ||
          a.produto.localeCompare(b.produto, "pt-BR"),
      )
      .slice(0, 12);
    const top5Produtos = Array.from(saidaTotalPorProduto.entries())
      .map(([idProduto, quantidadeUtilizada]) => ({
        produto: produtosPorId.get(idProduto)?.titulo || "Produto não informado",
        quantidadeUtilizada: toQuantity(quantidadeUtilizada),
      }))
      .sort((a, b) => b.quantidadeUtilizada - a.quantidadeUtilizada)
      .slice(0, 5);
    const saidaMediaDiaria = produtos
      .map((produto) => {
        const quantidadeTotal = toQuantity(
          saidaPeriodoPorProduto.get(produto.id),
        );

        return {
          idProduto: produto.id,
          produto: produto.titulo,
          quantidadeTotal,
          mediaDiaria: toQuantity(
            quantidadeTotal / DAILY_OUTPUT_PERIOD_DAYS,
          ),
          periodo: {
            inicio: periodoSaida.inicio,
            fim: periodoSaida.fim,
            dias: periodoSaida.dias,
          },
          estoqueAtual: toNumber(produto.estoqueAtual),
          diasDeEstoque: parseInt(toNumber(produto.estoqueAtual) / (toQuantity(quantidadeTotal / DAILY_OUTPUT_PERIOD_DAYS))),
          estoqueMinimo:
            produto.estoqueMinimo === null
              ? null
              : toNumber(produto.estoqueMinimo),
        };
      })
      .sort(
        (a, b) =>
          b.quantidadeTotal - a.quantidadeTotal ||
          a.produto.localeCompare(b.produto, "pt-BR"),
      )
      .slice(0, 12);

    return res.json({
      osStatus: Array.from(osStatus.values()).map((item) => ({
        ...item,
        valor: toMoney(item.valor),
      })),
      topClientes: Array.from(topClientes.values())
        .sort((a, b) => b.totalGasto - a.totalGasto)
        .slice(0, 5)
        .map((item) => ({
          ...item,
          totalGasto: toMoney(item.totalGasto),
        })),
      produtosEstoque,
      saidaMediaDiaria,
      faturamento: faturamentoMensal.map(({ key, ...item }) => ({
        ...item,
        valor: toMoney(item.valor),
      })),
      top5Produtos,
      resumo: {
        totalClientes: clientes.length,
        totalVeiculos: veiculos.length,
        clientesEsteMes,
        osConcluidas,
        osTotais: servicos.map((s) => s.status).filter((status) => !isCancelada(status)).length,
        produtosEmEstoque: produtos.length,
        valorConcluidas: toMoney(valorConcluidas),
        faturamentoMesAtual: toMoney(mesAtual?.valor || 0),
        mesAtual: mesAtual?.mes || "",
        ticketMedio: osConcluidas > 0 ? toMoney(valorConcluidas / osConcluidas) : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao gerar relatórios",
    });
  }
});

module.exports = router;
