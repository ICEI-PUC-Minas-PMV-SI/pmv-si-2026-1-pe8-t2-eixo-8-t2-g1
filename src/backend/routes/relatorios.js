const express = require("express");
const { Cliente, Produto, Servico, Veiculo } = require("../models");

const router = express.Router();

const STATUS_ORDER = [
  "Aberta",
  "Em Andamento",
  "Aguardando Peças",
  "Concluída",
  "Cancelada",
];

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toMoney(value) {
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

function buildMonthBuckets(totalMonths = 12) {
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

function getEstoqueMinimo(produtoNome) {
  const nome = normalizeText(produtoNome);

  if (nome.includes("oleo") || nome.includes("filtro")) {
    return 40;
  }

  if (nome.includes("pastilha") || nome.includes("vela")) {
    return 30;
  }

  if (nome.includes("pneu")) {
    return 16;
  }

  if (nome.includes("bateria")) {
    return 8;
  }

  if (nome.includes("correia") || nome.includes("amortecedor")) {
    return 12;
  }

  return 20;
}

router.get("/", async (req, res) => {
  try {
    const [clientes, servicos, produtos] = await Promise.all([
      Cliente.findAll({
        attributes: ["id", "nomeCompleto", "data_criacao"],
      }),
      Servico.findAll({
        include: [
          {
            model: Veiculo,
            as: "veiculo",
            attributes: ["id", "id_cliente"],
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
        order: [
          ["quantidade", "ASC"],
          ["nome", "ASC"],
        ],
      }),
    ]);

    const osStatus = new Map(
      STATUS_ORDER.map((status) => [
        status,
        {
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

    let osConcluidas = 0;
    let valorConcluidas = 0;

    for (const servico of servicos) {
      const status = canonicalizeStatus(servico.status);
      const valor = toNumber(servico.valor_total);
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

      const monthKey = getMonthKey(servico.data_fim || servico.data_inicio);
      const monthBucket = monthKey ? faturamentoPorMes.get(monthKey) : null;

      if (monthBucket) {
        monthBucket.valor += valor;
      }
    }

    const currentMonthKey = getMonthKey(new Date().toISOString().slice(0, 10));
    const clientesEsteMes = clientes.filter(
      (cliente) => getMonthKey(cliente.data_criacao) === currentMonthKey,
    ).length;
    const mesAtual = faturamentoPorMes.get(currentMonthKey) || faturamentoMensal.at(-1);

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
      produtosEstoque: produtos.slice(0, 12).map((produto) => ({
        produto: produto.nome,
        estoque: toNumber(produto.quantidade),
        minimo: getEstoqueMinimo(produto.nome),
        precoUnitario: toNumber(produto.preco_unitario),
      })),
      faturamento: faturamentoMensal.map(({ key, ...item }) => ({
        ...item,
        valor: toMoney(item.valor),
      })),
      resumo: {
        totalClientes: clientes.length,
        clientesEsteMes,
        osConcluidas,
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
