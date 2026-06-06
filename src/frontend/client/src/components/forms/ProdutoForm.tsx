import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type { ProdutoPayload } from '@/api';

interface ProdutoFormProps {
  onSubmit: (produto: ProdutoPayload) => void;
  onCancel: () => void;
}

interface FormDataState {
  id: number;

  titulo: string;
  descricao?: string;

  codigoSku: string;

  idMarca: number;
  idCategoria: number;
  idFornecedor: number;

  tipoItem: string;

  preco: number;
  estoqueAtual: number;
}

export default function ProdutoForm({
  onSubmit,
  onCancel,
}: ProdutoFormProps) {
  const [formData, setFormData] =
    useState<FormDataState>({
      titulo: '',
      descricao: '',
      codigoSku: '',

      idMarca: 0,
      idCategoria: 0,
      idFornecedor: 0,

      tipoItem: 'Produto',

      preco: 0,
      estoqueAtual: 0,
    });

  const handleSubmit = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    onSubmit(formData);
  };

  const handleInputChange = <
    K extends keyof FormDataState
  >(
    field: K,
    value: FormDataState[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h3 className="font-semibold mb-4">
          Informações Básicas
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="titulo">
              Título *
            </Label>

            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) =>
                handleInputChange(
                  'titulo',
                  e.target.value,
                )
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">
              Descrição
            </Label>

            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) =>
                handleInputChange(
                  'descricao',
                  e.target.value,
                )
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigoSku">
                Código / SKU *
              </Label>

              <Input
                id="codigoSku"
                value={formData.codigoSku}
                onChange={(e) =>
                  handleInputChange(
                    'codigoSku',
                    e.target.value,
                  )
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="idMarca">
                Marca *
              </Label>

              <Input
                id="idMarca"
                type="number"
                value={formData.idMarca}
                onChange={(e) =>
                  handleInputChange(
                    'idMarca',
                    Number(
                      e.target.value,
                    ),
                  )
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="idCategoria">
                Categoria *
              </Label>

              <Input
                id="idCategoria"
                type="number"
                value={
                  formData.idCategoria
                }
                onChange={(e) =>
                  handleInputChange(
                    'idCategoria',
                    Number(
                      e.target.value,
                    ),
                  )
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="idFornecedor">
                Fornecedor *
              </Label>

              <Input
                id="idFornecedor"
                type="number"
                value={
                  formData.idFornecedor
                }
                onChange={(e) =>
                  handleInputChange(
                    'idFornecedor',
                    Number(
                      e.target.value,
                    ),
                  )
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tipoItem">
              Tipo do Item *
            </Label>

            <Input
              id="tipoItem"
              value={formData.tipoItem}
              onChange={(e) =>
                handleInputChange(
                  'tipoItem',
                  e.target.value,
                )
              }
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">
          Preço e Estoque
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preco">
              Preço (R$) *
            </Label>

            <Input
              id="preco"
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) =>
                handleInputChange(
                  'preco',
                  Number(
                    e.target.value,
                  ),
                )
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="estoqueAtual">
              Estoque Atual *
            </Label>

            <Input
              id="estoqueAtual"
              type="number"
              value={
                formData.estoqueAtual
              }
              onChange={(e) =>
                handleInputChange(
                  'estoqueAtual',
                  Number(
                    e.target.value,
                  ),
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