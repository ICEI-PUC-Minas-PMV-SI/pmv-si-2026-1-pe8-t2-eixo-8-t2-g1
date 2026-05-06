import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Breadcrumbs from '@/components/Breadcrumbs';
import { toast } from 'sonner';
import type { Produto } from '@/types';

interface EditarProdutoProps {
  produto: Produto;
  onSave: (produto: Produto) => void;
  onCancel: () => void;
}

export default function EditarProduto({ produto, onSave, onCancel }: EditarProdutoProps) {
  const [formData, setFormData] = useState<Produto>(produto);

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast.success('Produto atualizado com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Produtos' }, { label: 'Editar' }]} />

      {/* Header */}
      <div>
        <h1>Editar Produto</h1>
        <p className="text-muted-foreground mt-1">ID: {formData.id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card className="p-6">
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
        </Card>

        {/* Preço e Estoque */}
        <Card className="p-6">
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
        </Card>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  );
}
