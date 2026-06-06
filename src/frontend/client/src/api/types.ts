export interface ClienteApi {
  id: number;
  nomeCompleto: string;
  genero: "M" | "F" | "Outro";
  dataNascimento: string;
  tipo: "Física" | "Jurídica";
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    pais: string;
    cep: string;
  };
  telefone: string;
  email: string;
  isFornecedor: boolean;
  observacao?: string | null;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export type ClientePayload = Omit<
  ClienteApi,
  "id" | "dataCriacao" | "dataAtualizacao"
>;

export interface VeiculoApi {
  id: number;
  idCliente: number;
  placa: string;
  modelo: string;
  ano: number;
  cor: string;
  quilometragem: number;
  tipoVeiculo?: string | null;
  motorizacao?: string | null;
  numeroChasse?: string | null;
  tipoCombustivel?: string | null;
  dataUltimaRevisao?: string | null;
  dataCriacao?: string;
  dataAtualizacao?: string;
  cliente?: ClienteApi | null;
}

export type VeiculoPayload = Omit<VeiculoApi, "id">;

export interface ServicoApi {
  id: number;
  descricao: string;
  status: string;
  dataInicio: string;
  dataFim: string | null;
  valorTotal: number | string;
  idVeiculo: number;
  veiculo?: VeiculoApi | null;
  itens?: ItemServicoApi[];
}

export interface ServicoPayload {
  descricao: string;
  status: string;
  dataInicio: string;
  dataFim?: string | null;
  valorTotal?: number;
  idVeiculo: number;
}

export interface ProdutoApi {
  id: number;
  titulo: string;
  descricao?: string | null;
  codigoSku: string | null;
  idMarca: number | null;
  idCategoria: number | null;
  idFornecedor: number | null;
  tipoItem: string;
  preco: number | string;
  estoqueAtual: number | string;
  marca?: MarcaApi | null;
  categoria?: CategoriaApi | null;
  fornecedor?: FornecedorApi | null;
}

export interface ProdutoPayload {
  titulo: string;
  descricao?: string | null;
  codigoSku?: string;
  idMarca?: number;
  idCategoria?: number;
  idFornecedor?: number;
  tipoItem?: string;
  preco?: number;
  estoqueAtual?: number;
}

export interface RelatorioOsStatusApi {
  status: string;
  quantidade: number;
  valor: number;
}

export interface RelatorioTopClienteApi {
  nome: string;
  totalGasto: number;
}

export interface RelatorioProdutoEstoqueApi {
  produto: string;
  estoque: number;
  minimo: number;
  preco: number;
}

export interface RelatorioFaturamentoApi {
  mes: string;
  valor: number;
}

export interface RelatorioResumoApi {
  totalClientes: number;
  totalVeiculos: number;
  clientesEsteMes: number;
  osConcluidas: number;
  osTotais: number;
  produtosEmEstoque: number;
  valorConcluidas: number;
  faturamentoMesAtual: number;
  mesAtual: string;
  ticketMedio: number;
}

export interface RelatoriosApi {
  osStatus: RelatorioOsStatusApi[];
  topClientes: RelatorioTopClienteApi[];
  produtosEstoque: RelatorioProdutoEstoqueApi[];
  faturamento: RelatorioFaturamentoApi[];
  top5Produtos: RelatorioTop5ProdutosApi[];
  resumo: RelatorioResumoApi;
}

export interface RelatorioTop5ProdutosApi {
  produto: string;
  quantidadeUtilizada: number;
}

export interface ItemServicoApi {
  id: number;
  idServico: number;
  idProduto: number;
  quantidadeUtilizada: number | string;
  produto?: ProdutoApi | null;
  servico?: ServicoApi | null;
}

export type ItemServicoPayload = Omit<ItemServicoApi, "id">;

export interface UsuarioApi {
  id: string;
  nome: string;
  email: string;
  perfil: "Administrador" | "Supervisor" | "Padrão";
  status: "Ativo" | "Inativo";
  idPerfil?: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

export type UsuarioPayload = Omit<
  UsuarioApi,
  "id" | "dataCriacao" | "dataAtualizacao" | "idPerfil"
> & {
  senha?: string;
};

export interface UsuarioSessaoApi {
  id: string;
  nome: string;
  email: string;
  perfil: UsuarioApi["perfil"];
  permissoes: string[];
}

export interface FornecedorApi {
  id: number;
  nomeCompleto: string;
  telefone: string;
  email: string;
  observacao?: string;
  isFornecedor: boolean;
}

export interface FornecedorPayload {
  nomeCompleto: string;
  telefone: string;
  email: string;
  isFornecedor: boolean;
  observacao?: string | null;
}

// ============= Tabelas Auxiliares =============

export interface MarcaApi {
  id: number;
  titulo: string;
}

export type MarcaPayload = Omit<MarcaApi, "id">;

export interface CategoriaApi {
  id: number;
  titulo: string;
}

export type CategoriaPayload = Omit<CategoriaApi, "id">;

export interface TipoVeiculoApi {
  id: number;
  titulo: string;
  observacao: string;
}

export type TipoVeiculoPayload = Omit<TipoVeiculoApi, "id">;

// ============= Configurações =============

export interface EmpresaApi {
  id: number;
  nome: string;
  apelido: string;
  cnpj: string;
  logotipo: string;
  email: string;
  telefone: string;
  logradouro: string;
  numero: number;
  complemente: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  pais: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export type EmpresaPayload = Omit<
  EmpresaApi,
  "id" | "dataCriacao" | "dataAtualizacao"
>;

export interface SmtpApi {
  id: number;
  host: string;
  email: string;
  senha: string;
  porta: number;
  seguranca: string;
}

export type SmtpPayload = Omit<SmtpApi, "id">;

// ============= Autenticação =============

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  usuario: UsuarioSessaoApi;
}

export type SessionResponse = LoginResponse;
