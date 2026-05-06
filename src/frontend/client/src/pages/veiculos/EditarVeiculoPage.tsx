import { useState, useEffect } from 'react';
import EditarVeiculoForm from '@/components/forms/EditarVeiculoForm';
import { clientesApi, veiculosApi, type VeiculoApi, type ClienteApi } from '@/api';
import { toast } from 'sonner';

interface EditarVeiculoProps {
  id: string; 
  onNavigate: (path: string) => void;
}

export default function EditarVeiculoPage({ id, onNavigate }: EditarVeiculoProps) {
  const [veiculo, setVeiculo] = useState<VeiculoApi | null>(null);
  const [clientes, setClientes] = useState<ClienteApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVeiculo = async () => {
      try {
        setLoading(true);
        const [veiculoResponse, clientesResponse] = await Promise.all([
          veiculosApi.getById(id),
          clientesApi.getAll(),
        ]);
        setVeiculo(veiculoResponse);
        setClientes(clientesResponse);
      } catch (error: any) {
        const message = error.response?.data?.messsage || 'Erro ao carregar';
        toast.error(message);
        onNavigate('/veiculos');
      } finally {
        setLoading(false);
      }
    };

    loadVeiculo();
  }, [id, onNavigate]);

  if (loading) {
    return <div>Carregando veiculo...</div>;
  }

  if (!veiculo) {
    return null;
  }

  return (
    <EditarVeiculoForm
      id={id}
      clientes={clientes}
      veiculo={veiculo}
      onNavigate={onNavigate}
      onSave={async (veiculoAtualizado: VeiculoApi) => {
        await veiculosApi.update(veiculoAtualizado.id, veiculoAtualizado);
        onNavigate('/veiculos');
      }}
      onCancel={() => onNavigate('/veiculos')}
      
    />
  );
}
