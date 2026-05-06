import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import DataTable from '@/components/DataTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import VeiculoForm from '@/components/forms/VeiculoForm';
import { VeiculoApi, ClienteApi, veiculosApi, clientesApi } from '@/api';

export default function Veiculos() {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState<VeiculoApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientes, setClientes] = useState<ClienteApi[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [clientesResponse, veiculosResponse] = await Promise.all([
          clientesApi.getAll(),
          veiculosApi.getAll(),
        ]);
        setClientes(clientesResponse);
        setVeiculos(veiculosResponse);
      } catch (error: any) {
        const message = error.response?.data?.messsage || 'Erro ao carregar';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddVeiculo = async (novoVeiculo: VeiculoApi) => {
    try {

      const veiculoCriado = await veiculosApi.create({
        id_cliente: novoVeiculo.id_cliente,
        placa: novoVeiculo.placa,
        modelo: novoVeiculo.modelo,
        ano: novoVeiculo.ano,
        cor: novoVeiculo.cor,
        quilometragem: novoVeiculo.quilometragem,
        tipoVeiculo: novoVeiculo.tipoVeiculo,
        motorizacao: novoVeiculo.motorizacao,
        numeroChasse: novoVeiculo.numeroChasse,
        tipoCombustivel: novoVeiculo.tipoCombustivel,
        dataUltimaRevisao: novoVeiculo.dataUltimaRevisao,
      });

      setVeiculos((prevVeiculos) => [...prevVeiculos, veiculoCriado]);

      setIsDialogOpen(false);
      toast.success('Veículo cadastrado com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao cadastrar usuário';
      toast.error(message)
    }
  };

  const handleEditVeiculo = (veiculo: VeiculoApi) => {
    navigate(`/veiculos/${veiculo.id}/editar`);
  };

  const columns = [
    {
      key: 'placa' as const,
      label: 'Placa',
    },
    {
      key: 'modelo' as const,
      label: 'Modelo',
    },
    {
      key: 'ano' as const,
      label: 'Ano',
    },
    {
      key: 'cor' as const,
      label: 'Cor',
    },
    {
      key: 'quilometragem' as const,
      label: 'Quilometragem',
      render: (value: number) => `${value.toLocaleString('pt-BR')} km`,
    },
    {
      key: 'id_cliente' as const,
      label: 'Cliente',
    },
  ];

  const handleRowClick = (row: VeiculoApi) => {
    handleEditVeiculo(row);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        carregando
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Veículos' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Veículos</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de veículos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Cadastrar Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Veículo</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo veículo
              </DialogDescription>
            </DialogHeader>
            <VeiculoForm clientes={clientes} onSubmit={handleAddVeiculo} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="p-6">
        <DataTable<VeiculoApi>
          data={veiculos}
          columns={columns}
          searchFields={['placa', 'modelo', 'cor']}
          pageSize={10}
          onRowClick={handleRowClick}
        />
      </Card>
    </div>
  );
}
