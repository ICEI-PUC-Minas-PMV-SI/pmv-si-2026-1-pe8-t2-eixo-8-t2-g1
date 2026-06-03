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
  data_criacao?: string;
  data_atualizacao?: string;
}

export type ClientePayload = Omit<ClienteApi, "id" | "data_criacao" | "data_atualizacao">;

export interface VeiculoApi {
  id: number;
  id_cliente: number;
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
  data_criacao?: string;
  data_atualizacao?: string;
  cliente?: ClienteApi | null;
}

export type VeiculoPayload = Omit<VeiculoApi, "id">;

export interface ServicoApi {
  id: number;
  descricao: string;
  status: string;
  data_inicio: string;
  data_fim: string | null;
  valor_total: number | string;
  id_veiculo: number;
  veiculo?: VeiculoApi | null;
  itens?: ItemServicoApi[];
}

export interface ServicoPayload {
  descricao: string;
  status: string;
  data_inicio: string;
  data_fim?: string | null;
  valor_total?: number;
  id_veiculo: number;
}

export interface ProdutoApi {
  id: number;
  nome: string;
  quantidade: number | string;
  preco_unitario: number | string;
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
  clientesEsteMes: number;
  osConcluidas: number;
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
  id_servico: number;
  id_produto: number;
  quantidade_utilizada: number | string;
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
  data_criacao: string;
  data_atualizacao: string;
}

export type UsuarioPayload = Omit<UsuarioApi, "id" | "data_criacao" | "data_atualizacao"> & {
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
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  observacao?: string | null;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioApi;
}
