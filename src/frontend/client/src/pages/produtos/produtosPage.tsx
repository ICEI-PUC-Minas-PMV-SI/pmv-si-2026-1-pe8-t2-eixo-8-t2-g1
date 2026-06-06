import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { produtosApi, type ProdutoApi, type ProdutoPayload } from "@/api";
import Breadcrumbs from "@/components/Breadcrumbs";
import DataTable from "@/components/DataTable";
import ProdutoForm from "@/components/forms/ProdutoForm";
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
import { PERMISSIONS } from "@/constants/permissions";
import { useAuth } from "@/contexts/AuthContext";

interface ProdutoRow extends ProdutoApi {
  marcaTitulo: string;
  categoriaTitulo: string;
}

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
        setProdutos(await produtosApi.getAll());
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Erro ao carregar produtos",
        );
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

      setProdutos((produtosAtuais) => [produtoCriado, ...produtosAtuais]);
      setIsDialogOpen(false);
      toast.success("Produto cadastrado com sucesso!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erro ao cadastrar produto",
      );
    }
  };

  const handleEditProduto = (produto: ProdutoApi) => {
    if (canEdit) {
      navigate(`/produtos/${produto.id}/editar`);
    }
  };

  const produtosRows: ProdutoRow[] = produtos.map((produto) => ({
    ...produto,
    marcaTitulo: produto.marca?.titulo || "Não informada",
    categoriaTitulo: produto.categoria?.titulo || "Não informada",
  }));

  const columns = [
    {
      key: "titulo" as const,
      label: "Título",
    },
    {
      key: "codigoSku" as const,
      label: "SKU",
    },
    {
      key: "marcaTitulo" as const,
      label: "Marca",
    },
    {
      key: "categoriaTitulo" as const,
      label: "Categoria",
    },
    {
      key: "preco" as const,
      label: "Preço",
      render: (value: string | number) =>
        `R$ ${Number(value).toFixed(2)}`,
    },
    {
      key: "estoqueAtual" as const,
      label: "Estoque",
    },
  ];

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
        {loading ? (
          <div>Carregando produtos...</div>
        ) : (
          <DataTable<ProdutoRow>
            data={produtosRows}
            columns={columns}
            searchFields={[
              "titulo",
              "codigoSku",
              "marcaTitulo",
              "categoriaTitulo",
            ]}
            pageSize={10}
            onRowClick={canEdit ? handleEditProduto : undefined}
          />
        )}
      </Card>
    </div>
  );
}
