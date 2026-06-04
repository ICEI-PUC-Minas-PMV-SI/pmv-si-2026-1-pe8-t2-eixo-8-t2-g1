import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const BRL_CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatCurrency(value: number): string {
  return BRL_CURRENCY_FORMATTER.format(value);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    'Aberta': 'bg-blue-100 text-blue-800',
    'Em Andamento': 'bg-yellow-100 text-yellow-800',
    'Aguardando Peças': 'bg-orange-100 text-orange-800',
    'Concluída': 'bg-green-100 text-green-800',
    'Cancelada': 'bg-red-100 text-red-800',
    'Ativo': 'bg-green-100 text-green-800',
    'Inativo': 'bg-gray-100 text-gray-800',
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

export function filterBySearch<T>(items: T[], searchTerm: string, searchFields: (keyof T)[]): T[] {
  if (!searchTerm) return items;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return String(value).toLowerCase().includes(lowerSearchTerm);
    })
  );
}

export function paginateArray<T>(items: T[], pageIndex: number, pageSize: number): T[] {
  const startIndex = pageIndex * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}
