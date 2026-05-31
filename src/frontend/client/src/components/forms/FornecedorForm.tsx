import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FornecedorApi, FornecedorPayload } from '@/api';

interface FornecedorFormProps {
  onSubmit: (fornecedor: FornecedorPayload) => void;
  onCancel: () => void;
  initialData?: FornecedorApi;
}

interface FormDataState {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  observacao: string;
}

export default function FornecedorForm({
  onSubmit,
  onCancel,
  initialData,
}: FornecedorFormProps) {
  const [formData, setFormData] = useState<FormDataState>(() => ({
    nome: initialData?.nome || '',
    cnpj: initialData?.cnpj || '',
    telefone: initialData?.telefone || '',
    email: initialData?.email || '',
    observacao: initialData?.observacao || '',
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      nome: formData.nome,
      cnpj: formData.cnpj,
      telefone: formData.telefone,
      email: formData.email,
      observacao: formData.observacao || undefined,
    });
  };

  const handleInputChange = (
    field: keyof FormDataState,
    value: FormDataState[keyof FormDataState],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">
          Informações do Fornecedor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                handleInputChange('nome', e.target.value)
              }
              placeholder="Nome do fornecedor"
              required
            />
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) =>
                handleInputChange('cnpj', e.target.value)
              }
              placeholder="00.000.000/0000-00"
              required
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) =>
                handleInputChange('telefone', e.target.value)
              }
              placeholder="(31) 99999-9999"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                handleInputChange('email', e.target.value)
              }
              placeholder="fornecedor@email.com"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="observacao">Observação</Label>
            <Input
              id="observacao"
              value={formData.observacao}
              onChange={(e) =>
                handleInputChange('observacao', e.target.value)
              }
              placeholder="Informações adicionais"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button type="submit">
          Salvar Fornecedor
        </Button>
      </div>
    </form>
  );
}