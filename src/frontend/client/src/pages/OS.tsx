import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import DataTable from '@/components/DataTable';
import Breadcrumbs from '@/components/Breadcrumbs';
import { mockOrdensSevico } from '@/lib/mockData';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { toast } from 'sonner';
import type { OrdemServico } from '@/types';
import OSForm from '@/components/forms/OSForm';

export default function OS() {
  const navigate = useNavigate();
  const [ordens, setOrdens] = useState<OrdemServico[]>(mockOrdensSevico);
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddOS = (novaOS: OrdemServico) => {
    setOrdens([...ordens, novaOS]);
    setIsFormOpen(false);
    toast.success('Ordem de Serviço cadastrada com sucesso!');
  };

  const handleEditOS = (os: OrdemServico) => {
    // Navegar para página de edição
    navigate(`/os/${os.id}/editar`);
  };

  const columns = [
    {
      key: 'id' as const,
      label: 'ID',
    },
    {
      key: 'status' as const,
      label: 'Status',
      render: (value: string) => (
        <Badge className={getStatusColor(value)}>{value}</Badge>
      ),
    },
    {
      key: 'clienteNome' as const,
      label: 'Cliente',
    },
    {
      key: 'dataEntrada' as const,
      label: 'Data de Entrada',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'solicitacaoCliente' as const,
      label: 'Solicitação',
      render: (value: string) => value.substring(0, 30) + (value.length > 30 ? '...' : ''),
    },
    {
      key: 'valorTotal' as const,
      label: 'Valor Total',
      render: (value: number) => formatCurrency(value),
    },
  ];

  const handleRowClick = (row: OrdemServico) => {
    setSelectedOS(row);
    setIsDialogOpen(true);
  };

  const handleSaveEditedOS = (osAtualizada: OrdemServico) => {
    setOrdens(
      ordens.map((o) => (o.id === osAtualizada.id ? osAtualizada : o))
    );
    toast.success('Ordem de Serviço atualizada com sucesso!');
    // Voltar para lista de OS
    navigate('/os');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Ordens de Serviço' }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de ordens de serviço</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4" />
              Nova OS
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Ordem de Serviço</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar uma nova ordem de serviço
              </DialogDescription>
            </DialogHeader>
            <OSForm onSubmit={handleAddOS} onCancel={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="p-6">
        <DataTable<OrdemServico>
          data={ordens}
          columns={columns}
          searchFields={['id', 'clienteNome', 'solicitacaoCliente']}
          pageSize={10}
          onRowClick={handleRowClick}
        />
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
            <DialogDescription>
              {selectedOS?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedOS && (
            <div className="space-y-6">
              {/* Informações Gerais */}
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
                    <p className="font-medium">{selectedOS.veiculoPlaca}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Data de Abertura</p>
                    <p className="font-medium">{formatDate(selectedOS.dataAbertura)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Valor Total</p>
                    <p className="font-medium">{formatCurrency(selectedOS.valorTotal)}</p>
                  </div>
                </div>
              </div>

              {/* Solicitação do Cliente */}
              <div>
                <h3 className="font-semibold mb-3">Solicitação do Cliente</h3>
                <p className="text-sm text-foreground">{selectedOS.solicitacaoCliente}</p>
              </div>
              
              {/* Diagnóstico */}
              <div>
                <h3 className="font-semibold mb-3">Diagnóstico</h3>
                <p className="text-sm text-foreground">{selectedOS.diagnostico}</p>
              </div>

              {/* Itens */}
              <div>
                <h3 className="font-semibold mb-3">Itens</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Produto</th>
                        <th className="px-4 py-2 text-left font-semibold">Quantidade</th>
                        <th className="px-4 py-2 text-left font-semibold">Preço</th>
                        <th className="px-4 py-2 text-left font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOS.itens.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                          <td className="px-4 py-2">{item.produtoId}</td>
                          <td className="px-4 py-2">{item.quantidade}</td>
                          <td className="px-4 py-2">{formatCurrency(item.preco)}</td>
                          <td className="px-4 py-2 font-medium">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => selectedOS && handleEditOS(selectedOS)}>
                  Editar OS
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
