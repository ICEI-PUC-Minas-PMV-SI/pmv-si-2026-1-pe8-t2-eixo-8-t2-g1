const { hashPassword } = require("../../utils/auth");

let sequence = 0;

function nextValue(prefix) {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

function resetFactorySequence() {
  sequence = 0;
}

function clientePayload(overrides = {}) {
  const suffix = nextValue("cliente");

  return {
    nomeCompleto: `Cliente ${suffix}`,
    genero: "Outro",
    dataNascimento: "1990-01-15",
    tipo: "Fisica",
    endereco: {
      logradouro: "Rua de Teste",
      numero: "100",
      bairro: "Centro",
      cidade: "Sao Paulo",
      uf: "SP",
      pais: "Brasil",
      cep: "01000-000",
    },
    telefone: "11999999999",
    email: `${suffix}@example.com`,
    isFornecedor: false,
    observacao: "Criado pela suite de testes",
    ...overrides,
  };
}

function veiculoPayload(idCliente, overrides = {}) {
  return {
    placa: nextValue("TST").replaceAll("-", "").slice(-10).toUpperCase(),
    modelo: "Modelo de Teste",
    ano: 2024,
    cor: "Preto",
    quilometragem: 15000,
    tipoVeiculo: "Passeio",
    motorizacao: "2.0",
    numeroChasse: nextValue("CHASSI"),
    tipoCombustivel: "Flex",
    dataUltimaRevisao: "2026-01-10",
    idCliente,
    ...overrides,
  };
}

function produtoPayload(overrides = {}) {
  return {
    titulo: `Produto ${nextValue("estoque")}`,
    descricao: "Produto criado pela suite de testes",
    codigoSku: nextValue("SKU").toUpperCase(),
    tipoItem: "Produto",
    estoqueAtual: 20,
    preco: 25.5,
    ...overrides,
  };
}

function servicoPayload(idVeiculo, overrides = {}) {
  return {
    descricao: `Servico ${nextValue("ordem")}`,
    status: "Aberta",
    dataInicio: "2026-06-01",
    dataFim: null,
    valorTotal: 0,
    idVeiculo,
    ...overrides,
  };
}

async function createPerfil(models, overrides = {}) {
  return models.Perfil.create({
    nome: nextValue("Perfil"),
    ...overrides,
  });
}

async function createPermissao(models, overrides = {}) {
  return models.Permissao.create({
    chave: nextValue("recurso.acao"),
    descricao: "Permissao criada pela suite",
    ...overrides,
  });
}

async function createUsuario(models, overrides = {}) {
  const perfil =
    overrides.perfil ||
    (overrides.idPerfil ? null : await createPerfil(models));
  const password = overrides.password || "senha123";
  const values = {
    nome: nextValue("Usuario"),
    email: `${nextValue("usuario")}@example.com`,
    status: "Ativo",
    senhaHash: hashPassword(password),
    idPerfil: overrides.idPerfil || perfil.id,
    ...overrides,
  };

  delete values.password;
  delete values.perfil;

  const usuario = await models.Usuario.create(values);
  return {
    password,
    perfil,
    usuario,
  };
}

async function createCliente(models, overrides = {}) {
  const tipoFisica = models.Cliente.rawAttributes.tipo.values[0];
  const payload = clientePayload(overrides);

  return models.Cliente.create({
    ...payload,
    tipo: tipoFisica,
  });
}

async function createVeiculo(models, overrides = {}) {
  const cliente =
    overrides.cliente ||
    (overrides.idCliente ? null : await createCliente(models));
  const values = veiculoPayload(
    overrides.idCliente || cliente.id,
    overrides,
  );

  delete values.cliente;

  const veiculo = await models.Veiculo.create(values);
  return {
    cliente,
    veiculo,
  };
}

async function createProduto(models, overrides = {}) {
  return models.Produto.create(produtoPayload(overrides));
}

async function createProdutoReferences(models) {
  const [categoria, fornecedor, marca] = await Promise.all([
    models.Categoria.create({
      titulo: nextValue("Categoria"),
    }),
    createCliente(models, {
      isFornecedor: true,
    }),
    models.Marca.create({
      titulo: nextValue("Marca"),
    }),
  ]);

  return {
    categoria,
    fornecedor,
    marca,
  };
}

async function createServico(models, overrides = {}) {
  const veiculoData =
    overrides.veiculo ||
    (overrides.idVeiculo ? null : await createVeiculo(models));
  const values = servicoPayload(
    overrides.idVeiculo || veiculoData.veiculo.id,
    overrides,
  );

  delete values.veiculo;

  const servico = await models.Servico.create(values);
  return {
    cliente: veiculoData?.cliente,
    veiculo: veiculoData?.veiculo,
    servico,
  };
}

async function createItemServico(models, overrides = {}) {
  const serviceData =
    overrides.servico ||
    (overrides.idServico ? null : await createServico(models));
  const produto =
    overrides.produto ||
    (overrides.idProduto ? null : await createProduto(models));
  const values = {
    idServico: overrides.idServico || serviceData.servico.id,
    idProduto: overrides.idProduto || produto.id,
    quantidadeUtilizada: 2,
    ...overrides,
  };

  delete values.servico;
  delete values.produto;

  const itemServico = await models.ItemServico.create(values);
  return {
    ...serviceData,
    produto,
    itemServico,
  };
}

async function seedAuthenticatedUser(models) {
  const perfil = await createPerfil(models, { nome: "Administrador" });
  const permissao = await createPermissao(models, {
    chave: "usuarios.listar",
  });
  await perfil.setPermissoes([permissao]);

  const { usuario, password } = await createUsuario(models, {
    nome: "Usuario de Teste",
    email: "admin.test@example.com",
    perfil,
    idPerfil: perfil.id,
    password: "senha123",
  });

  return {
    password,
    perfil,
    permissao,
    usuario,
  };
}

module.exports = {
  clientePayload,
  createCliente,
  createItemServico,
  createPerfil,
  createPermissao,
  createProduto,
  createProdutoReferences,
  createServico,
  createUsuario,
  createVeiculo,
  produtoPayload,
  resetFactorySequence,
  seedAuthenticatedUser,
  servicoPayload,
  veiculoPayload,
};
