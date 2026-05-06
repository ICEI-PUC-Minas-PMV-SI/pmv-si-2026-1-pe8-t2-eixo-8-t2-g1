import { useEffect, useState } from 'react';
import { Edit, Lock, Plus, RotateCcw, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { usuariosApi, type UsuarioApi, type UsuarioPayload } from '@/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Breadcrumbs from '@/components/Breadcrumbs';
import UsuarioForm from '@/components/forms/UsuarioForm';

function getUsuarioLogado(): UsuarioApi | null {
  const storedUser = localStorage.getItem('authUser');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as UsuarioApi;
  } catch {
    return null;
  }
}

interface UsuariosProps {
  onUserUpdate?: (usuario: UsuarioApi) => void;
}

export default function Usuarios({ onUserUpdate }: UsuariosProps) {
  const [usuarios, setUsuarios] = useState<UsuarioApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<UsuarioApi | null>(null);
  const [alertAction, setAlertAction] = useState<{
    type: 'disable' | 'reset' | 'delete';
    usuario: UsuarioApi;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const usuarioLogado = getUsuarioLogado();
  const isAdmin = usuarioLogado?.perfil === 'Administrador';

  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        setLoading(true);
        const usuariosResponse = await usuariosApi.getAll();
        setUsuarios(usuariosResponse);
      } catch (error: any) {
        const message = error.response?.data?.messsage || 'Erro ao carregar';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadUsuarios();
  }, []);

  const requireAdmin = () => {
    if (isAdmin) {
      return true;
    }

    toast.error('Apenas administradores podem modificar usuários');
    return false;
  };

  const handleAddUsuario = async (novoUsuario: UsuarioPayload) => {
    if (!requireAdmin()) return;

    try {
      const usuarioCriado = await usuariosApi.create(novoUsuario);
      setUsuarios((usuariosAtuais) => [usuarioCriado, ...usuariosAtuais]);
      setIsDialogOpen(false);
      toast.success('Usuário cadastrado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao cadastrar usuário';
      toast.error(message);
    }
  };

  const handleEditUsuario = (usuario: UsuarioApi) => {
    if (!requireAdmin()) return;

    setEditingUsuario(usuario);
    setIsDialogOpen(true);
  };

  const handleSaveUsuario = async (usuarioPayload: UsuarioPayload) => {
    if (!requireAdmin()) return;

    if (!editingUsuario) {
      await handleAddUsuario(usuarioPayload);
      return;
    }

    try { 
      const usuarioAtualizado = await usuariosApi.update(editingUsuario.id, usuarioPayload);

      setUsuarios((usuariosAtuais) =>
        usuariosAtuais.map((usuario) =>
          usuario.id === usuarioAtualizado.id ? usuarioAtualizado : usuario,
        ),
      );
      if (usuarioLogado?.id === usuarioAtualizado.id) {
        onUserUpdate?.(usuarioAtualizado);
      };
      setEditingUsuario(null);
      setIsDialogOpen(false);
      toast.success('Usuário atualizado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar usuário';
      toast.error(message);
    }
  };

  const handleDesabilitar = (usuario: UsuarioApi) => {
    if (!requireAdmin()) return;
    setAlertAction({ type: 'disable', usuario });
  };

  const handleResetarSenha = (usuario: UsuarioApi) => {
    if (!requireAdmin()) return;
    setAlertAction({ type: 'reset', usuario });
  };

  const handleDeletarUsuario = (usuario: UsuarioApi) => {
    if (!requireAdmin()) return;
    setAlertAction({ type: 'delete', usuario });
  };

  const confirmAction = async () => {
    if (!alertAction || !requireAdmin()) return;

    try {
      if (alertAction.type === 'disable') {
        const novoStatus = alertAction.usuario.status === 'Ativo' ? 'Inativo' : 'Ativo';
        const usuarioAtualizado = await usuariosApi.update(alertAction.usuario.id, {
          status: novoStatus,
        });

        setUsuarios((usuariosAtuais) =>
          usuariosAtuais.map((usuario) =>
            usuario.id === usuarioAtualizado.id ? usuarioAtualizado : usuario,
          ),
        );
        toast.success(`Usuário ${novoStatus === 'Ativo' ? 'habilitado' : 'desabilitado'} com sucesso!`);
      } else if (alertAction.type === 'reset') {
        await usuariosApi.update(alertAction.usuario.id, {
          senha: '123456',
        });
        toast.success('Senha resetada para 123456');
      } else {
        await usuariosApi.remove(alertAction.usuario.id);
        setUsuarios((usuariosAtuais) =>
          usuariosAtuais.filter((usuario) => usuario.id !== alertAction.usuario.id)
        );

        toast.success('Usuário excluído com sucesso!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao executar ação';
      toast.error(message);
    } finally {
      setAlertAction(null);
    }
  };

  const getAlertTitle = () => {
    if (alertAction?.type === 'disable') {
      return 'Alterar Status do Usuário';
    }

    if (alertAction?.type === 'delete') {
      return 'Excluir Usuário';
    }

    return 'Resetar Senha';
  };

  const getAlertDescription = () => {
    if (alertAction?.type === 'disable') {
      const acao = alertAction.usuario.status === 'Ativo' ? 'desabilitar' : 'habilitar';

      return `Tem certeza que deseja ${acao} o usuário ${alertAction.usuario.nome}?`;
    }

    if (alertAction?.type === 'delete') {
      return `Tem certeza que deseja excluir o usuário ${alertAction.usuario.nome}? Essa ação não poderá ser desfeita.`;
    }

    return `Tem certeza que deseja resetar a senha do usuário ${alertAction?.usuario.nome} para 123456?`;
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'Administrador':
        return 'bg-red-100 text-red-800';
      case 'Supervisor':
        return 'bg-blue-100 text-blue-800';
      case 'Padrão':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }, { label: 'Usuários' }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1>Usuários</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? 'Gerenciamento de usuários do sistema'
              : 'Consulta de usuários do sistema'}
          </p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingUsuario(null);
            }
          }}
        >
          {isAdmin && (
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUsuario ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}</DialogTitle>
              <DialogDescription>
                {editingUsuario
                  ? 'Atualize os dados do usuário selecionado'
                  : 'Preencha os dados abaixo para cadastrar um novo usuário'}
              </DialogDescription>
            </DialogHeader>
            <UsuarioForm
              initialData={editingUsuario || undefined}
              onSubmit={handleSaveUsuario}
              onCancel={() => {
                setEditingUsuario(null);
                setIsDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando usuários...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nome</th>
                  <th className="px-4 py-3 text-left font-semibold">E-mail</th>
                  <th className="px-4 py-3 text-left font-semibold">Perfil</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-left font-semibold">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario, index) => (
                  <tr key={usuario.id} className={index % 2 === 0 ? 'bg-white' : 'bg-secondary/20'}>
                    <td className="px-4 py-3">{usuario.nome}</td>
                    <td className="px-4 py-3">{usuario.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPerfilColor(usuario.perfil)}`}>
                        {usuario.perfil}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={getStatusColor(usuario.status)}>{usuario.status}</Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUsuario(usuario)}
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDesabilitar(usuario)}
                            title={usuario.status === 'Ativo' ? 'Desabilitar' : 'Habilitar'}
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetarSenha(usuario)}
                            title="Resetar senha"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletarUsuario(usuario)}
                            title="Excluir usuário"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AlertDialog open={!!alertAction} onOpenChange={() => setAlertAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {getAlertTitle()}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getAlertDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirmar</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
