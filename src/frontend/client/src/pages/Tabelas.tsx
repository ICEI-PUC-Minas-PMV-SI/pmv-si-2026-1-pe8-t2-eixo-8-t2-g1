import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Breadcrumbs from '@/components/Breadcrumbs';
import { mockMarcas, mockCategorias, mockTiposVeiculo } from '@/lib/mockData';
import { generateId } from '@/lib/utils';
import type { Marca, Categoria, TipoVeiculo } from '@/types';

export default function Tabelas() {
  const [marcas, setMarcas] = useState<Marca[]>(mockMarcas);
  const [categorias, setCategorias] = useState<Categoria[]>(mockCategorias);
  const [tiposVeiculo, setTiposVeiculo] = useState<TipoVeiculo[]>(mockTiposVeiculo);

  const [novaMarca, setNovaMarca] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [novoTipo, setNovoTipo] = useState({ nome: '', observacao: '' });

  const handleAddMarca = () => {
    if (novaMarca.trim()) {
      setMarcas([
        ...marcas,
        {
          id: generateId(),
          nome: novaMarca,
          dataCriacao: new Date().toISOString().split('T')[0],
          dataAtualizacao: new Date().toISOString().split('T')[0],
        },
      ]);
      setNovaMarca('');
    }
  };

  const handleAddCategoria = () => {
    if (novaCategoria.trim()) {
      setCategorias([
        ...categorias,
        {
          id: generateId(),
          nome: novaCategoria,
          dataCriacao: new Date().toISOString().split('T')[0],
          dataAtualizacao: new Date().toISOString().split('T')[0],
        },
      ]);
      setNovaCategoria('');
    }
  };

  const handleAddTipo = () => {
    if (novoTipo.nome.trim()) {
      setTiposVeiculo([
        ...tiposVeiculo,
        {
          id: generateId(),
          nome: novoTipo.nome,
          observacao: novoTipo.observacao,
          dataCriacao: new Date().toISOString().split('T')[0],
          dataAtualizacao: new Date().toISOString().split('T')[0],
        },
      ]);
      setNovoTipo({ nome: '', observacao: '' });
    }
  };

  const handleDeleteMarca = (id: string) => {
    setMarcas(marcas.filter((m) => m.id !== id));
  };

  const handleDeleteCategoria = (id: string) => {
    setCategorias(categorias.filter((c) => c.id !== id));
  };

  const handleDeleteTipo = (id: string) => {
    setTiposVeiculo(tiposVeiculo.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Tabelas' }]} />

      {/* Header */}
      <div>
        <h1>Tabelas Auxiliares</h1>
        <p className="text-muted-foreground mt-1">Gerenciamento de marcas, categorias e tipos de veículos</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="marcas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marcas">Marcas</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="tipos">Tipos de Veículos</TabsTrigger>
        </TabsList>

        {/* Marcas Tab */}
        <TabsContent value="marcas" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Adicionar Nova Marca</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da marca"
                value={novaMarca}
                onChange={(e) => setNovaMarca(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMarca()}
              />
              <Button onClick={handleAddMarca} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Marcas Cadastradas</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Nome</th>
                    <th className="px-4 py-2 text-left font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {marcas.map((marca, index) => (
                    <tr key={marca.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                      <td className="px-4 py-2">{marca.nome}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMarca(marca.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Categorias Tab */}
        <TabsContent value="categorias" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Adicionar Nova Categoria</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Nome da categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategoria()}
              />
              <Button onClick={handleAddCategoria} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Categorias Cadastradas</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Nome</th>
                    <th className="px-4 py-2 text-left font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((categoria, index) => (
                    <tr key={categoria.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                      <td className="px-4 py-2">{categoria.nome}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategoria(categoria.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tipos de Veículos Tab */}
        <TabsContent value="tipos" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Adicionar Novo Tipo de Veículo</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="tipoNome">Nome *</Label>
                <Input
                  id="tipoNome"
                  placeholder="Ex: Sedan"
                  value={novoTipo.nome}
                  onChange={(e) => setNovoTipo({ ...novoTipo, nome: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tipoObservacao">Observação</Label>
                <Textarea
                  id="tipoObservacao"
                  placeholder="Observações adicionais"
                  value={novoTipo.observacao}
                  onChange={(e) => setNovoTipo({ ...novoTipo, observacao: e.target.value })}
                  rows={2}
                />
              </div>
              <Button onClick={handleAddTipo} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Tipos de Veículos Cadastrados</h3>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Nome</th>
                    <th className="px-4 py-2 text-left font-semibold">Observação</th>
                    <th className="px-4 py-2 text-left font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tiposVeiculo.map((tipo, index) => (
                    <tr key={tipo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                      <td className="px-4 py-2">{tipo.nome}</td>
                      <td className="px-4 py-2 text-muted-foreground">{tipo.observacao}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTipo(tipo.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
