import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  categoriasApi,
  fornecedoresApi,
  marcasApi,
  type CategoriaApi,
  type FornecedorApi,
  type MarcaApi,
  type ProdutoPayload,
} from "@/api";
import { Button } from "@/components/ui/button";
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

interface ProdutoFormProps {
  onSubmit: (produto: ProdutoPayload) => void;
  onCancel: () => void;
}

const initialFormData: ProdutoPayload = {
  titulo: "",
  descricao: "",
  codigoSku: "",
  idMarca: 0,
  idCategoria: 0,
  idFornecedor: 0,
  tipoItem: "Produto",
  preco: 0,
  estoqueAtual: 0,
  estoqueMinimo: null,
};

export default function ProdutoForm({
  onSubmit,
  onCancel,
}: ProdutoFormProps) {
  const [formData, setFormData] =
    useState<ProdutoPayload>(initialFormData);
  const [marcas, setMarcas] = useState<MarcaApi[]>([]);
  const [categorias, setCategorias] = useState<CategoriaApi[]>([]);
  const [fornecedores, setFornecedores] = useState<FornecedorApi[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Informações Básicas</h3>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(event) =>
                handleInputChange("titulo", event.target.value)
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao || ""}
              onChange={(event) =>
                handleInputChange("descricao", event.target.value)
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="codigoSku">Código / SKU *</Label>
              <Input
                id="codigoSku"
                value={formData.codigoSku}
                onChange={(event) =>
                  handleInputChange("codigoSku", event.target.value)
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="tipoItem">Tipo do Item *</Label>
              <Select
                value={formData.tipoItem}
                onValueChange={(value) =>
                  handleInputChange("tipoItem", value)
                }
                required
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

            <div className="md:col-span-2">
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
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Preço e Estoque</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="preco">Preço (R$) *</Label>
            <Input
              id="preco"
              type="number"
              min="0"
              step="0.01"
              value={formData.preco}
              onChange={(event) =>
                handleInputChange("preco", Number(event.target.value))
              }
              required
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
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Produto
        </Button>
      </div>
    </form>
  );
}
