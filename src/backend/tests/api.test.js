const { after, before, beforeEach, describe } = require("node:test");
const {
  closeDatabase,
  configureTestEnvironment,
  initializeDatabase,
  resetDatabase,
} = require("./helpers/database");

configureTestEnvironment();

const {
  resetFactorySequence,
  seedAuthenticatedUser,
} = require("./helpers/factories");
const registerSystemTests = require("./suites/system.test");
const registerUsuariosTests = require("./suites/usuarios.test");
const registerClientesTests = require("./suites/clientes.test");
const registerVeiculosTests = require("./suites/veiculos.test");
const registerProdutosTests = require("./suites/produtos.test");
const registerServicosTests = require("./suites/servicos.test");
const registerItensServicoTests = require("./suites/itens-servico.test");
const registerPerfisPermissoesTests = require("./suites/perfis-permissoes.test");
const registerConsultasTests = require("./suites/consultas.test");

const context = {
  app: null,
  auth: null,
  models: null,
};

describe("API AutoPro", { concurrency: false }, () => {
  before(async () => {
    const initialized = await initializeDatabase();
    context.app = initialized.app;
    context.models = initialized.models;
  });

  beforeEach(async () => {
    await resetDatabase(context.models);
    resetFactorySequence();
    context.auth = await seedAuthenticatedUser(context.models);
  });

  after(async () => {
    await resetDatabase(context.models);
    await closeDatabase(context.models);
  });

  registerSystemTests(context);
  registerUsuariosTests(context);
  registerClientesTests(context);
  registerVeiculosTests(context);
  registerProdutosTests(context);
  registerServicosTests(context);
  registerItensServicoTests(context);
  registerPerfisPermissoesTests(context);
  registerConsultasTests(context);
});
