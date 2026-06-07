import { useState } from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { User as UserType } from '@/types';

interface NavbarProps {
  user: UserType;
  config: (path: string) => void;
  onLogout: () => void;
}

export default function Navbar({ user, config, onLogout }: NavbarProps) {
/*   const notificationCount = 3; */
  const [perfilAberto, setPerfilAberto] = useState<boolean>(false);

  const userColorClass = (user: UserType) => {
    switch (user.role) {
      case "Administrador":
        return "text-sidebar-primary";
      case "Supervisor":
        return "text-sidebar-secondary";
      case "Padrão":
        return "text-sidebar-tertiary";
    }
  };


  return (
    <nav className={`h-16 bg-white border-b border-border flex items-center justify-between px-6 shadow-sm`}>
      <div className="flex-1" />
      
      <div className="flex items-center gap-4">
        {/* Notificações */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-foreground" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-2 border-b border-border">
              <h3 className="font-semibold text-sm">Notificações</h3>
            </div>
            <DropdownMenuItem disabled className="text-sm text-muted-foreground">
              Você tem {notificationCount} notificações não lidas
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm">
              Nova ordem de serviço criada
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm">
              Produto com estoque baixo
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm">
              Revisão de veículo agendada
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

        {/* Menu do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm">{user.nome}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setPerfilAberto(true)}>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => config('/configuracoes')}>
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {perfilAberto && (
          <Card className="absolute right-6 top-14 z-50 w-72 gap-4 border-border p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="size-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{user.nome}</h3>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className={`w-fit ${userColorClass(user)}`}>
              {user.role}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setPerfilAberto(false)}
            >
              Fechar
            </Button>
          </Card>
        )}
      </div>
    </nav>
  );
}
