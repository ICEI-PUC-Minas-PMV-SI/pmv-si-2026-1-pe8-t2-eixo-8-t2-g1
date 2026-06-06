export { default as api } from "./http";
export { authApi } from "./auth";
export { clientesApi } from "./clientes";
export { itensServicoApi } from "./itensServico";
export { produtosApi } from "./produtos";
export { relatoriosApi } from "./relatorios";
export { servicosApi } from "./servicos";
export { usuariosApi } from "./usuarios";
export { veiculosApi } from "./veiculos";
export { fornecedoresApi } from "./fornecedores";
export { marcasApi } from "./marcas";
export { categoriasApi } from "./categorias";

export type {
  ClienteApi,
  ClientePayload,
  ItemServicoApi,
  ItemServicoPayload,
  LoginPayload,
  LoginResponse,
  SessionResponse,
  ProdutoApi,
  ProdutoPayload,
  RelatorioFaturamentoApi,
  RelatorioOsStatusApi,
  RelatorioProdutoEstoqueApi,
  RelatorioResumoApi,
  RelatorioTopClienteApi,
  RelatoriosApi,
  ServicoApi,
  ServicoPayload,
  VeiculoApi,
  VeiculoPayload,
  UsuarioApi,
  UsuarioSessaoApi,
  UsuarioPayload,
  FornecedorApi,
  FornecedorPayload,
  MarcaApi,
  MarcaPayload,
  CategoriaApi,
  CategoriaPayload,
} from "./types";
