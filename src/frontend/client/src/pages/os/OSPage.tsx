import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import DataTable from "@/components/DataTable";
import Breadcrumbs from "@/components/Breadcrumbs";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import OSForm from "@/components/forms/OSForm";
import {
  servicosApi,
  veiculosApi,
  type ServicoApi,
  type ServicoPayload,
  type VeiculoApi,
} from "@/api";
import { PERMISSIONS } from "@/constants/permissions";
import { useAuth } from "@/contexts/AuthContext";

interface OrdemServicoRow extends ServicoApi {
  clienteNome: string;
  veiculoDescricao: string;
  valorTotal: number;
}

function getclienteNome(servico: ServicoApi) {
  return servico.veiculo?.cliente?.nomeCompleto || "Cliente não informado";
}

function getVeiculoDescricao(servico: ServicoApi) {
  if (!servico.veiculo) {
    return "Veículo não informado";
  }

  return `${servico.veiculo.placa} - ${servico.veiculo.modelo}`;
}

function getItemSubtotal(item: NonNullable<ServicoApi["itens"]>[number]) {
  return (
    Number(item.quantidadeUtilizada) * Number(item.produto?.precoUnitario || 0)
  );
}

export default function OS() {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState<ServicoApi[]>([]);
  const [veiculos, setVeiculos] = useState<VeiculoApi[]>([]);
  const [selectedOS, setSelectedOS] = useState<OrdemServicoRow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const canCreate = hasPermission(PERMISSIONS.OS.CREATE);
  const canEdit = hasPermission(PERMISSIONS.OS.EDIT);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicosResponse, veiculosResponse] = await Promise.all([
          servicosApi.getAll(),
          veiculosApi.getAll(),
        ]);

        setOrdens(servicosResponse);
        setVeiculos(veiculosResponse);
      } catch (error: any) {
        const message =
          error.response?.data?.message || "Erro ao carregar ordens de serviço";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const ordensRows = useMemo<OrdemServicoRow[]>(
    () =>
      ordens.map(ordem => ({
        ...ordem,
        clienteNome: getclienteNome(ordem),
        veiculoDescricao: getVeiculoDescricao(ordem),
        valorTotal: Number(ordem.valorTotal || 0),
      })),
    [ordens]
  );

  const handleAddOS = async (novaOS: ServicoPayload) => {
    if (!canCreate) {
      return;
    }

    try {
      const osCriada = await servicosApi.create(novaOS);
      setOrdens(ordensAtuais => [osCriada, ...ordensAtuais]);
      setIsFormOpen(false);
      toast.success("Ordem de Serviço cadastrada com sucesso!");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao cadastrar ordem de serviço";
      toast.error(message);
    }
  };

  const handleEditOS = (os: ServicoApi) => {
    if (!canEdit) {
      return;
    }

    navigate(`/os/${os.id}/editar`);
  };

  const columns = [
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      ),
    },
    {
      key: "clienteNome" as const,
      label: "Cliente",
    },
    {
      key: "veiculoDescricao" as const,
      label: "Veículo",
    },
    {
      key: "dataInicio" as const,
      label: "Data de Entrada",
      render: (value: string) => formatDate(value),
    },
    {
      key: "descricao" as const,
      label: "Solicitação",
      render: (value: string) =>
        value.substring(0, 30) + (value.length > 30 ? "..." : ""),
    },
    {
      key: "valorTotal" as const,
      label: "Valor Total",
      render: (value: number) => formatCurrency(value),
    },
  ];

  const handleRowClick = (row: OrdemServicoRow) => {
    setSelectedOS(row);
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Carregando ordens de serviço...</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[{ label: "Dashboard" }, { label: "Ordens de Serviço" }]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1>Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de ordens de serviço
          </p>
        </div>
        {canCreate && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova OS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Ordem de Serviço</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para cadastrar uma nova ordem de
                  serviço
                </DialogDescription>
              </DialogHeader>
              <OSForm
                veiculos={veiculos}
                onSubmit={handleAddOS}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="p-6">
        <DataTable<OrdemServicoRow>
          data={ordensRows}
          columns={columns}
          searchFields={["id", "clienteNome", "veiculoDescricao", "descricao"]}
          pageSize={10}
          onRowClick={handleRowClick}
        />
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
            <DialogDescription>
              {selectedOS ? `OS #${selectedOS.id}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedOS && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Informações Gerais</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID</p>
                    <p className="font-medium">{selectedOS.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={getStatusColor(selectedOS.status)}>
                      {selectedOS.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cliente</p>
                    <p className="font-medium">{selectedOS.clienteNome}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Veículo</p>
                    <p className="font-medium">{selectedOS.veiculoDescricao}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data de Entrada</p>
                    <p className="font-medium">
                      {formatDate(selectedOS.dataInicio)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data de Conclusão</p>
                    <p className="font-medium">
                      {selectedOS.dataFim
                        ? formatDate(selectedOS.dataFim)
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor Total</p>
                    <p className="font-medium">
                      {formatCurrency(selectedOS.valorTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">
                  Solicitação e Diagnóstico
                </h3>
                <p className="text-sm text-foreground">
                  {selectedOS.descricao}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Itens</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">
                          Produto
                        </th>
                        <th className="px-4 py-2 text-left font-semibold">
                          Quantidade
                        </th>
                        <th className="px-4 py-2 text-left font-semibold">
                          Preço
                        </th>
                        <th className="px-4 py-2 text-left font-semibold">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOS.itens && selectedOS.itens.length > 0 ? (
                        selectedOS.itens.map((item, index) => (
                          <tr
                            key={item.id}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-secondary/20"
                            }
                          >
                            <td className="px-4 py-2">
                              {item.produto?.nome || item.idProduto}
                            </td>
                            <td className="px-4 py-2">
                              {Number(item.quantidadeUtilizada)}
                            </td>
                            <td className="px-4 py-2">
                              {formatCurrency(
                                Number(item.produto?.precoUnitario || 0)
                              )}
                            </td>
                            <td className="px-4 py-2 font-medium">
                              {formatCurrency(getItemSubtotal(item))}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-muted-foreground"
                          >
                            Nenhum item vinculado
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Fechar
                </Button>
                {canEdit && (
                  <Button onClick={() => handleEditOS(selectedOS)}>
                    Editar OS
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
