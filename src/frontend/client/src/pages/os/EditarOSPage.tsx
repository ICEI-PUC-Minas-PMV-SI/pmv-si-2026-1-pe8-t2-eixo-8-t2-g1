import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  itensServicoApi,
  produtosApi,
  servicosApi,
  veiculosApi,
  type ItemServicoApi,
  type ProdutoApi,
  type ServicoApi,
  type ServicoPayload,
  type VeiculoApi,
} from '@/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
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
import { formatCurrency, getStatusColor } from '@/lib/utils';

interface EditarOSProps {
  id: string;
  onNavigate: (path: string) => void;
}

interface FormDataState {
  descricao: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  valor_total: number;
  id_veiculo: number;
}

const statusOptions = [
  'Aberta',
  'Em Andamento',
  'Aguardando Peças',
  'Concluída',
  'Cancelada',
];

function toFormData(servico: ServicoApi): FormDataState {
  return {
    descricao: servico.descricao,
    status: servico.status,
    data_inicio: servico.data_inicio,
    data_fim: servico.data_fim || '',
    valor_total: Number(servico.valor_total || 0),
    id_veiculo: servico.id_veiculo,
  };
}

function getVeiculoLabel(veiculo: VeiculoApi) {
  const cliente = veiculo.cliente?.nomeCompleto;
  const veiculoLabel = `${veiculo.placa} - ${veiculo.modelo}`;

  return cliente ? `${veiculoLabel} (${cliente})` : veiculoLabel;
}

function getProdutoLabel(produto: ProdutoApi) {
  return `${produto.nome} - ${formatCurrency(Number(produto.preco_unitario || 0))}`;
}

function getItemSubtotal(item: ItemServicoApi) {
  return Number(item.quantidade_utilizada) * Number(item.produto?.preco_unitario || 0);
}

export default function EditarOS({ id, onNavigate }: EditarOSProps) {
  const [servico, setServico] = useState<ServicoApi | null>(null);
  const [veiculos, setVeiculos] = useState<VeiculoApi[]>([]);
  const [produtos, setProdutos] = useState<ProdutoApi[]>([]);
  const [formData, setFormData] = useState<FormDataState | null>(null);
  const [selectedProduto, setSelectedProduto] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicoResponse, veiculosResponse, produtosResponse] = await Promise.all([
          servicosApi.getById(id),
          veiculosApi.getAll(),
          produtosApi.getAll(),
        ]);

        setServico(servicoResponse);
        setFormData(toFormData(servicoResponse));
        setVeiculos(veiculosResponse);
        setProdutos(produtosResponse);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao carregar ordem de serviço';
        toast.error(message);
        onNavigate('/os');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, onNavigate]);

  const refreshServico = async () => {
    const servicoResponse = await servicosApi.getById(id);

    setServico(servicoResponse);
    setFormData((dadosAtuais) =>
      dadosAtuais
        ? {
            ...dadosAtuais,
            valor_total: Number(servicoResponse.valor_total || 0),
          }
        : toFormData(servicoResponse),
    );
  };

  const handleInputChange = (field: keyof FormDataState, value: any) => {
    setFormData((prev) => (
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev
    ));
  };

  const getPayload = (): ServicoPayload | null => {
    if (!formData) {
      return null;
    }

    return {
      descricao: formData.descricao,
      status: formData.status,
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim || null,
      valor_total: Number(formData.valor_total) || 0,
      id_veiculo: formData.id_veiculo,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = getPayload();

    if (!payload) {
      return;
    }

    try {
      setSaving(true);
      await servicosApi.update(id, payload);
      toast.success('Ordem de Serviço atualizada com sucesso!');
      onNavigate('/os');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar ordem de serviço';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduto = async () => {
    if (!selectedProduto || quantidade <= 0) {
      toast.error('Selecione um produto e informe uma quantidade válida');
      return;
    }

    try {
      setSaving(true);
      await itensServicoApi.create({
        id_servico: Number(id),
        id_produto: Number(selectedProduto),
        quantidade_utilizada: quantidade,
      });

      setSelectedProduto('');
      setQuantidade(1);
      await refreshServico();
      toast.success('Produto adicionado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao adicionar produto';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveProduto = async (itemId: number) => {
    try {
      setSaving(true);
      await itensServicoApi.remove(itemId);
      await refreshServico();
      toast.success('Produto removido com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover produto';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      await servicosApi.remove(id);
      toast.success('Ordem de Serviço deletada com sucesso!');
      onNavigate('/os');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao deletar ordem de serviço';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Carregando ordem de serviço...</div>;
  }

  if (!servico || !formData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'OS' }, { label: 'Editar' }]} />

      <div>
        <h1>Editar Ordem de Serviço</h1>
        <p className="text-muted-foreground mt-1">ID: {servico.id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Informações da Ordem de Serviço</h3>
            <Badge className={getStatusColor(formData.status)}>{formData.status}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="id_veiculo">Veículo</Label>
              <Select
                value={formData.id_veiculo ? String(formData.id_veiculo) : ''}
                onValueChange={(value) => handleInputChange('id_veiculo', Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um veículo..." />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.map((veiculo) => (
                    <SelectItem key={veiculo.id} value={String(veiculo.id)}>
                      {getVeiculoLabel(veiculo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="data_inicio">Data de Entrada</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="data_fim">Data de Conclusão</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => handleInputChange('data_fim', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="valor_total">Valor Total (R$)</Label>
              <Input
                id="valor_total"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_total}
                onChange={(e) => handleInputChange('valor_total', Number(e.target.value))}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Solicitação e Diagnóstico</h3>
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            rows={4}
            required
          />
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Produtos e Serviços</h3>

          <div className="mb-6 p-4 bg-secondary/20 rounded-lg">
            <h4 className="font-medium mb-4">Adicionar Produto/Serviço</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="selectProduto">Produto/Serviço</Label>
                <Select value={selectedProduto} onValueChange={setSelectedProduto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map((produto) => (
                      <SelectItem key={produto.id} value={String(produto.id)}>
                        {getProdutoLabel(produto)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <Button type="button" onClick={handleAddProduto} className="w-full gap-2" disabled={saving}>
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>

          {servico.itens && servico.itens.length > 0 ? (
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
                  {servico.itens.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                      <td className="px-4 py-3">{item.produto?.nome || item.id_produto}</td>
                      <td className="px-4 py-3 text-center">{Number(item.quantidade_utilizada)}</td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(Number(item.produto?.preco_unitario || 0))}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(getItemSubtotal(item))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduto(item.id)}
                          disabled={saving}
                          title="Remover produto"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-secondary/50 px-4 py-3 border-t border-border flex justify-end">
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(Number(servico.valor_total || 0))}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto adicionado. Adicione produtos para continuar.
            </div>
          )}
        </Card>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={() => onNavigate('/os')} disabled={saving}>
            Cancelar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={saving}>
                Excluir OS
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir ordem de serviço?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. A OS #{servico.id} será removida permanentemente
                  do sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={saving}
                >
                  Confirmar exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" disabled={saving}>
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
