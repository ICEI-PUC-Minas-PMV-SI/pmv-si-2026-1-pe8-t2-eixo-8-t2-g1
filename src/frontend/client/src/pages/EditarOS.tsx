import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
import { mockProdutos } from '@/lib/mockData';
import { formatCurrency, generateId } from '@/lib/utils';
import { toast } from 'sonner';
import type { OrdemServico, ItemOS, Produto } from '@/types';

interface EditarOSProps {
  os: OrdemServico;
  onSave: (os: OrdemServico) => void;
  onCancel: () => void;
}

export default function EditarOS({ os, onSave, onCancel }: EditarOSProps) {
  const [formData, setFormData] = useState<OrdemServico>(os);
  const [selectedProduto, setSelectedProduto] = useState<string>('');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [preco, setPreco] = useState<number>(0);

  const handleAddProduto = () => {
    if (!selectedProduto || quantidade <= 0) {
      toast.error('Selecione um produto e informe uma quantidade válida');
      return;
    }

    const produto = mockProdutos.find((p) => p.id === selectedProduto);
    if (!produto) return;

    const novoItem: ItemOS = {
      id: generateId(),
      produtoId: selectedProduto,
      quantidade,
      preco: preco || produto.preco,
      subtotal: (preco || produto.preco) * quantidade,
    };

    const novosItens = [...formData.itens, novoItem];
    const novoValorTotal = novosItens.reduce((sum, item) => sum + item.subtotal, 0);

    setFormData({
      ...formData,
      itens: novosItens,
      valorTotal: novoValorTotal,
    });

    setSelectedProduto('');
    setQuantidade(1);
    setPreco(0);
    toast.success('Produto adicionado com sucesso!');
  };

  const handleRemoveProduto = (itemId: string) => {
    const novosItens = formData.itens.filter((item) => item.id !== itemId);
    const novoValorTotal = novosItens.reduce((sum, item) => sum + item.subtotal, 0);

    setFormData({
      ...formData,
      itens: novosItens,
      valorTotal: novoValorTotal,
    });
    toast.success('Produto removido com sucesso!');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast.success('Ordem de Serviço atualizada com sucesso!');
  };

  const getProdutoNome = (produtoId: string) => {
    return mockProdutos.find((p) => p.id === produtoId)?.titulo || 'Produto desconhecido';
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'OS' }, { label: 'Editar' }]} />

      {/* Header */}
      <div>
        <h1>Editar Ordem de Serviço</h1>
        <p className="text-muted-foreground mt-1">ID: {formData.id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do Cliente */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Informações do Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="clienteNome">Nome do Cliente</Label>
              <Input
                id="clienteNome"
                value={formData.clienteNome}
                onChange={(e) => handleInputChange('clienteNome', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="clienteCpfCnpj">CPF/CNPJ</Label>
              <Input
                id="clienteCpfCnpj"
                value={formData.clienteCpfCnpj}
                onChange={(e) => handleInputChange('clienteCpfCnpj', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="clienteTelefone">Telefone</Label>
              <Input
                id="clienteTelefone"
                value={formData.clienteTelefone}
                onChange={(e) => handleInputChange('clienteTelefone', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="clienteEmail">E-mail</Label>
              <Input
                id="clienteEmail"
                type="email"
                value={formData.clienteEmail}
                onChange={(e) => handleInputChange('clienteEmail', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Informações do Veículo */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Informações do Veículo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="veiculoMarca">Marca</Label>
              <Input
                id="veiculoMarca"
                value={formData.veiculoMarca}
                onChange={(e) => handleInputChange('veiculoMarca', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="veiculoModelo">Modelo</Label>
              <Input
                id="veiculoModelo"
                value={formData.veiculoModelo}
                onChange={(e) => handleInputChange('veiculoModelo', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="veiculoAno">Ano</Label>
              <Input
                id="veiculoAno"
                type="number"
                value={formData.veiculoAno}
                onChange={(e) => handleInputChange('veiculoAno', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="veiculoPlaca">Placa</Label>
              <Input
                id="veiculoPlaca"
                value={formData.veiculoPlaca}
                onChange={(e) => handleInputChange('veiculoPlaca', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="veiculoCor">Cor</Label>
              <Input
                id="veiculoCor"
                value={formData.veiculoCor}
                onChange={(e) => handleInputChange('veiculoCor', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="veiculoQuilometragem">Quilometragem Atual</Label>
              <Input
                id="veiculoQuilometragem"
                type="number"
                value={formData.veiculoQuilometragem}
                onChange={(e) => handleInputChange('veiculoQuilometragem', parseInt(e.target.value))}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="nivelCombustivel">Nível de Combustível</Label>
              <Select
                value={formData.nivelCombustivel}
                onValueChange={(value: any) => handleInputChange('nivelCombustivel', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vazio">Vazio</SelectItem>
                  <SelectItem value="1/4">1/4</SelectItem>
                  <SelectItem value="1/2">1/2</SelectItem>
                  <SelectItem value="3/4">3/4</SelectItem>
                  <SelectItem value="Cheio">Cheio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Informações da OS */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Informações da Ordem de Serviço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataEntrada">Data de Entrada</Label>
              <Input
                id="dataEntrada"
                type="date"
                value={formData.dataEntrada}
                onChange={(e) => handleInputChange('dataEntrada', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aberta">Aberta</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Aguardando Peças">Aguardando Peças</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="solicitacaoCliente">Solicitação/Reclamação do Cliente</Label>
              <Textarea
                id="solicitacaoCliente"
                value={formData.solicitacaoCliente}
                onChange={(e) => handleInputChange('solicitacaoCliente', e.target.value)}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Textarea
                id="diagnostico"
                value={formData.diagnostico}
                onChange={(e) => handleInputChange('diagnostico', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Produtos/Serviços */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Produtos e Serviços</h3>
          
          {/* Adicionar Produto */}
          <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
            <h4 className="font-medium mb-4">Adicionar Produto/Serviço</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="selectProduto">Produto/Serviço</Label>
                <Select value={selectedProduto} onValueChange={setSelectedProduto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProdutos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="qtd">Quantidade</Label>
                <Input
                  id="qtd"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  value={preco}
                  onChange={(e) => setPreco(parseFloat(e.target.value))}
                  placeholder="Automático"
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={handleAddProduto} className="w-full gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Produtos */}
          {formData.itens.length > 0 ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-4 py-3 text-left font-semibold">Produto</th>
                    <th className="px-4 py-3 text-center font-semibold">Quantidade</th>
                    <th className="px-4 py-3 text-right font-semibold">Preço</th>
                    <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
                    <th className="px-4 py-3 text-center font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.itens.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                      <td className="px-4 py-3">{getProdutoNome(item.produtoId)}</td>
                      <td className="px-4 py-3 text-center">{item.quantidade}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.preco)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduto(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="bg-secondary/50 px-4 py-3 border-t border-border flex justify-end">
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(formData.valorTotal)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto adicionado. Adicione produtos para continuar.
            </div>
          )}
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
