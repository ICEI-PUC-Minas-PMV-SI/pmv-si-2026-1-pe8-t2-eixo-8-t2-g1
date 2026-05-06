import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generateId } from '@/lib/utils';
import type { Produto } from '@/types';

interface ProdutoFormProps {
  onSubmit: (produto: Produto) => void;
  onCancel: () => void;
  initialData?: Produto;
}

interface FormDataState {
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

export default function ProdutoForm({
  onSubmit,
  onCancel,
  initialData,
}: ProdutoFormProps) {
  const getInitialData = (): FormDataState => {
    if (initialData) {
      return {
        ...initialData,
      };
    }
    return {
      id: generateId(),
      titulo: '',
      descricao: '',
      codigoSku: '',
      marca: '',
      categoria: '',
      fornecedor: '',
      preco: 0,
      estoqueAtual: 0,
      tipoItem: 'Produto',
      dataCriacao: new Date().toISOString().split('T')[0],
      dataAtualizacao: new Date().toISOString().split('T')[0],
    };
  };

  const [formData, setFormData] = useState<FormDataState>(getInitialData());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const produto: Produto = {
      id: formData.id,
      titulo: formData.titulo,
      descricao: formData.descricao,
      codigoSku: formData.codigoSku,
      marca: formData.marca,
      categoria: formData.categoria,
      fornecedor: formData.fornecedor,
      preco: formData.preco,
      estoqueAtual: formData.estoqueAtual,
      tipoItem: formData.tipoItem,
      dataCriacao: formData.dataCriacao,
      dataAtualizacao: new Date().toISOString().split('T')[0],
    };
    onSubmit(produto);
  };

  const handleInputChange = (field: keyof FormDataState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <div>
        <h3 className="font-semibold mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="codigoSku">Código/SKU *</Label>
            <Input
              id="codigoSku"
              value={formData.codigoSku}
              onChange={(e) => handleInputChange('codigoSku', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="marca">Marca *</Label>
            <Input
              id="marca"
              value={formData.marca}
              onChange={(e) => handleInputChange('marca', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="categoria">Categoria *</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleInputChange('categoria', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="fornecedor">Fornecedor *</Label>
            <Input
              id="fornecedor"
              value={formData.fornecedor}
              onChange={(e) => handleInputChange('fornecedor', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="tipoItem">Tipo de Item *</Label>
            <Select
              value={formData.tipoItem}
              onValueChange={(value: any) => handleInputChange('tipoItem', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Produto">Produto</SelectItem>
                <SelectItem value="Serviço">Serviço</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Preço e Estoque */}
      <div>
        <h3 className="font-semibold mb-4">Preço e Estoque</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => handleInputChange('preco', parseFloat(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="estoqueAtual">Estoque Atual *</Label>
            <Input
              id="estoqueAtual"
              type="number"
              value={formData.estoqueAtual}
              onChange={(e) => handleInputChange('estoqueAtual', parseInt(e.target.value))}
              required
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Produto</Button>
      </div>
    </form>
  );
}
