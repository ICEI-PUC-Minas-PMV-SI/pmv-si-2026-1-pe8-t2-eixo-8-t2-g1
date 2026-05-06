// Tipos para Pessoas
export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais: string;
  cep: string;
}

export interface Pessoa {
  id: string;
  nomeCompleto: string;
  genero: 'M' | 'F' | 'Outro';
  dataNascimento: string;
  tipo: 'Física' | 'Jurídica';
  endereco: Endereco;
  telefone: string;
  email: string;
  isFornecedor: boolean;
  observacao?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// Tipos para Veículos
export interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  ano: number;
  cor: string;
  quilometragem: number;
  tipoVeiculo?: string;
  motorizacao?: string;
  numeroChasse?: string;
  tipoCombustivel?: string;
  dataUltimaRevisao?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// Tipos para Produtos
export interface Produto {
  id: string;
  titulo: string;
  descricao: string;
  codigoSku: string;
  marca: string;
  categoria: string;
  fornecedor: string;
  preco: number;
  estoqueAtual: number;
  tipoItem: 'Produto' | 'Serviço';
  dataCriacao: string;
  dataAtualizacao: string;
}

// Tipos para OS (Ordem de Serviço)
export interface ItemOS {
  id: string;
  produtoId: string;
  quantidade: number;
  preco: number;
  subtotal: number;
}

export interface OrdemServico {
  id: string;
  status: 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  
  // Dados do Cliente
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteTelefone: string;
  clienteEmail: string;
  
  // Dados do Veículo
  veiculoMarca: string;
  veiculoModelo: string;
  veiculoAno: number;
  veiculoPlaca: string;
  veiculoCor: string;
  veiculoQuilometragem: number;
  
  // Informações da OS
  nivelCombustivel: 'Vazio' | '1/4' | '1/2' | '3/4' | 'Cheio';
  dataEntrada: string;
  solicitacaoCliente: string;
  diagnostico: string;
  
  // Itens e valores
  itens: ItemOS[];
  valorTotal: number;
  
  // Auditoria
  dataAbertura: string;
  dataConclusao?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// Tipos para Tabelas Auxiliares
export interface Marca {
  id: string;
  nome: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface Categoria {
  id: string;
  nome: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface TipoVeiculo {
  id: string;
  nome: string;
  observacao?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// Tipos para Configurações
export interface ConfigSMTP {
  host: string;
  email: string;
  password: string;
  porta: number;
  seguranca: 'SSL' | 'TLS';
}

export interface ConfigEmpresa {
  nome: string;
  cnpj: string;
  logotipo?: string;
  endereco: Endereco;
  email: string;
  telefone: string;
}

// Tipos para Paginação
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

// Tipos para Usuário
export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'Administrador' | 'Supervisor' | 'Padrão';
  status: 'Ativo' | 'Inativo';
  dataCriacao: string;
  dataAtualizacao: string;
}
