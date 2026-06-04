import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  produtosApi,
  type ProdutoApi,
} from '@/api';

import EditarProdutoForm from '@/components/forms/EditarProdutoForm';

interface EditarProdutoProps {
  id: string;
  onNavigate: (path: string) => void;
}

export default function EditarProdutoPage({
  id,
  onNavigate,
}: EditarProdutoProps) {
  const [produto, setProduto] =
    useState<ProdutoApi | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadProduto = async () => {
      try {
        setLoading(true);

        const produtoResponse =
          await produtosApi.getById(id);

        setProduto(produtoResponse);
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          'Erro ao carregar produto';

        toast.error(message);

        onNavigate('/produtos');
      } finally {
        setLoading(false);
      }
    };

    loadProduto();
  }, [id, onNavigate]);

  if (loading) {
    return <div>Carregando produto...</div>;
  }

  if (!produto) {
    return null;
  }

  return (
    <EditarProdutoForm
      key={produto.id}
      id={id}
      produto={produto}
      onNavigate={onNavigate}
      onSave={async (
        produtoAtualizado: ProdutoApi,
      ) => {
        await produtosApi.update(
          produtoAtualizado.id,
          produtoAtualizado,
        );

        onNavigate('/produtos');
      }}
      onCancel={() =>
        onNavigate('/produtos')
      }
    />
  );
}
