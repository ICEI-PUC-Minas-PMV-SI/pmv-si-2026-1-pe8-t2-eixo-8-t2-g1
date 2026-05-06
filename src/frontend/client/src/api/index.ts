export { default as api } from "./http";
export { authApi } from "./auth";
export { clientesApi } from "./clientes";
export { itensServicoApi } from "./itensServico";
export { produtosApi } from "./produtos";
export { servicosApi } from "./servicos";
export { usuariosApi } from "./usuarios";
export { veiculosApi } from "./veiculos";
export type {
  ClienteApi,
  ClientePayload,
  ItemServicoApi,
  ItemServicoPayload,
  LoginPayload,
  LoginResponse,
  ProdutoApi,
  ProdutoPayload,
  ServicoApi,
  ServicoPayload,
  VeiculoApi,
  VeiculoPayload,
  UsuarioApi,
  UsuarioPayload,
} from "./types";
