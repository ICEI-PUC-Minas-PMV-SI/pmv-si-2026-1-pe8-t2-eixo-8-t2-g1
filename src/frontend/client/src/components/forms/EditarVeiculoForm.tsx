import { useState } from 'react';
import { toast } from 'sonner';
import Breadcrumbs from '@/components/Breadcrumbs';
import { VeiculoApi, veiculosApi, ClienteApi } from '@/api';
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

interface EditarVeiculoProps {
  id: string;
  veiculo: VeiculoApi;
  clientes: ClienteApi[];
  onNavigate: (path: string) => void;
  onSave: (veiculo: VeiculoApi) => void;
  onCancel: () => void;
}

export default function EditarVeiculoForm({
  id,
  veiculo,
  clientes,
  onNavigate,
  onSave,
  onCancel,
}: EditarVeiculoProps) {
  const [formData, setFormData] = useState<VeiculoApi>(veiculo);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await onSave(formData);
      toast.success('Veículo atualizado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar veículo';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await veiculosApi.remove(id);
      toast.success('Veículo deletado com sucesso!');
      onNavigate('/veiculos');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao deletar veículo';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Veículos' }, { label: 'Editar' }]} />

      <div>
        <h1>Editar Veículo</h1>
        <p className="text-muted-foreground mt-1">ID: {formData.id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="placa">Placa</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => handleInputChange('placa', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="ano">Ano</Label>
              <Input
                id="ano"
                type="number"
                value={formData.ano}
                onChange={(e) => handleInputChange('ano', parseInt(e.target.value))}
                required
              />
            </div>
            <div>
              <Label htmlFor="cor">Cor</Label>
              <Input
                id="cor"
                value={formData.cor}
                onChange={(e) => handleInputChange('cor', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="id_cliente">Cliente</Label>
              <Select
                value={formData.id_cliente ? String(formData.id_cliente) : ''}
                onValueChange={(value) => handleInputChange('id_cliente', Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={String(cliente.id)}>
                      {cliente.nomeCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quilometragem">Quilometragem</Label>
              <Input
                id="quilometragem"
                type="number"
                value={formData.quilometragem}
                onChange={(e) => handleInputChange('quilometragem', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="tipoVeiculo">Tipo de Veículo</Label>
              <Select
                value={formData.tipoVeiculo || ''}
                onValueChange={(value) => handleInputChange('tipoVeiculo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                  <SelectItem value="Picape">Picape</SelectItem>
                  <SelectItem value="Minivan">Minivan</SelectItem>
                  <SelectItem value="Utilitário">Utilitário</SelectItem>
                  <SelectItem value="Caminhão">Caminhão</SelectItem>
                  <SelectItem value="Ônibus">Ônibus</SelectItem>
                  <SelectItem value="Moto">Moto</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Informações Técnicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="motorizacao">Motorização</Label>
              <Input
                id="motorizacao"
                value={formData.motorizacao || ''}
                onChange={(e) => handleInputChange('motorizacao', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="numeroChasse">Número do Chassi</Label>
              <Input
                id="numeroChasse"
                value={formData.numeroChasse || ''}
                onChange={(e) => handleInputChange('numeroChasse', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tipoCombustivel">Tipo de Combustível</Label>
              <Input
                id="tipoCombustivel"
                value={formData.tipoCombustivel || ''}
                onChange={(e) => handleInputChange('tipoCombustivel', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dataUltimaRevisao">Data da Última Revisão</Label>
              <Input
                id="dataUltimaRevisao"
                type="date"
                value={formData.dataUltimaRevisao || ''}
                onChange={(e) => handleInputChange('dataUltimaRevisao', e.target.value)}
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={loading}>
                Excluir veículo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir veículo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. O veículo {formData.placa} será removido
                  permanentemente do sistema.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={loading}
                >
                  Confirmar exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit" disabled={loading}>
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
