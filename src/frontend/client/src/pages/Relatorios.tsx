import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatCurrency } from '@/lib/utils';

const relatorioData = {
  osStatus: [
    { status: 'Aberta', quantidade: 12, valor: 5000 },
    { status: 'Em Andamento', quantidade: 18, valor: 8500 },
    { status: 'Concluída', quantidade: 45, valor: 22000 },
    { status: 'Cancelada', quantidade: 2, valor: 800 },
  ],
  topClientes: [
    { nome: 'Cliente A', totalGasto: 15000 },
    { nome: 'Cliente B', totalGasto: 12000 },
    { nome: 'Cliente C', totalGasto: 9500 },
    { nome: 'Cliente D', totalGasto: 7800 },
    { nome: 'Cliente E', totalGasto: 5200 },
  ],
  produtosEstoque: [
    { produto: 'Filtro de Óleo', estoque: 150, minimo: 50 },
    { produto: 'Pastilha de Freio', estoque: 80, minimo: 40 },
    { produto: 'Correia', estoque: 30, minimo: 20 },
    { produto: 'Vela de Ignição', estoque: 200, minimo: 100 },
    { produto: 'Bateria', estoque: 45, minimo: 30 },
  ],
  receita: [
    { mes: 'Janeiro', valor: 25000 },
    { mes: 'Fevereiro', valor: 28000 },
    { mes: 'Março', valor: 32000 },
    { mes: 'Abril', valor: 29000 },
    { mes: 'Maio', valor: 35000 },
    { mes: 'Junho', valor: 38000 },
  ],
};

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

export default function Relatorios() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Relatórios' }]} />

      {/* Header */}
      <div>
        <h1>Relatórios</h1>
        <p className="text-muted-foreground mt-1">Análises e insights do negócio</p>
      </div>

      {/* Status de OS */}
      <Card className="p-6">
        <h3>Status das Ordens de Serviço</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={relatorioData.osStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="status" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} />
            <Legend />
            <Bar dataKey="quantidade" fill="#3B82F6" name="Quantidade" />
            <Bar dataKey="valor" fill="#10B981" name="Valor (R$)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Clientes */}
      <Card className="p-6">
        <h3>Top 5 Clientes por Gasto</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={relatorioData.topClientes} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" stroke="#6B7280" />
            <YAxis dataKey="nome" type="category" stroke="#6B7280" width={100} />
            <Tooltip 
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
            />
            <Bar dataKey="totalGasto" fill="#1E40AF" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Receita Mensal */}
      <Card className="p-6">
        <h3>Receita Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={relatorioData.receita}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="mes" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip 
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="valor" 
              stroke="#1E40AF" 
              strokeWidth={2}
              dot={{ fill: '#1E40AF', r: 4 }}
              activeDot={{ r: 6 }}
              name="Receita"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Estoque de Produtos */}
      <Card className="p-6">
        <h3>Nível de Estoque de Produtos</h3>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Produto</th>
                <th className="px-4 py-2 text-left font-semibold">Estoque Atual</th>
                <th className="px-4 py-2 text-left font-semibold">Estoque Mínimo</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {relatorioData.produtosEstoque.map((produto, index) => {
                const status = produto.estoque < produto.minimo ? 'Baixo' : 'Normal';
                const statusColor = status === 'Baixo' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                    <td className="px-4 py-2">{produto.produto}</td>
                    <td className="px-4 py-2">{produto.estoque}</td>
                    <td className="px-4 py-2">{produto.minimo}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resumo de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Total de Clientes</p>
          <p className="text-3xl font-bold mt-2">24</p>
          <p className="text-xs text-muted-foreground mt-2">+2 este mês</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">OS Concluídas</p>
          <p className="text-3xl font-bold mt-2">45</p>
          <p className="text-xs text-muted-foreground mt-2">Valor: R$ 22.000</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Receita Total</p>
          <p className="text-3xl font-bold mt-2">R$ 38.000</p>
          <p className="text-xs text-muted-foreground mt-2">Junho 2024</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Ticket Médio</p>
          <p className="text-3xl font-bold mt-2">R$ 844</p>
          <p className="text-xs text-muted-foreground mt-2">Por ordem</p>
        </Card>
      </div>
    </div>
  );
}
