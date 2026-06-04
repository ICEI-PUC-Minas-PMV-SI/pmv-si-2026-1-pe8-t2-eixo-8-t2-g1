import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProdutoPayload } from '@/api';

interface ProdutoFormProps {
  onSubmit: (produto: ProdutoPayload) => void;
  onCancel: () => void;
}

interface FormDataState {
  nome: string;
  quantidade: number;
  precoUnitario: number;
}

export default function ProdutoForm({
  onSubmit,
  onCancel,
}: ProdutoFormProps) {
  const [formData, setFormData] = useState<FormDataState>({
    nome: '',
    quantidade: 0,
    precoUnitario: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      nome: formData.nome,
      quantidade: formData.quantidade,
      precoUnitario: formData.precoUnitario,
    });
  };

  const handleInputChange = (
    field: keyof FormDataState,
    value: string | number,
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
          Informações do Produto
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) =>
                handleInputChange('nome', e.target.value)
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="quantidade">
              Quantidade *
            </Label>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              value={formData.quantidade}
              onChange={(e) =>
                handleInputChange(
                  'quantidade',
                  Number(e.target.value),
                )
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="precoUnitario">
              Preço Unitário *
            </Label>
            <Input
              id="precoUnitario"
              type="number"
              step="0.01"
              value={formData.precoUnitario}
              onChange={(e) =>
                handleInputChange(
                  'precoUnitario',
                  Number(e.target.value),
                )
              }
              required
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
          Salvar Produto
        </Button>
      </div>
    </form>
  );
}