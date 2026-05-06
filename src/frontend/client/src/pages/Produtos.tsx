import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
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
import DataTable from '@/components/DataTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import { mockProdutos } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';
import type { Produto } from '@/types';
import ProdutoForm from '@/components/forms/ProdutoForm';

export default function Produtos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddProduto = (novoProduto: Produto) => {
    setProdutos([...produtos, novoProduto]);
    setIsDialogOpen(false);
  };

  const handleEditProduto = (produto: Produto) => {
    navigate(`/produtos/${produto.id}/editar`);
  };

  const columns = [
    {
      key: 'titulo' as const,
      label: 'Título',
    },
    {
      key: 'codigoSku' as const,
      label: 'Código/SKU',
    },
    {
      key: 'marca' as const,
      label: 'Marca',
    },
    {
      key: 'categoria' as const,
      label: 'Categoria',
    },
    {
      key: 'preco' as const,
      label: 'Preço',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'estoqueAtual' as const,
      label: 'Estoque',
    },
    {
      key: 'tipoItem' as const,
      label: 'Tipo',
    },
  ];

  const handleRowClick = (row: Produto) => {
    handleEditProduto(row);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Produtos' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de produtos e peças</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo produto
              </DialogDescription>
            </DialogHeader>
            <ProdutoForm onSubmit={handleAddProduto} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="p-6">
        <DataTable<Produto>
          data={produtos}
          columns={columns}
          searchFields={['titulo', 'codigoSku', 'marca', 'categoria']}
          pageSize={10}
          onRowClick={handleRowClick}
        />
      </Card>
    </div>
  );
}
