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

export type ClientePayload = Omit<ClienteApi, "id" | "dataCriacao" | "dataAtualizacao">;

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
  nome: string;
  quantidade: number | string;
  precoUnitario: number | string;
}

export type ProdutoPayload = Omit<ProdutoApi, "id">;

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
  precoUnitario: number;
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
  permissoes: [];
  perfil: "Administrador" | "Supervisor" | "Padrão";
  status: "Ativo" | "Inativo";
  idPerfil?: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

export type UsuarioPayload = Omit<UsuarioApi, "id" | "dataCriacao" | "dataAtualizacao"> & {
  senha?: string;
};

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

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  usuario: UsuarioApi;
  permissoes: string[];
}

export type SessionResponse = LoginResponse;
