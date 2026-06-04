import { useState } from 'react';
import { toast } from 'sonner';

import {
  produtosApi,
  type ProdutoApi,
} from '@/api';

import Breadcrumbs from '@/components/Breadcrumbs';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface EditarProdutoFormProps {
  id: string;
  produto: ProdutoApi;
  onNavigate: (path: string) => void;
  onSave: (
    produto: ProdutoApi,
  ) => Promise<void>;
  onCancel: () => void;
}

export default function EditarProdutoForm({
  id,
  produto,
  onNavigate,
  onSave,
  onCancel,
}: EditarProdutoFormProps) {
  const [formData, setFormData] =
    useState<ProdutoApi>(produto);

  const [loading, setLoading] =
    useState(false);

  const handleInputChange = <
    K extends keyof ProdutoApi,
  >(
    field: K,
    value: ProdutoApi[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await onSave(formData);

      toast.success(
        'Produto atualizado com sucesso!',
      );
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Erro ao atualizar produto';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      await produtosApi.remove(id);

      toast.success(
        'Produto excluído com sucesso!',
      );

      onNavigate('/produtos');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Erro ao excluir produto';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Dashboard' },
          { label: 'Produtos' },
          { label: 'Editar' },
        ]}
      />

      <div>
        <h1>Editar Produto</h1>

        <p className="text-muted-foreground mt-1">
          ID: {formData.id}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            Dados do Produto
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nome">
                Nome *
              </Label>

              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  handleInputChange(
                    'nome',
                    e.target.value,
                  )
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
                    Number(
                      e.target.value,
                    ),
                  )
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="preco">
                Preço Unitário *
              </Label>

              <Input
                id="preco"
                type="number"
                step="0.01"
                value={
                  formData.precoUnitario
                }
                onChange={(e) =>
                  handleInputChange(
                    'precoUnitario',
                    Number(
                      e.target.value,
                    ),
                  )
                }
                required
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={loading}
              >
                Excluir Produto
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Excluir produto?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  Essa ação não poderá ser
                  desfeita. O produto{' '}
                  {formData.nome} será
                  removido permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>
                  Cancelar
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDelete}
                >
                  Confirmar exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            type="submit"
            disabled={loading}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}