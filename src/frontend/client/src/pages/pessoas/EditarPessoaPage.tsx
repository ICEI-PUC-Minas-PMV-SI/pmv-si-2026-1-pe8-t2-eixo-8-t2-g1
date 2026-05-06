import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { clientesApi, type ClienteApi } from '@/api';
import EditarPessoaForm from '@/components/forms/EditarPessoaForm';

interface EditarPessoaProps {
  id: string;
  onNavigate: (path: string) => void;
}

export default function EditarPessoaPage({ id, onNavigate }: EditarPessoaProps) {
  const [cliente, setCliente] = useState<ClienteApi | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCliente = async () => {
      try {
        setLoading(true);
        const clienteResponse = await clientesApi.getById(id);
        setCliente(clienteResponse);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao carregar pessoa';
        toast.error(message);
        onNavigate('/pessoas');
      } finally {
        setLoading(false);
      }
    };

    loadCliente();
  }, [id, onNavigate]);

  if (loading) {
    return <div>Carregando pessoa...</div>;
  }

  if (!cliente) {
    return null;
  }

  return (
    <EditarPessoaForm
      id={id}
      cliente={cliente}
      onNavigate={onNavigate}
      onSave={async (clienteAtualizado: ClienteApi) => {
        await clientesApi.update(clienteAtualizado.id, clienteAtualizado);
        onNavigate('/pessoas');
      }}
      onCancel={() => onNavigate('/pessoas')}
    />
  );
}
