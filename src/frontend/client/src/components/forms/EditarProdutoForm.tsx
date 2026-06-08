import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  categoriasApi,
  fornecedoresApi,
  marcasApi,
  produtosApi,
  type CategoriaApi,
  type FornecedorApi,
  type MarcaApi,
  type ProdutoApi,
  type ProdutoPayload,
} from "@/api";
import Breadcrumbs from "@/components/Breadcrumbs";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PERMISSIONS } from "@/constants/permissions";
import { useAuth } from "@/contexts/AuthContext";

interface EditarProdutoFormProps {
  id: string;
  produto: ProdutoApi;
  onNavigate: (path: string) => void;
  onSave: (produto: ProdutoPayload) => Promise<void>;
  onCancel: () => void;
}

function toProdutoPayload(produto: ProdutoApi): ProdutoPayload {
  return {
    titulo: produto.titulo,
    descricao: produto.descricao || "",
    codigoSku: produto.codigoSku || "",
    idMarca: produto.idMarca || 0,
    idCategoria: produto.idCategoria || 0,
    idFornecedor: produto.idFornecedor || 0,
    tipoItem: produto.tipoItem,
    preco: Number(produto.preco),
    estoqueAtual: Number(produto.estoqueAtual),
    estoqueMinimo: produto.estoqueMinimo,
  };
}

export default function EditarProdutoForm({
  id,
  produto,
  onNavigate,
  onSave,
  onCancel,
}: EditarProdutoFormProps) {
  const { hasPermission } = useAuth();
  const [formData, setFormData] = useState<ProdutoPayload>(() =>
    toProdutoPayload(produto),
  );
  const [marcas, setMarcas] = useState<MarcaApi[]>([]);
  const [categorias, setCategorias] = useState<CategoriaApi[]>([]);
  const [fornecedores, setFornecedores] = useState<FornecedorApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const canDelete = hasPermission(PERMISSIONS.PRODUTOS.DELETE);

  useEffect(() => {
    setFormData(toProdutoPayload(produto));
  }, [produto]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [marcasResponse, categoriasResponse, fornecedoresResponse] =
          await Promise.all([
            marcasApi.getAll(),
            categoriasApi.getAll(),
            fornecedoresApi.getAll(),
          ]);

        setMarcas(marcasResponse);
        setCategorias(categoriasResponse);
        setFornecedores(fornecedoresResponse);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            "Erro ao carregar marcas, categorias e fornecedores",
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleInputChange = <K extends keyof ProdutoPayload>(
    field: K,
    value: ProdutoPayload[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      await onSave(formData);
      toast.success("Produto atualizado com sucesso!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erro ao atualizar produto",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      return;
    }

    try {
      setLoading(true);
      await produtosApi.remove(id);
      toast.success("Produto excluído com sucesso!");
      onNavigate("/produtos");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erro ao excluir produto",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard" },
          { label: "Produtos" },
          { label: "Editar" },
        ]}
      />

      <div>
        <h1>Editar Produto</h1>
        <p className="text-muted-foreground mt-1">ID: {produto.id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Dados do Produto</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(event) =>
                  handleInputChange("titulo", event.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="codigoSku">Código / SKU</Label>
              <Input
                id="codigoSku"
                value={formData.codigoSku}
                onChange={(event) =>
                  handleInputChange("codigoSku", event.target.value)
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao || ""}
                onChange={(event) =>
                  handleInputChange("descricao", event.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="idMarca">Marca</Label>
              <Select
                value={formData.idMarca ? String(formData.idMarca) : ""}
                onValueChange={(value) =>
                  handleInputChange("idMarca", Number(value))
                }
                disabled={loadingOptions}
              >
                <SelectTrigger id="idMarca" className="w-full">
                  <SelectValue placeholder="Selecione uma marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas.map((marca) => (
                    <SelectItem key={marca.id} value={String(marca.id)}>
                      {marca.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="idCategoria">Categoria</Label>
              <Select
                value={
                  formData.idCategoria ? String(formData.idCategoria) : ""
                }
                onValueChange={(value) =>
                  handleInputChange("idCategoria", Number(value))
                }
                disabled={loadingOptions}
              >
                <SelectTrigger id="idCategoria" className="w-full">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem
                      key={categoria.id}
                      value={String(categoria.id)}
                    >
                      {categoria.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="idFornecedor">Fornecedor</Label>
              <Select
                value={
                  formData.idFornecedor ? String(formData.idFornecedor) : ""
                }
                onValueChange={(value) =>
                  handleInputChange("idFornecedor", Number(value))
                }
                disabled={loadingOptions}
              >
                <SelectTrigger id="idFornecedor" className="w-full">
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {fornecedores.map((fornecedor) => (
                    <SelectItem
                      key={fornecedor.id}
                      value={String(fornecedor.id)}
                    >
                      {fornecedor.nomeCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipoItem">Tipo do Item</Label>
              <Select
                value={formData.tipoItem}
                onValueChange={(value) =>
                  handleInputChange("tipoItem", value)
                }
              >
                <SelectTrigger id="tipoItem" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Produto">Produto</SelectItem>
                  <SelectItem value="Serviço">Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                type="number"
                min="0"
                step="0.01"
                value={formData.preco}
                onChange={(event) =>
                  handleInputChange("preco", Number(event.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="estoqueAtual">Estoque Atual</Label>
              <Input
                id="estoqueAtual"
                type="number"
                min="0"
                step="1"
                value={formData.estoqueAtual}
                onChange={(event) =>
                  handleInputChange(
                    "estoqueAtual",
                    Number(event.target.value),
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                min="0"
                step="1"
                value={formData.estoqueMinimo ?? ""}
                onChange={(event) =>
                  handleInputChange(
                    "estoqueMinimo",
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
                placeholder="Não definido"
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

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={loading}>
                  Excluir Produto
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não poderá ser desfeita. O produto{" "}
                    {formData.titulo} será removido permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Confirmar exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

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
