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
import type { VeiculoApi, ClienteApi } from '@/api/types';

interface VeiculoFormProps {
  onSubmit: (veiculo: VeiculoApi) => void;
  onCancel: () => void;
  initialData?: VeiculoApi;
  clientes: ClienteApi[];
}

interface FormDataState {
  id?: number;
  id_cliente: number;
  placa: string;
  modelo: string;
  ano: number;
  cor: string;
  quilometragem: number;
  tipoVeiculo: string;
  motorizacao: string;
  numeroChasse: string;
  tipoCombustivel: string;
  dataUltimaRevisao: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export default function VeiculoForm({
  onSubmit,
  onCancel,
  initialData,
  clientes
}: VeiculoFormProps) {
  const getInitialData = (): FormDataState => {
    if (initialData) {
      return {
        id: initialData.id,
        id_cliente: initialData.id_cliente,
        placa: initialData.placa,
        modelo: initialData.modelo,
        ano: initialData.ano,
        cor: initialData.cor,
        quilometragem: initialData.quilometragem,
        tipoVeiculo: initialData.tipoVeiculo || '',
        motorizacao: initialData.motorizacao || '',
        numeroChasse: initialData.numeroChasse || '',
        tipoCombustivel: initialData.tipoCombustivel || '',
        dataUltimaRevisao: initialData.dataUltimaRevisao || '',
        dataCriacao: new Date().toISOString().split('T')[0],
        dataAtualizacao: new Date().toISOString().split('T')[0],
      };
    }
    return {
      id_cliente: 0,
      placa: '',
      modelo: '',
      ano: new Date().getFullYear(),
      cor: '',
      quilometragem: 0,
      tipoVeiculo: '',
      motorizacao: '',
      numeroChasse: '',
      tipoCombustivel: 'Gasolina',
      dataUltimaRevisao: '',
      dataCriacao: new Date().toISOString().split('T')[0],
      dataAtualizacao: new Date().toISOString().split('T')[0],
    };
  };

  const [formData, setFormData] = useState<FormDataState>(getInitialData());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const veiculo: VeiculoApi = {
      id: 0,
      id_cliente: formData.id_cliente,
      placa: formData.placa,
      modelo: formData.modelo,
      ano: formData.ano,
      cor: formData.cor,
      quilometragem: formData.quilometragem,
      tipoVeiculo: formData.tipoVeiculo || null,
      motorizacao: formData.motorizacao || null,
      numeroChasse: formData.numeroChasse || null,
      tipoCombustivel: formData.tipoCombustivel || null,
      dataUltimaRevisao: formData.dataUltimaRevisao || null,
    };
    onSubmit(veiculo);
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
          <div>
            <Label htmlFor="placa">Placa *</Label>
            <Input
              id="placa"
              value={formData.placa}
              onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
              placeholder="ABC-1234"
              required
            />
          </div>
          <div>
            <Label htmlFor="modelo">Modelo *</Label>
            <Input
              id="modelo"
              value={formData.modelo}
              onChange={(e) => handleInputChange('modelo', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="ano">Ano *</Label>
            <Input
              id="ano"
              type="number"
              value={formData.ano}
              onChange={(e) => handleInputChange('ano', parseInt(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="cor">Cor *</Label>
            <Input
              id="cor"
              value={formData.cor}
              onChange={(e) => handleInputChange('cor', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="quilometragem">Quilometragem *</Label>
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
              value={formData.tipoVeiculo}
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
      </div>

      {/* Especificações Técnicas */}
      <div>
        <h3 className="font-semibold mb-4">Especificações Técnicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="motorizacao">Motorização</Label>
            <Input
              id="motorizacao"
              value={formData.motorizacao}
              onChange={(e) => handleInputChange('motorizacao', e.target.value)}
              placeholder="2.0"
            />
          </div>
          <div>
            <Label htmlFor="tipoCombustivel">Tipo de Combustível</Label>
            <Select
              value={formData.tipoCombustivel}
              onValueChange={(value) => handleInputChange('tipoCombustivel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Gasolina">Gasolina</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Álcool">Álcool</SelectItem>
                <SelectItem value="Híbrido">Híbrido</SelectItem>
                <SelectItem value="Elétrico">Elétrico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="numeroChasse">Número do Chassi</Label>
            <Input
              id="numeroChasse"
              value={formData.numeroChasse}
              onChange={(e) => handleInputChange('numeroChasse', e.target.value)}
              placeholder="JTDKN3AU5L0123456"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="dataUltimaRevisao">Data da Última Revisão</Label>
            <Input
              id="dataUltimaRevisao"
              type="date"
              value={formData.dataUltimaRevisao}
              onChange={(e) => handleInputChange('dataUltimaRevisao', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="id_cliente">Cliente *</Label>
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
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Veículo</Button>
      </div>
    </form>
  );
}
