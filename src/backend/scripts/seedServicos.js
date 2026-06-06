const { Op } = require("sequelize");
const {
  sequelize,
  Cliente,
  Veiculo,
  Produto,
  Servico,
  ItemServico,
} = require("../models");

const clientesSeed = [
  "Mariana Costa",
  "Rafael Almeida",
  "Beatriz Moreira",
  "Gustavo Lima",
  "Camila Nogueira",
  "Thiago Ferreira",
  "Patrícia Azevedo",
  "Eduardo Martins",
  "Juliana Ribeiro",
  "Lucas Carvalho",
  "Fernanda Lopes",
  "Bruno Santana",
  "Renata Farias",
  "Diego Barbosa",
  "Amanda Teixeira",
  "Rodrigo Castro",
  "Tatiane Monteiro",
  "Felipe Duarte",
  "Letícia Gomes",
  "Marcelo Rocha",
  "Larissa Mendes",
  "André Cardoso",
  "Vanessa Freitas",
  "Henrique Moura",
  "Priscila Correia",
  "Vinícius Pereira",
  "Carolina Batista",
  "Leandro Campos",
  "Natália Oliveira",
  "Sérgio Pinheiro",
  "Clínica Vida Norte",
  "Mercado Sol Nascente",
  "Transportes Vale Azul",
  "Padaria Santa Rita",
  "Construtora Horizonte",
  "Tech Farma Distribuidora",
];

const cidades = [
  ["Belo Horizonte", "MG"],
  ["Contagem", "MG"],
  ["Betim", "MG"],
  ["Nova Lima", "MG"],
  ["Sabará", "MG"],
  ["Ribeirão das Neves", "MG"],
  ["Santa Luzia", "MG"],
  ["Sete Lagoas", "MG"],
];

const modelosVeiculos = [
  ["Chevrolet Onix", "Hatch", "1.0 Turbo", "Flex"],
  ["Hyundai HB20", "Hatch", "1.0", "Flex"],
  ["Volkswagen Polo", "Hatch", "1.0 TSI", "Flex"],
  ["Fiat Argo", "Hatch", "1.3", "Flex"],
  ["Toyota Corolla", "Sedan", "2.0", "Flex"],
  ["Honda Civic", "Sedan", "2.0", "Flex"],
  ["Jeep Renegade", "SUV", "1.3 Turbo", "Flex"],
  ["Nissan Kicks", "SUV", "1.6", "Flex"],
  ["Ford Ka", "Hatch", "1.5", "Flex"],
  ["Renault Duster", "SUV", "1.6", "Flex"],
  ["Fiat Strada", "Picape", "1.4", "Flex"],
  ["Toyota Hilux", "Picape", "2.8", "Diesel"],
  ["Chevrolet S10", "Picape", "2.8", "Diesel"],
  ["Volkswagen Saveiro", "Picape", "1.6", "Flex"],
  ["Honda Fit", "Monovolume", "1.5", "Flex"],
  ["Citroën C4 Cactus", "SUV", "1.6", "Flex"],
  ["Peugeot 208", "Hatch", "1.6", "Flex"],
  ["Caoa Chery Tiggo 5X", "SUV", "1.5 Turbo", "Flex"],
];

const cores = [
  "Prata",
  "Branco",
  "Preto",
  "Cinza",
  "Azul",
  "Vermelho",
  "Marrom",
  "Grafite",
];

const produtosSeed = [
  ["Óleo sintético 5W30", 96, 42.9],
  ["Óleo semissintético 10W40", 82, 34.5],
  ["Filtro de óleo", 118, 28.9],
  ["Filtro de ar do motor", 74, 46.8],
  ["Filtro de combustível", 55, 39.9],
  ["Filtro de cabine", 62, 52.5],
  ["Pastilha de freio dianteira", 38, 159.9],
  ["Pastilha de freio traseira", 24, 139.9],
  ["Disco de freio ventilado", 18, 249.9],
  ["Fluido de freio DOT 4", 44, 31.9],
  ["Vela de ignição", 112, 36.5],
  ["Cabo de vela", 29, 118.9],
  ["Bateria 60Ah", 11, 469.9],
  ["Bateria 70Ah", 7, 589.9],
  ["Correia dentada", 17, 128.9],
  ["Correia do alternador", 21, 92.9],
  ["Tensor da correia", 13, 189.9],
  ["Amortecedor dianteiro", 14, 329.9],
  ["Amortecedor traseiro", 12, 289.9],
  ["Pneu 175/65 R14", 20, 349.9],
  ["Pneu 195/55 R15", 16, 429.9],
  ["Palheta limpador dianteiro", 49, 64.9],
  ["Lâmpada H7", 36, 48.9],
  ["Aditivo para radiador", 58, 29.9],
  ["Sensor de oxigênio", 9, 219.9],
  ["Bobina de ignição", 10, 279.9],
  ["Kit embreagem", 6, 899.9],
  ["Bomba d'água", 8, 249.9],
  ["Óleo de câmbio automático", 28, 68.9],
  ["Higienizador de ar-condicionado", 31, 39.9],
  ["Rolamento de roda", 15, 179.9],
  ["Bieleta da suspensão", 25, 89.9],
];

const servicosSeed = [
  {
    descricao: "Revisão preventiva completa com troca de óleo, filtros e checklist eletrônico.",
    produtos: ["Óleo sintético 5W30", "Filtro de óleo", "Filtro de ar do motor", "Filtro de cabine"],
    maoObra: 220,
  },
  {
    descricao: "Substituição de pastilhas, inspeção dos discos e sangria do sistema de freio.",
    produtos: ["Pastilha de freio dianteira", "Fluido de freio DOT 4"],
    maoObra: 190,
  },
  {
    descricao: "Correção de falha de ignição com troca de velas e análise de bobinas.",
    produtos: ["Vela de ignição", "Cabo de vela"],
    maoObra: 170,
  },
  {
    descricao: "Diagnóstico de partida, teste do alternador e substituição da bateria.",
    produtos: ["Bateria 60Ah"],
    maoObra: 120,
  },
  {
    descricao: "Troca do kit de correia dentada, tensor e revisão do arrefecimento.",
    produtos: ["Correia dentada", "Tensor da correia", "Aditivo para radiador"],
    maoObra: 420,
  },
  {
    descricao: "Reparo de suspensão dianteira com troca de amortecedores e bieletas.",
    produtos: ["Amortecedor dianteiro", "Bieleta da suspensão"],
    maoObra: 360,
  },
  {
    descricao: "Serviço de pneus com troca de par, balanceamento e alinhamento.",
    produtos: ["Pneu 175/65 R14"],
    maoObra: 180,
  },
  {
    descricao: "Manutenção do sistema de ar-condicionado e troca do filtro de cabine.",
    produtos: ["Filtro de cabine", "Higienizador de ar-condicionado"],
    maoObra: 160,
  },
  {
    descricao: "Diagnóstico de injeção eletrônica e substituição do sensor de oxigênio.",
    produtos: ["Sensor de oxigênio"],
    maoObra: 250,
  },
  {
    descricao: "Troca de embreagem com inspeção de vazamentos e teste de rodagem.",
    produtos: ["Kit embreagem"],
    maoObra: 680,
  },
  {
    descricao: "Revisão do sistema de arrefecimento com troca da bomba d'água.",
    produtos: ["Bomba d'água", "Aditivo para radiador"],
    maoObra: 340,
  },
  {
    descricao: "Manutenção de câmbio automático com troca parcial do fluido.",
    produtos: ["Óleo de câmbio automático"],
    maoObra: 390,
  },
];

const statusDistribuicaoMensal = [
  "Concluída",
  "Aberta",
  "Em Andamento",
  "Aguardando Peças",
  "Concluída",
  "Aberta",
  "Em Andamento",
  "Concluída",
  "Aberta",
  "Aguardando Peças",
  "Em Andamento",
  "Concluída",
  "Aberta",
  "Em Andamento",
  "Concluída",
  "Aguardando Peças",
  "Aberta",
  "Em Andamento",
  "Cancelada",
];

function toMoney(value) {
  return Number(value.toFixed(2));
}

function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function makeDate(monthOffset, preferredDay) {
  const now = new Date();
  const currentDay = now.getUTCDate();
  const safeDay =
    monthOffset === 0
      ? Math.max(1, Math.min(currentDay, preferredDay))
      : preferredDay;

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthOffset, safeDay),
  );
}

function placa(index) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `RLT${index % 10}${letters[index % letters.length]}${String(index).padStart(2, "0")}`;
}


function buildEndereco(index) {
  const [cidade, uf] = cidades[index % cidades.length];

  return {
    logradouro: `Rua das Oficinas ${index + 1}`,
    numero: String(100 + index * 7),
    complemento: index % 4 === 0 ? `Sala ${index + 1}` : "",
    bairro: ["Centro", "Funcionários", "Santa Amélia", "Savassi", "Industrial"][index % 5],
    cidade,
    uf,
    pais: "Brasil",
    cep: `${String(30100000 + index * 137).padStart(8, "0")}`,
  };
}

function buildClientes() {
  return clientesSeed.map((nomeCompleto, index) => {
    const pessoaJuridica = index >= 30;

    return {
      nomeCompleto,
      genero: pessoaJuridica ? "Outro" : index % 2 === 0 ? "F" : "M",
      dataNascimento: pessoaJuridica
        ? `${1988 + (index % 12)}-03-15`
        : `${1978 + (index % 24)}-${String((index % 12) + 1).padStart(2, "0")}-12`,
      tipo: pessoaJuridica ? "Jurídica" : "Física",
      endereco: buildEndereco(index),
      telefone: `3198${String(500000 + index * 739).slice(0, 6)}`,
      email: `seed.relatorios.${String(index + 1).padStart(2, "0")}@autopro.local`,
      isFornecedor: false,
      observacao: "Cliente criado pela seed de relatórios.",
    };
  });
}

function buildVeiculos(clientes) {
  return Array.from({ length: 54 }, (_, index) => {
    const [modelo, tipoVeiculo, motorizacao, tipoCombustivel] =
      modelosVeiculos[index % modelosVeiculos.length];

    return {
      placa: placa(index),
      modelo,
      ano: 2014 + (index % 11),
      cor: cores[index % cores.length],
      quilometragem: 18000 + index * 3150,
      tipoVeiculo,
      motorizacao,
      numeroChasse: `9BRSEED${String(index + 1).padStart(9, "0")}`,
      tipoCombustivel,
      dataUltimaRevisao: dateOnly(makeDate(-1 - (index % 5), 10 + (index % 12))),
      idCliente: clientes[index % clientes.length].id,
    };
  });
}

function getQuantidadeProduto(produtoNome, serviceIndex) {
  if (produtoNome.includes("Óleo sintético") || produtoNome.includes("Óleo semissintético")) {
    return 4;
  }

  if (produtoNome.includes("Óleo de câmbio")) {
    return 5;
  }

  if (produtoNome.includes("Vela")) {
    return 4;
  }

  if (produtoNome.includes("Pneu")) {
    return serviceIndex % 3 === 0 ? 4 : 2;
  }

  if (produtoNome.includes("Amortecedor") || produtoNome.includes("Bieleta")) {
    return 2;
  }

  return 1;
}

async function upsertProdutos(transaction) {
  const produtos = new Map();

  for (const [nome, quantidade, precoUnitario] of produtosSeed) {
    const [produto] = await Produto.findOrCreate({
      where: { nome },
      defaults: { nome, quantidade, precoUnitario },
      transaction,
    });

    await produto.update({ quantidade, precoUnitario }, { transaction });
    produtos.set(nome, produto);
  }

  return produtos;
}

async function upsertClientes(transaction) {
  const clientes = [];

  for (const clienteSeed of buildClientes()) {
    const [cliente] = await Cliente.findOrCreate({
      where: { email: clienteSeed.email },
      defaults: clienteSeed,
      transaction,
    });

    await cliente.update(clienteSeed, { transaction });
    clientes.push(cliente);
  }

  return clientes;
}

async function upsertVeiculos(clientes, transaction) {
  const veiculos = [];

  for (const veiculoSeed of buildVeiculos(clientes)) {
    const [veiculo] = await Veiculo.findOrCreate({
      where: { placa: veiculoSeed.placa },
      defaults: veiculoSeed,
      transaction,
    });

    await veiculo.update(veiculoSeed, { transaction });
    veiculos.push(veiculo);
  }

  return veiculos;
}

async function removerServicosSeed(veiculos, transaction) {
  const veiculoIds = veiculos.map((veiculo) => veiculo.id);
  const servicos = await Servico.findAll({
    attributes: ["id"],
    where: {
      idVeiculo: {
        [Op.in]: veiculoIds,
      },
    },
    transaction,
  });
  const servicoIds = servicos.map((servico) => servico.id);

  if (servicoIds.length === 0) {
    return;
  }

  await ItemServico.destroy({
    where: {
      idServico: {
        [Op.in]: servicoIds,
      },
    },
    transaction,
  });

  await Servico.destroy({
    where: {
      id: {
        [Op.in]: servicoIds,
      },
    },
    transaction,
  });
}

async function criarServico({
  veiculo,
  template,
  produtoMap,
  status,
  dataReferencia,
  serviceIndex,
  transaction,
}) {
  const itens = template.produtos.map((produtoNome) => {
    const produto = produtoMap.get(produtoNome);
    const quantidade = getQuantidadeProduto(produtoNome, serviceIndex);
    const subtotal = quantidade * Number(produto.precoUnitario);

    return {
      produto,
      quantidade,
      subtotal,
    };
  });
  const pecasTotal = itens.reduce((total, item) => total + item.subtotal, 0);
  const valorTotal = toMoney(template.maoObra + pecasTotal);
  const dataFim = ["Concluída", "Cancelada"].includes(status) ? dateOnly(dataReferencia) : null;
  const dataInicio = dateOnly(addDays(dataReferencia, -2 - (serviceIndex % 5)));

  const servico = await Servico.create(
    {
      descricao: template.descricao,
      status,
      dataInicio: dataInicio,
      dataFim: dataFim,
      valorTotal,
      idVeiculo: veiculo.id,
    },
    { transaction },
  );

  await ItemServico.bulkCreate(
    itens.map((item) => ({
      idServico: servico.id,
      idProduto: item.produto.id,
      quantidadeUtilizada: item.quantidade,
    })),
    { transaction },
  );

  return servico;
}

async function criarServicos(veiculos, produtoMap, transaction) {
  let totalServicos = 0;

  for (let monthOffset = -11; monthOffset <= 0; monthOffset += 1) {
    for (let atendimentoIndex = 0; atendimentoIndex < statusDistribuicaoMensal.length; atendimentoIndex += 1) {
      const status = statusDistribuicaoMensal[atendimentoIndex];
      const serviceIndex = totalServicos;
      const templateIndex = (monthOffset + 11 + atendimentoIndex) % servicosSeed.length;
      const dataReferencia = makeDate(monthOffset, 3 + atendimentoIndex);

      await criarServico({
        veiculo: veiculos[serviceIndex % veiculos.length],
        template: servicosSeed[templateIndex],
        produtoMap,
        status,
        dataReferencia,
        serviceIndex,
        transaction,
      });

      totalServicos += 1;
    }
  }

  return totalServicos;
}

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  let resumo;

  await sequelize.transaction(async (transaction) => {
    const produtos = await upsertProdutos(transaction);
    const clientes = await upsertClientes(transaction);
    const veiculos = await upsertVeiculos(clientes, transaction);

    await removerServicosSeed(veiculos, transaction);

    const servicos = await criarServicos(veiculos, produtos, transaction);

    resumo = {
      clientes: clientes.length,
      veiculos: veiculos.length,
      produtos: produtos.size,
      servicos,
    };
  });

  console.log("Seed de serviços concluída:");
  console.log(`- ${resumo.clientes} clientes`);
  console.log(`- ${resumo.veiculos} veículos`);
  console.log(`- ${resumo.produtos} produtos`);
  console.log(`- ${resumo.servicos} serviços/OS`);
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed de serviços:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
