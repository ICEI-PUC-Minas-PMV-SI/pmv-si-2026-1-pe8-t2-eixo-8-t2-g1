import type {
  Categoria,
  Marca,
  TipoVeiculo,
} from '@/types';

export const mockMarcas: Marca[] = [
  {
    id: '1',
    nome: 'Bosch',
    dataCriacao: '2023-01-01',
    dataAtualizacao: '2023-01-01',
  },
  {
    id: '2',
    nome: 'Fras-le',
    dataCriacao: '2023-01-01',
    dataAtualizacao: '2023-01-01',
  },
  {
    id: '3',
    nome: 'Cofap',
    dataCriacao: '2023-01-01',
    dataAtualizacao: '2023-01-01',
  },
];

export const mockCategorias: Categoria[] = [
  {
    id: '1',
    nome: 'Filtros',
    dataCriacao: '2023-01-01',
    dataAtualizacao: '2023-01-01',
  },
  {
    id: '2',
    nome: 'Freios',
    dataCriacao: '2023-01-01',
    dataAtualizacao: '2023-01-01',
  },
  {
    id: '3',
    nome: 'Suspensao',
    dataCriacao: '2023-01-01',
    dataAtualizacao: '2023-01-01',
  },
];

export const mockTiposVeiculo: TipoVeiculo[] = [
  {
    id: '1',
    nome: 'Sedan',
    observacao: 'Carro de passeio com 4 portas',
    dataCriacao: '2023-01-01',
    dataAtualizacao: '2023-01-01',
  },
  {
    id: '2',
    nome: 'SUV',
    observacao: 'Veiculo utilitario esportivo',
    dataCriacao: '2023-01-01',
    dataAtualizacao: '2023-01-01',
  },
  {
    id: '3',
    nome: 'Hatchback',
    observacao: 'Carro compacto com porta traseira',
    dataCriacao: '2023-01-01',
    dataAtualizacao: '2023-01-01',
  },
];
