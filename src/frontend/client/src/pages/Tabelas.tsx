import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Breadcrumbs from '@/components/Breadcrumbs';
import { toast } from 'sonner';
import { marcasApi, categoriasApi, tiposVeiculoApi } from '@/api';
import type { Marca, Categoria, TipoVeiculo } from '@/api/types';

export default function Tabelas() {
  // State para Marcas
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [novaMarca, setNovaMarca] = useState('');
  const [loadingMarcas, setLoadingMarcas] = useState(false);

  // State para Categorias
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // State para Tipos de Veículos
  const [tiposVeiculo, setTiposVeiculo] = useState<TipoVeiculo[]>([]);
  const [novoTipo, setNovoTipo] = useState({ titulo: '', observacao: '' });
  const [loadingTipos, setLoadingTipos] = useState(false);

  // State para confirmação de exclusão
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'marca' | 'categoria' | 'tipo';
    id: number;
    nome: string;
  } | null>(null);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoadingMarcas(true);
      setLoadingCategorias(true);
      setLoadingTipos(true);

      const [marcasResponse, categoriasResponse, tiposResponse] = await Promise.all([
        marcasApi.getAll(),
        categoriasApi.getAll(),
        tiposVeiculoApi.getAll(),
      ]);

      setMarcas(marcasResponse);
      setCategorias(categoriasResponse);
      setTiposVeiculo(tiposResponse);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao carregar dados';
      toast.error(message);
    } finally {
      setLoadingMarcas(false);
      setLoadingCategorias(false);
      setLoadingTipos(false);
    }
  };

  // Handlers para Marcas
  const handleAddMarca = async () => {
    if (!novaMarca.trim()) {
      toast.error('Digite um nome para a marca');
      return;
    }

    try {
      setLoadingMarcas(true);
      const novaMarcaCriada = await marcasApi.create({
        titulo: novaMarca,
      });

      setMarcas([...marcas, novaMarcaCriada]);
      setNovaMarca('');
      toast.success('Marca adicionada com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao adicionar marca';
      toast.error(message);
    } finally {
      setLoadingMarcas(false);
    }
  };

  const handleDeleteMarca = async (id: number) => {
    try {
      setLoadingMarcas(true);
      await marcasApi.remove(id);
      setMarcas(marcas.filter((m) => m.id !== id));
      setDeleteConfirm(null);
      toast.success('Marca removida com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover marca';
      toast.error(message);
    } finally {
      setLoadingMarcas(false);
    }
  };

  // Handlers para Categorias
  const handleAddCategoria = async () => {
    if (!novaCategoria.trim()) {
      toast.error('Digite um nome para a categoria');
      return;
    }

    try {
      setLoadingCategorias(true);
      const novaCategoriaCriada = await categoriasApi.create({
        titulo: novaCategoria,
      });

      setCategorias([...categorias, novaCategoriaCriada]);
      setNovaCategoria('');
      toast.success('Categoria adicionada com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao adicionar categoria';
      toast.error(message);
    } finally {
      setLoadingCategorias(false);
    }
  };

  const handleDeleteCategoria = async (id: number) => {
    try {
      setLoadingCategorias(true);
      await categoriasApi.remove(id);
      setCategorias(categorias.filter((c) => c.id !== id));
      setDeleteConfirm(null);
      toast.success('Categoria removida com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover categoria';
      toast.error(message);
    } finally {
      setLoadingCategorias(false);
    }
  };

  // Handlers para Tipos de Veículos
  const handleAddTipo = async () => {
    if (!novoTipo.titulo.trim()) {
      toast.error('Digite um nome para o tipo de veículo');
      return;
    }

    try {
      setLoadingTipos(true);
      const novoTipoCriado = await tiposVeiculoApi.create({
        titulo: novoTipo.titulo,
        observacao: novoTipo.observacao,
      });

      setTiposVeiculo([...tiposVeiculo, novoTipoCriado]);
      setNovoTipo({ titulo: '', observacao: '' });
      toast.success('Tipo de veículo adicionado com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao adicionar tipo de veículo';
      toast.error(message);
    } finally {
      setLoadingTipos(false);
    }
  };

  const handleDeleteTipo = async (id: number) => {
    try {
      setLoadingTipos(true);
      await tiposVeiculoApi.remove(id);
      setTiposVeiculo(tiposVeiculo.filter((t) => t.id !== id));
      setDeleteConfirm(null);
      toast.success('Tipo de veículo removido com sucesso');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover tipo de veículo';
      toast.error(message);
    } finally {
      setLoadingTipos(false);
    }
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
                disabled={loadingMarcas}
              />
              <Button onClick={handleAddMarca} className="gap-2" disabled={loadingMarcas}>
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Marcas Cadastradas</h3>
            {marcas.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma marca cadastrada</p>
            ) : (
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
                        <td className="px-4 py-2">{marca.titulo}</td>
                        <td className="px-4 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'marca',
                                id: marca.id,
                                nome: marca.titulo,
                              })
                            }
                            className="text-destructive hover:text-destructive"
                            disabled={loadingMarcas}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                disabled={loadingCategorias}
              />
              <Button onClick={handleAddCategoria} className="gap-2" disabled={loadingCategorias}>
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Categorias Cadastradas</h3>
            {categorias.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma categoria cadastrada</p>
            ) : (
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
                        <td className="px-4 py-2">{categoria.titulo}</td>
                        <td className="px-4 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'categoria',
                                id: categoria.id,
                                nome: categoria.titulo,
                              })
                            }
                            className="text-destructive hover:text-destructive"
                            disabled={loadingCategorias}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  value={novoTipo.titulo}
                  onChange={(e) => setNovoTipo({ ...novoTipo, titulo: e.target.value })}
                  disabled={loadingTipos}
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
                  disabled={loadingTipos}
                />
              </div>
              <Button onClick={handleAddTipo} className="gap-2" disabled={loadingTipos}>
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Tipos de Veículos Cadastrados</h3>
            {tiposVeiculo.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum tipo de veículo cadastrado</p>
            ) : (
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
                        <td className="px-4 py-2">{tipo.titulo}</td>
                        <td className="px-4 py-2 text-muted-foreground">{tipo.observacao}</td>
                        <td className="px-4 py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteConfirm({
                                type: 'tipo',
                                id: tipo.id,
                                nome: tipo.titulo,
                              })
                            }
                            className="text-destructive hover:text-destructive"
                            disabled={loadingTipos}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Dialog para confirmação de exclusão */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{deleteConfirm?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm?.type === 'marca') {
                  handleDeleteMarca(deleteConfirm.id);
                } else if (deleteConfirm?.type === 'categoria') {
                  handleDeleteCategoria(deleteConfirm.id);
                } else if (deleteConfirm?.type === 'tipo') {
                  handleDeleteTipo(deleteConfirm.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
