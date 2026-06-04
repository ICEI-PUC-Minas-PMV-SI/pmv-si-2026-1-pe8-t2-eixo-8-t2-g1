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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { generateId } from '@/lib/utils';
import type { Pessoa } from '@/types';

interface PessoaFormProps {
  onSubmit: (pessoa: Pessoa) => void;
  onCancel: () => void;
  initialData?: Pessoa;
}

interface FormDataState {
  id: string;
  nomeCompleto: string;
  genero: string;
  dataNascimento: string;
  tipo: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    pais: string;
    cep: string;
  };
  telefone: string;
  email: string;
  isFornecedor: boolean;
  observacao: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export default function PessoaForm({
  onSubmit,
  onCancel,
  initialData,
}: PessoaFormProps) {
  const getInitialData = (): FormDataState => {
    if (initialData) {
      return {
        ...initialData,
        observacao: initialData.observacao || '',
        endereco: {
          logradouro: initialData.endereco.logradouro,
          numero: initialData.endereco.numero,
          complemento: initialData.endereco.complemento || '',
          bairro: initialData.endereco.bairro,
          cidade: initialData.endereco.cidade,
          uf: initialData.endereco.uf,
          pais: initialData.endereco.pais,
          cep: initialData.endereco.cep,
        },
      };
    }
    return {
      id: generateId(),
      nomeCompleto: '',
      genero: 'M',
      dataNascimento: '',
      tipo: 'Física',
      telefone: '',
      email: '',
      isFornecedor: false,
      observacao: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        pais: 'Brasil',
        cep: '',
      },
      dataCriacao: new Date().toISOString().split('T')[0],
      dataAtualizacao: new Date().toISOString().split('T')[0],
    };
  };

  const [formData, setFormData] = useState<FormDataState>(getInitialData());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pessoa: Pessoa = {
      id: formData.id,
      nomeCompleto: formData.nomeCompleto,
      genero: (formData.genero as 'M' | 'F' | 'Outro'),
      dataNascimento: formData.dataNascimento,
      tipo: (formData.tipo as 'Física' | 'Jurídica'),
      endereco: formData.endereco,
      telefone: formData.telefone,
      email: formData.email,
      isFornecedor: formData.isFornecedor,
      observacao: formData.observacao,
      dataCriacao: formData.dataCriacao,
      dataAtualizacao: new Date().toISOString().split('T')[0],
    };
    onSubmit(pessoa);
  };

  const handleInputChange = (field: keyof FormDataState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEnderecoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        [field]: value,
      } as any,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Pessoais */}
      <div>
        <h3 className="font-semibold mb-4">Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nomeCompleto">Nome Completo *</Label>
            <Input
              id="nomeCompleto"
              value={formData.nomeCompleto}
              onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="genero">Gênero *</Label>
            <Select
              value={formData.genero}
              onValueChange={(value) => handleInputChange('genero', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
            <Input
              id="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleInputChange('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Física">Pessoa Física</SelectItem>
                <SelectItem value="Jurídica">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(11) 98765-4321"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div>
        <h3 className="font-semibold mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="logradouro">Logradouro *</Label>
            <Input
              id="logradouro"
              value={formData.endereco.logradouro}
              onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="numero">Número *</Label>
            <Input
              id="numero"
              value={formData.endereco.numero}
              onChange={(e) => handleEnderecoChange('numero', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              value={formData.endereco.complemento}
              onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bairro">Bairro *</Label>
            <Input
              id="bairro"
              value={formData.endereco.bairro}
              onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="cidade">Cidade *</Label>
            <Input
              id="cidade"
              value={formData.endereco.cidade}
              onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="uf">UF *</Label>
            <Input
              id="uf"
              maxLength={2}
              value={formData.endereco.uf}
              onChange={(e) => handleEnderecoChange('uf', e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <Label htmlFor="cep">CEP *</Label>
            <Input
              id="cep"
              value={formData.endereco.cep}
              onChange={(e) => handleEnderecoChange('cep', e.target.value)}
              placeholder="01310-100"
              required
            />
          </div>
          <div>
            <Label htmlFor="pais">País *</Label>
            <Input
              id="pais"
              value={formData.endereco.pais}
              onChange={(e) => handleEnderecoChange('pais', e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div>
        <h3 className="font-semibold mb-4">Configurações</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="isFornecedor"
              checked={formData.isFornecedor}
              onCheckedChange={(checked) => handleInputChange('isFornecedor', checked)}
            />
            <Label htmlFor="isFornecedor" className="cursor-pointer">
              Marcar como fornecedor
            </Label>
          </div>
          <div>
            <Label htmlFor="observacao">Observação</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => handleInputChange('observacao', e.target.value)}
              placeholder="Observações adicionais..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar Pessoa</Button>
      </div>
    </form>
  );
}
