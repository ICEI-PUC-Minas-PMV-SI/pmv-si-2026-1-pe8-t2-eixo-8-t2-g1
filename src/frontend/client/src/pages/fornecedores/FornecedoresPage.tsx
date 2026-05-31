import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { fornecedoresApi, type FornecedorApi } from '@/api';

import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<FornecedorApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFornecedores = async () => {
      try {
        setLoading(true);

        const fornecedoresResponse =
          await fornecedoresApi.getAll();

        setFornecedores(fornecedoresResponse);
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          'Erro ao carregar fornecedores';

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadFornecedores();
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Dashboard' },
          { label: 'Fornecedores' },
        ]}
      />

      <div>
        <h1>Fornecedores</h1>

        <p className="text-muted-foreground mt-1">
          Consulta de fornecedores cadastrados
        </p>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Carregando fornecedores...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Nome
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Telefone
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    E-mail
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Observação
                  </th>
                </tr>
              </thead>

              <tbody>
                {fornecedores.map((fornecedor, index) => (
                  <tr
                    key={fornecedor.id}
                    className={
                      index % 2 === 0
                        ? 'bg-white'
                        : 'bg-secondary/20'
                    }
                  >
                    <td className="px-4 py-3">
                      {fornecedor.nomeCompleto}
                    </td>

                    <td className="px-4 py-3">
                      {fornecedor.telefone || '-'}
                    </td>

                    <td className="px-4 py-3">
                      {fornecedor.email || '-'}
                    </td>

                    <td className="px-4 py-3">
                      {fornecedor.observacao || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && fornecedores.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                Nenhum fornecedor encontrado.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
} 