import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/Breadcrumbs';
import { relatoriosApi, type RelatoriosApi } from '@/api';
import { formatCurrency } from '@/lib/utils';

type RechartsComponent = ComponentType<any>;

const Bar = lazy(() => import('recharts').then((module) => ({ default: module.Bar as unknown as RechartsComponent })));
const BarChart = lazy(() => import('recharts').then((module) => ({ default: module.BarChart as unknown as RechartsComponent })));
const CartesianGrid = lazy(() => import('recharts').then((module) => ({ default: module.CartesianGrid as unknown as RechartsComponent })));
const Legend = lazy(() => import('recharts').then((module) => ({ default: module.Legend as unknown as RechartsComponent })));
const Line = lazy(() => import('recharts').then((module) => ({ default: module.Line as unknown as RechartsComponent })));
const LineChart = lazy(() => import('recharts').then((module) => ({ default: module.LineChart as unknown as RechartsComponent })));
const ResponsiveContainer = lazy(() => import('recharts').then((module) => ({ default: module.ResponsiveContainer as unknown as RechartsComponent })));
const Tooltip = lazy(() => import('recharts').then((module) => ({ default: module.Tooltip as unknown as RechartsComponent })));
const XAxis = lazy(() => import('recharts').then((module) => ({ default: module.XAxis as unknown as RechartsComponent })));
const YAxis = lazy(() => import('recharts').then((module) => ({ default: module.YAxis as unknown as RechartsComponent })));

function ChartFallback({ height = 300 }: { height?: number }) {
  return <div className="w-full" style={{ height }} />;
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

const QUANTITY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
});

function expandCurrencyAxis(dataMax: number) {
  return dataMax * 1.15;
}

function expandQuantityAxis(dataMax: number) {
  return Math.ceil(dataMax * 1.15);
}

function formatQuantidade(value: number) {
  return QUANTITY_FORMATTER.format(value);
}

const CURRENCY_AXIS_DOMAIN = [0, expandCurrencyAxis] as const;
const QUANTITY_AXIS_DOMAIN = [0, expandQuantityAxis] as const;

export default function Relatorios() {
  const [relatorioData, setRelatorioData] = useState<RelatoriosApi>(relatorioVazio);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadRelatorios = async () => {
      try {
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


  const { resumo } = relatorioData;

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Relatórios' }]} />
        <Card className="p-6">
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Relatórios' }]} />
        <Card className="p-6">
          <p className="font-medium">Não foi possível carregar os relatórios.</p>
          <p className="text-muted-foreground mt-1">{loadError}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Relatórios' }]} />

      <div>
        <h1>Relatórios</h1>
        <p className="text-muted-foreground mt-1">Análises e insights do negócio</p>
      </div>
      <Card className="p-6">
        <h3>Status das Ordens de Serviço</h3>

        <Suspense fallback={<ChartFallback height={340} />}>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={relatorioData.osStatus}
              margin={{
                top: 24,
                right: 40,
                left: 40,
                bottom: 16,
              }}
              barGap={8}
              barCategoryGap="28%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />

              <XAxis
                dataKey="status"
                stroke="#6B7280"
              />

              <YAxis
                yAxisId="valor"
                orientation="left"
                stroke="#10B981"
                width={100}
                tickFormatter={(value: unknown) => formatCurrency(Number(value))}
                domain={CURRENCY_AXIS_DOMAIN}
              />

              <YAxis
                yAxisId="quantidade"
                orientation="right"
                stroke="#3B82F6"
                width={45}
                tickFormatter={(value: unknown) => formatQuantidade(Number(value))}
                domain={QUANTITY_AXIS_DOMAIN}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value: unknown, name: unknown) =>
                  name === 'Valor (R$)'
                    ? formatCurrency(Number(value))
                    : formatQuantidade(Number(value))
                }
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                }}
              />

              <Legend />

              <Bar
                yAxisId="valor"
                dataKey="valor"
                fill="#10B981"
                name="Quantidade"
                maxBarSize={90}
              />

              <Bar
                yAxisId="quantidade"
                dataKey="quantidade"
                fill="#3B82F6"
                name="Valor (R$)"
                maxBarSize={90}
              />
            </BarChart>
          </ResponsiveContainer>
        </Suspense>
      </Card>

      <Card className="p-6">
        <h3>Top 5 Clientes por Gasto</h3>
        <Suspense fallback={<ChartFallback />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={relatorioData.topClientes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" />
              <YAxis dataKey="nome" type="category" stroke="#6B7280" width={140} />
              <Tooltip
                formatter={(value: unknown) => formatCurrency(Number(value))}
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
              />
              <Bar barSize={33} dataKey="totalGasto" fill="#1E40AF" name="Total gasto" />
            </BarChart>
          </ResponsiveContainer>
        </Suspense>
      </Card>

      <Card className="p-6">
        <h3>Faturamento Mensal</h3>
        <Suspense fallback={<ChartFallback />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={relatorioData.faturamento}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="mes" stroke="#6B7280" />
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
                name="Faturamento"
              />
            </LineChart>
          </ResponsiveContainer>
        </Suspense>
      </Card>

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
                const statusColor =
                  status === 'Baixo' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';

                return (
                  <tr key={produto.produto} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                    <td className="px-4 py-2">{produto.produto}</td>
                    <td className="px-4 py-2">{formatQuantidade(produto.estoque)}</td>
                    <td className="px-4 py-2">{formatQuantidade(produto.minimo)}</td>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Total de Clientes</p>
          <p className="text-3xl font-bold mt-2">{resumo.totalClientes}</p>
          <p className="text-xs text-muted-foreground mt-2">+{resumo.clientesEsteMes} este mês</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">OS Concluídas</p>
          <p className="text-3xl font-bold mt-2">{resumo.osConcluidas}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Valor: {formatCurrency(resumo.valorConcluidas)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Faturamento do Mês</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(resumo.faturamentoMesAtual)}</p>
          <p className="text-xs text-muted-foreground mt-2">{resumo.mesAtual}</p>
        </Card>
        <Card className="p-6">
          <p className="text-muted-foreground text-sm font-medium">Ticket Médio</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(resumo.ticketMedio)}</p>
          <p className="text-xs text-muted-foreground mt-2">Por ordem concluída</p>
        </Card>
      </div>
    </div>
  );
}
