import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Breadcrumbs from "@/components/Breadcrumbs";
import DataTable from "@/components/DataTable";
import ProdutoForm from "@/components/forms/ProdutoForm";

import { produtosApi, type ProdutoApi, type ProdutoPayload } from "@/api";
import { PERMISSIONS } from "@/constants/permissions";
import { useAuth } from "@/contexts/AuthContext";

export default function Produtos() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState<ProdutoApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const canCreate = hasPermission(PERMISSIONS.PRODUTOS.CREATE);
  const canEdit = hasPermission(PERMISSIONS.PRODUTOS.EDIT);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const produtosResponse = await produtosApi.getAll();

        setProdutos(produtosResponse);
      } catch (error: any) {
        const message =
          error.response?.data?.message || "Erro ao carregar produtos";

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddProduto = async (novoProduto: ProdutoPayload) => {
    if (!canCreate) {
      return;
    }

    try {
      const produtoCriado = await produtosApi.create(novoProduto);

      setProdutos(produtosAtuais => [produtoCriado, ...produtosAtuais]);

      setIsDialogOpen(false);

      toast.success("Produto cadastrado com sucesso!");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao cadastrar produto";

      toast.error(message);
    }
  };

  const handleEditProduto = (produto: ProdutoApi) => {
    if (!canEdit) {
      return;
    }

    navigate(`/produtos/${produto.id}/editar`);
  };

  const columns = [
    {
      key: 'titulo',
      label: 'Título',
    },
    {
      key: 'codigoSku',
      label: 'SKU',
    },
    {
      key: 'preco',
      label: 'Preço',
      render: (value: string | number) =>
        `R$ ${Number(value).toFixed(2)}`,
    },
    {
      key: 'estoqueAtual',
      label: 'Estoque',
    },
  ];

  const handleRowClick = (row: ProdutoApi) => {
    handleEditProduto(row);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Dashboard" }, { label: "Produtos" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1>Produtos</h1>

          <p className="text-muted-foreground mt-1">
            Gerenciamento de produtos
          </p>
        </div>

        {canCreate && (
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

              <ProdutoForm
                onSubmit={handleAddProduto}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="p-6">
        <DataTable<ProdutoApi>
          data={produtos}
          columns={columns}
          searchFields={['titulo', 'codigoSku']}
          pageSize={10}
          onRowClick={canEdit ? handleRowClick : undefined}
        />
      </Card>
    </div>
  );
}
