import { Card } from '@/components/ui/card';
import DataTable from '@/components/DataTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import { mockPessoas } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import type { Pessoa } from '@/types';

export default function Fornecedores() {
  const fornecedores = mockPessoas.filter((p) => p.isFornecedor);

  const columns = [
    {
      key: 'nomeCompleto' as const,
      label: 'Nome',
    },
    {
      key: 'email' as const,
      label: 'E-mail',
    },
    {
      key: 'telefone' as const,
      label: 'Telefone',
    },
    {
      key: 'endereco' as const,
      label: 'Cidade',
      render: (value: any) => value.cidade,
    },
    {
      key: 'dataCriacao' as const,
      label: 'Data de Cadastro',
      render: (value: string) => formatDate(value),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Fornecedores' }]} />

      {/* Header */}
      <div>
        <h1>Fornecedores</h1>
        <p className="text-muted-foreground mt-1">Listagem de fornecedores cadastrados</p>
      </div>

      {/* Table */}
      <Card className="p-6">
        <DataTable<Pessoa>
          data={fornecedores}
          columns={columns}
          searchFields={['nomeCompleto', 'email', 'telefone']}
          pageSize={10}
        />
      </Card>
    </div>
  );
}
