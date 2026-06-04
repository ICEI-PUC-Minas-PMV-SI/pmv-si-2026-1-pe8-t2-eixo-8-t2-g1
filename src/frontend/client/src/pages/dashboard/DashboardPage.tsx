import { useEffect, useState, lazy } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/Breadcrumbs';
import { toast } from 'sonner';
import { relatoriosApi, type RelatoriosApi } from '@/api';
import { formatCurrency } from '@/lib/utils';


const COLORS = ['#3B82F6', '#F59E0B', '#7e7e7e', '#10B981', '#EF4444'];

const relatorioVazio: RelatoriosApi = {
  osStatus: [],
  topClientes: [],
  produtosEstoque: [],
  faturamento: [],
  top5Produtos: [],
  resumo: {
    totalClientes: 0,
    totalVeiculos: 0,
    clientesEsteMes: 0,
    osConcluidas: 0,
    osTotais: 0,
    produtosEmEstoque: 0,
    valorConcluidas: 0,
    faturamentoMesAtual: 0,
    mesAtual: '',
    ticketMedio: 0,
  },
};

export default function Dashboard() {
    const [relatorioData, setRelatorioData] = useState<RelatoriosApi>(relatorioVazio);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const dashboardData = {
      stats: [
        { label: 'Total de Pessoas', value: relatorioData.resumo.totalClientes, color: 'bg-blue-100 text-blue-800' },
        { label: 'Total de Veículos', value: relatorioData.resumo.totalVeiculos, color: 'bg-green-100 text-green-800' },
        { label: 'Ordens de Serviço', value: relatorioData.resumo.osTotais, color: 'bg-yellow-100 text-yellow-800' },
        { label: 'Produtos em Estoque', value: relatorioData.resumo.produtosEmEstoque, color: 'bg-purple-100 text-purple-800' },
      ],
      osStatus:
        relatorioData.osStatus.map((s: any) => (
          { name: s.status, value: s.quantidade }
         )),
      monthlyRevenue: 
        relatorioData.faturamento.map((f: any) => (
          { month: f.mes,   valor: f.valor }
        )),
      topProducts: 
        relatorioData.top5Produtos.map((p: any) => (
          { name: p.produto, vendas: p.quantidadeUtilizada }
        )),
    };

   useEffect(() => {
    const loadRelatorios = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const data = await relatoriosApi.getResumo();

        setRelatorioData(data);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao carregar relatórios';

        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadRelatorios();
  }, []);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />

      {/* Page Title */}
      <div>
        <h1>Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo ao painel administrativo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardData.stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <span className="text-lg">📊</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3>Receita Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
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
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* OS Status Chart */}
        <Card className="p-6">
          <h3>Status das Ordens de Serviço</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.osStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dashboardData.osStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="p-6">
        <h3>Produtos Mais Vendidos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.topProducts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} />
            <Bar dataKey="vendas" fill="#1E40AF" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
