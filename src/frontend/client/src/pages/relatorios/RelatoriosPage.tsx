import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import Breadcrumbs from '@/components/Breadcrumbs';
import { relatoriosApi, type RelatoriosApi } from '@/api';
import { formatCurrency } from '@/lib/utils';

const relatorioVazio: RelatoriosApi = {
  osStatus: [],
  topClientes: [],
  produtosEstoque: [],
  saidaMediaDiaria: [],
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

function formatQuantidade(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(value);
}

const estoqueStatusColors = {
  Crítico: 'bg-red-100 text-red-800',
  Atenção: 'bg-yellow-100 text-yellow-800',
  Ok: 'bg-green-100 text-green-800',
  'Sem mínimo definido': 'bg-gray-100 text-gray-700',
} as const;

export default function Relatorios() {
  const [relatorioData, setRelatorioData] = useState<RelatoriosApi>(relatorioVazio);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  console.log(relatorioData["saidaMediaDiaria"])

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Relatórios' }]} />

      <div>
        <h1>Relatórios</h1>
        <p className="text-muted-foreground mt-1">Análises e insights do negócio</p>
      </div>
      <Card className="p-6">
        <h3>Status das Ordens de Serviço</h3>

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
              tickFormatter={(value) => formatCurrency(Number(value))}
              domain={[0, (dataMax: number) => dataMax * 1.15]}
            />

            <YAxis
              yAxisId="quantidade"
              orientation="right"
              stroke="#3B82F6"
              width={45}
              tickFormatter={(value) => formatQuantidade(Number(value))}
              domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
              allowDecimals={false}
            />

            <Tooltip
              formatter={(value, name) =>
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
              name="Valor (R$)"
              maxBarSize={90}
            />

            <Bar
              yAxisId="quantidade"
              dataKey="quantidade"
              fill="#3B82F6"
              name="Quantidade"
              maxBarSize={90}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3>Top 5 Clientes por Gasto</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={relatorioData.topClientes} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" stroke="#6B7280" />
            <YAxis dataKey="nome" type="category" stroke="#6B7280" width={140} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
            />
            <Bar barSize={33} dataKey="totalGasto" fill="#1E40AF" name="Total gasto" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3>Faturamento Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={relatorioData.faturamento}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="mes" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
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
              {relatorioData.produtosEstoque.map((produto, index) => (
                  <tr key={produto.produto} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                    <td className="px-4 py-2">{produto.produto}</td>
                    <td className="px-4 py-2">{formatQuantidade(produto.estoque)}</td>
                    <td className="px-4 py-2">
                      {produto.minimo === null
                        ? 'Não definido'
                        : formatQuantidade(produto.minimo)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${estoqueStatusColors[produto.status]}`}>
                        {produto.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    
      <Card className="p-6">
        <h3>Saída Média Diária</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Produtos com maior saída média nos últimos 30 dias corridos
        </p>

        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Produto</th>
                <th className="px-4 py-2 text-left font-semibold">Média Diária</th>
                <th className="px-4 py-2 text-left font-semibold">Saída no Período</th>
                <th className="px-4 py-2 text-left font-semibold">Estoque Atual</th>
                <th className="px-4 py-2 text-left font-semibold">Dias de Estoque</th>
                <th className="px-4 py-2 text-left font-semibold">Estoque Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {relatorioData.saidaMediaDiaria.sort((a: any, b: any) => a.diasDeEstoque - b.diasDeEstoque).map((produto, index) => (
                <tr
                  key={produto.idProduto}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}
                >
                  <td className="px-4 py-2">{produto.produto}</td>
                  <td className="px-4 py-2 font-medium">
                    {formatQuantidade(produto.mediaDiaria)} un/dia
                  </td>
                  <td className="px-4 py-2">
                    {formatQuantidade(produto.quantidadeTotal)} unidades em{' '}
                    {produto.periodo.dias} dias
                  </td>
                  <td className="px-4 py-2">
                    {formatQuantidade(produto.estoqueAtual)}
                  </td>
                  <td className="px-4 py-2">
                    {formatQuantidade(produto.diasDeEstoque)}
                  </td>
                  <td className="px-4 py-2">
                    {produto.estoqueMinimo === null
                      ? 'Não definido'
                      : formatQuantidade(produto.estoqueMinimo)}
                  </td>
                </tr>
              ))}
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
