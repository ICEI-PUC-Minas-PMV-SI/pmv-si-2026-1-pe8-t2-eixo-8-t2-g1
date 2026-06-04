import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import Breadcrumbs from '@/components/Breadcrumbs';
import DataTable from '@/components/DataTable';
import ProdutoForm from '@/components/forms/ProdutoForm';

import {
  produtosApi,
  type ProdutoApi,
  type ProdutoPayload,
} from '@/api';

export default function Produtos() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<ProdutoApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const produtosResponse =
          await produtosApi.getAll();

        setProdutos(produtosResponse);
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          'Erro ao carregar produtos';

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddProduto = async (
    novoProduto: ProdutoPayload,
  ) => {
    try {
      const produtoCriado =
        await produtosApi.create(novoProduto);

      setProdutos((produtosAtuais) => [
        produtoCriado,
        ...produtosAtuais,
      ]);

      setIsDialogOpen(false);

      toast.success('Produto cadastrado com sucesso!');
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        'Erro ao cadastrar produto';

      toast.error(message);
    }
  };

  const handleEditProduto = (
    produto: ProdutoApi,
  ) => {
    navigate(`/produtos/${produto.id}/editar`);
  };

  const columns = [
    {
      key: 'nome' as const,
      label: 'Nome',
    },
    //quantidade com casas decimais
    // {
    // key: 'quantidade' as const,
    // label: 'Quantidade',
    // render: (value: string | number) =>
    //     Number(value).toFixed(2),
    // }
    //
    {
    key: 'quantidade' as const,
    label: 'Quantidade',
    render: (value: string | number) =>
        Number(value),
    },
    {
    key: 'precoUnitario' as const,
    label: 'Preço Unitário',
    render: (value: string | number) =>
        `R$ ${Number(value).toFixed(2)}`,
    },
  ];

  const handleRowClick = (
    row: ProdutoApi,
  ) => {
    handleEditProduto(row);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Dashboard' },
          { label: 'Produtos' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1>Produtos</h1>

          <p className="text-muted-foreground mt-1">
            Gerenciamento de produtos
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Cadastrar Novo Produto
              </DialogTitle>

              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo produto
              </DialogDescription>
            </DialogHeader>

            <ProdutoForm
              onSubmit={handleAddProduto}
              onCancel={() =>
                setIsDialogOpen(false)
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <DataTable<ProdutoApi>
          data={produtos}
          columns={columns}
          searchFields={['nome']}
          pageSize={10}
          onRowClick={handleRowClick}
        />
      </Card>
    </div>
  );
}