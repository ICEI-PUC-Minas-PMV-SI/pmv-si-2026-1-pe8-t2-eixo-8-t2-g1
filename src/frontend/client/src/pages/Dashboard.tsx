import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/Breadcrumbs';
import { formatCurrency } from '@/lib/utils';

const dashboardData = {
  stats: [
    { label: 'Total de Pessoas', value: 24, color: 'bg-blue-100 text-blue-800' },
    { label: 'Total de Veículos', value: 18, color: 'bg-green-100 text-green-800' },
    { label: 'Ordens de Serviço', value: 42, color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Produtos em Estoque', value: 156, color: 'bg-purple-100 text-purple-800' },
  ],
  osStatus: [
    { name: 'Aberta', value: 12 },
    { name: 'Em Andamento', value: 18 },
    { name: 'Concluída', value: 10 },
    { name: 'Cancelada', value: 2 },
  ],
  monthlyRevenue: [
    { month: 'Jan', valor: 4000 },
    { month: 'Fev', valor: 3000 },
    { month: 'Mar', valor: 2000 },
    { month: 'Abr', valor: 2780 },
    { month: 'Mai', valor: 1890 },
    { month: 'Jun', valor: 2390 },
  ],
  topProducts: [
    { name: 'Filtro de Óleo', vendas: 120 },
    { name: 'Pastilha de Freio', vendas: 98 },
    { name: 'Correia de Distribuição', vendas: 87 },
    { name: 'Vela de Ignição', vendas: 76 },
    { name: 'Bateria', vendas: 65 },
  ],
};

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

export default function Dashboard() {
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
