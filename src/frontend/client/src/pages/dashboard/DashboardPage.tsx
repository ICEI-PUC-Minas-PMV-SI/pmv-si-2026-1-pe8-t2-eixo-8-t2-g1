import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/Breadcrumbs';
import { toast } from 'sonner';
import { relatoriosApi, type RelatoriosApi } from '@/api';
import { formatCurrency } from '@/lib/utils';


const COLORS = ['#3B82F6', '#F59E0B', '#7e7e7e', '#10B981', '#EF4444'];
const TOP_PRODUCTS_BAR_RADIUS = [8, 8, 0, 0] as const;
type RechartsComponent = ComponentType<any>;

const Bar = lazy(() => import('recharts').then((module) => ({ default: module.Bar as unknown as RechartsComponent })));
const BarChart = lazy(() => import('recharts').then((module) => ({ default: module.BarChart as unknown as RechartsComponent })));
const CartesianGrid = lazy(() => import('recharts').then((module) => ({ default: module.CartesianGrid as unknown as RechartsComponent })));
const Cell = lazy(() => import('recharts').then((module) => ({ default: module.Cell as unknown as RechartsComponent })));
const Legend = lazy(() => import('recharts').then((module) => ({ default: module.Legend as unknown as RechartsComponent })));
const Line = lazy(() => import('recharts').then((module) => ({ default: module.Line as unknown as RechartsComponent })));
const LineChart = lazy(() => import('recharts').then((module) => ({ default: module.LineChart as unknown as RechartsComponent })));
const Pie = lazy(() => import('recharts').then((module) => ({ default: module.Pie as unknown as RechartsComponent })));
const PieChart = lazy(() => import('recharts').then((module) => ({ default: module.PieChart as unknown as RechartsComponent })));
const ResponsiveContainer = lazy(() => import('recharts').then((module) => ({ default: module.ResponsiveContainer as unknown as RechartsComponent })));
const Tooltip = lazy(() => import('recharts').then((module) => ({ default: module.Tooltip as unknown as RechartsComponent })));
const XAxis = lazy(() => import('recharts').then((module) => ({ default: module.XAxis as unknown as RechartsComponent })));
const YAxis = lazy(() => import('recharts').then((module) => ({ default: module.YAxis as unknown as RechartsComponent })));

function ChartFallback({ height = 300 }: { height?: number }) {
  return <div className="w-full" style={{ height }} />;
}

function renderStatusLabel({ name, value }: { name: string; value: number }) {
  return `${name}: ${value}`;
}

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
        const data = await relatoriosApi.getResumo();

        setRelatorioData(data);
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao carregar relatórios';

        toast.error(message);
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
        {dashboardData.stats.map((stat) => (
          <Card key={stat.label} className="p-6">
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
          <Suspense fallback={<ChartFallback />}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  formatter={(value: unknown) => formatCurrency(Number(value))}
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
          </Suspense>
        </Card>

        {/* OS Status Chart */}
        <Card className="p-6">
          <h3>Status das Ordens de Serviço</h3>
          <Suspense fallback={<ChartFallback />}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.osStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderStatusLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.osStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Suspense>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="p-6">
        <h3>Produtos Mais Vendidos</h3>
        <Suspense fallback={<ChartFallback />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }} />
              <Bar dataKey="vendas" fill="#1E40AF" radius={TOP_PRODUCTS_BAR_RADIUS} />
            </BarChart>
          </ResponsiveContainer>
        </Suspense>
      </Card>
    </div>
  );
}
