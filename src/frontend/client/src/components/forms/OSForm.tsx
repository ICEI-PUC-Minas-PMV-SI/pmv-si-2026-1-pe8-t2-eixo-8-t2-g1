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
import { generateId } from '@/lib/utils';
import type { OrdemServico } from '@/types';

interface OSFormProps {
  onSubmit: (os: OrdemServico) => void;
  onCancel: () => void;
  initialData?: OrdemServico;
}

interface FormDataState {
  id: string;
  status: 'Aberta' | 'Em Andamento' | 'Concluída' | 'Cancelada';
  clienteNome: string;
  clienteCpfCnpj: string;
  clienteTelefone: string;
  clienteEmail: string;
  veiculoMarca: string;
  veiculoModelo: string;
  veiculoAno: number;
  veiculoPlaca: string;
  veiculoCor: string;
  veiculoQuilometragem: number;
  nivelCombustivel: 'Vazio' | '1/4' | '1/2' | '3/4' | 'Cheio';
  dataEntrada: string;
  solicitacaoCliente: string;
  diagnostico: string;
  itens: any[];
  valorTotal: number;
  dataAbertura: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export default function OSForm({ onSubmit, onCancel, initialData }: OSFormProps) {
  const getInitialData = (): FormDataState => {
    if (initialData) {
      return { ...initialData };
    }
    return {
      id: generateId(),
      status: 'Aberta',
      clienteNome: '',
      clienteCpfCnpj: '',
      clienteTelefone: '',
      clienteEmail: '',
      veiculoMarca: '',
      veiculoModelo: '',
      veiculoAno: new Date().getFullYear(),
      veiculoPlaca: '',
      veiculoCor: '',
      veiculoQuilometragem: 0,
      nivelCombustivel: '1/2',
      dataEntrada: new Date().toISOString().split('T')[0],
      solicitacaoCliente: '',
      diagnostico: '',
      itens: [],
      valorTotal: 0,
      dataAbertura: new Date().toISOString().split('T')[0],
      dataCriacao: new Date().toISOString().split('T')[0],
      dataAtualizacao: new Date().toISOString().split('T')[0],
    };
  };

  const [formData, setFormData] = useState<FormDataState>(getInitialData());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const os: OrdemServico = {
      ...formData,
      dataAtualizacao: new Date().toISOString().split('T')[0],
    };
    onSubmit(os);
  };

  const handleInputChange = (field: keyof FormDataState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações do Cliente */}
      <div>
        <h3 className="font-semibold mb-4">Informações do Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="clienteNome">Nome do Cliente *</Label>
            <Input
              id="clienteNome"
              value={formData.clienteNome}
              onChange={(e) => handleInputChange('clienteNome', e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="clienteCpfCnpj">CPF/CNPJ *</Label>
            <Input
              id="clienteCpfCnpj"
              value={formData.clienteCpfCnpj}
              onChange={(e) => handleInputChange('clienteCpfCnpj', e.target.value)}
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div>
            <Label htmlFor="clienteTelefone">Telefone *</Label>
            <Input
              id="clienteTelefone"
              value={formData.clienteTelefone}
              onChange={(e) => handleInputChange('clienteTelefone', e.target.value)}
              placeholder="(11) 98765-4321"
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="clienteEmail">E-mail *</Label>
            <Input
              id="clienteEmail"
              type="email"
              value={formData.clienteEmail}
              onChange={(e) => handleInputChange('clienteEmail', e.target.value)}
              placeholder="cliente@example.com"
              required
            />
          </div>
        </div>
      </div>

      {/* Informações do Veículo */}
      <div>
        <h3 className="font-semibold mb-4">Informações do Veículo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="veiculoMarca">Marca *</Label>
            <Input
              id="veiculoMarca"
              value={formData.veiculoMarca}
              onChange={(e) => handleInputChange('veiculoMarca', e.target.value)}
              placeholder="Toyota"
              required
            />
          </div>
          <div>
            <Label htmlFor="veiculoModelo">Modelo *</Label>
            <Input
              id="veiculoModelo"
              value={formData.veiculoModelo}
              onChange={(e) => handleInputChange('veiculoModelo', e.target.value)}
              placeholder="Corolla"
              required
            />
          </div>
          <div>
            <Label htmlFor="veiculoAno">Ano *</Label>
            <Input
              id="veiculoAno"
              type="number"
              value={formData.veiculoAno}
              onChange={(e) => handleInputChange('veiculoAno', parseInt(e.target.value))}
              placeholder="2022"
              required
            />
          </div>
          <div>
            <Label htmlFor="veiculoPlaca">Placa *</Label>
            <Input
              id="veiculoPlaca"
              value={formData.veiculoPlaca}
              onChange={(e) => handleInputChange('veiculoPlaca', e.target.value)}
              placeholder="ABC-1234"
              required
            />
          </div>
          <div>
            <Label htmlFor="veiculoCor">Cor *</Label>
            <Input
              id="veiculoCor"
              value={formData.veiculoCor}
              onChange={(e) => handleInputChange('veiculoCor', e.target.value)}
              placeholder="Prata"
              required
            />
          </div>
          <div>
            <Label htmlFor="veiculoQuilometragem">Quilometragem Atual *</Label>
            <Input
              id="veiculoQuilometragem"
              type="number"
              value={formData.veiculoQuilometragem}
              onChange={(e) => handleInputChange('veiculoQuilometragem', parseInt(e.target.value))}
              placeholder="15000"
              required
            />
          </div>
        </div>
      </div>

      {/* Informações da OS */}
      <div>
        <h3 className="font-semibold mb-4">Informações da Ordem de Serviço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nivelCombustivel">Nível de Combustível *</Label>
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
          <div>
            <Label htmlFor="dataEntrada">Data de Entrada *</Label>
            <Input
              id="dataEntrada"
              type="date"
              value={formData.dataEntrada}
              onChange={(e) => handleInputChange('dataEntrada', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status *</Label>
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
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Solicitação e Diagnóstico */}
      <div>
        <h3 className="font-semibold mb-4">Solicitação e Diagnóstico</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="solicitacaoCliente">Solicitação/Reclamação do Cliente *</Label>
            <Textarea
              id="solicitacaoCliente"
              value={formData.solicitacaoCliente}
              onChange={(e) => handleInputChange('solicitacaoCliente', e.target.value)}
              placeholder="Descreva a solicitação ou reclamação do cliente"
              rows={3}
              required
            />
          </div>
          <div>
            <Label htmlFor="diagnostico">Diagnóstico</Label>
            <Textarea
              id="diagnostico"
              value={formData.diagnostico}
              onChange={(e) => handleInputChange('diagnostico', e.target.value)}
              placeholder="Descreva o diagnóstico realizado"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Ordem de Serviço</Button>
      </div>
    </form>
  );
}
