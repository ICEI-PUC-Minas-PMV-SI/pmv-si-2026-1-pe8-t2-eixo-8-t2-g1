import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import type { ServicoApi, ServicoPayload, VeiculoApi } from '@/api';

interface OSFormProps {
  onSubmit: (os: ServicoPayload) => void | Promise<void>;
  onCancel: () => void;
  initialData?: ServicoApi;
  veiculos: VeiculoApi[];
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

function getVeiculoLabel(veiculo: VeiculoApi) {
  const cliente = veiculo.cliente?.nomeCompleto;
  const veiculoLabel = `${veiculo.placa} - ${veiculo.modelo}`;

  return cliente ? `${veiculoLabel} (${cliente})` : veiculoLabel;
}

export default function OSForm({ onSubmit, onCancel, initialData, veiculos }: OSFormProps) {
  const getInitialData = (): FormDataState => {
    if (initialData) {
      return {
        descricao: initialData.descricao,
        status: initialData.status,
        data_inicio: initialData.data_inicio,
        data_fim: initialData.data_fim || '',
        valor_total: Number(initialData.valor_total || 0),
        id_veiculo: initialData.id_veiculo,
      };
    }

    return {
      descricao: '',
      status: 'Aberta',
      data_inicio: new Date().toISOString().split('T')[0],
      data_fim: '',
      valor_total: 0,
      id_veiculo: 0,
    };
  };

  const [formData, setFormData] = useState<FormDataState>(getInitialData());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      descricao: formData.descricao,
      status: formData.status,
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim || null,
      valor_total: Number(formData.valor_total) || 0,
      id_veiculo: formData.id_veiculo,
    });
  };

  const handleInputChange = (field: keyof FormDataState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Informações da Ordem de Serviço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="id_veiculo">Veículo *</Label>
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
            <Label htmlFor="status">Status *</Label>
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
            <Label htmlFor="data_inicio">Data de Entrada *</Label>
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
      </div>

      <div>
        <h3 className="font-semibold mb-4">Solicitação e Diagnóstico</h3>
        <div>
          <Label htmlFor="descricao">Descrição *</Label>
          <Textarea
            id="descricao"
            value={formData.descricao}
            onChange={(e) => handleInputChange('descricao', e.target.value)}
            placeholder="Descreva a solicitação, reclamação ou diagnóstico"
            rows={4}
            required
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Ordem de Serviço</Button>
      </div>
    </form>
  );
}
