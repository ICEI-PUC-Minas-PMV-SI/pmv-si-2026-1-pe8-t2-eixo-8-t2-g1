import { useState } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/constants/permissions";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

interface SidebarProps {
  user: User;
  currentPath: string;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    permission: PERMISSIONS.RELATORIOS.VIEW,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    id: "pessoas",
    label: "Pessoas",
    href: "/pessoas",
    permission: PERMISSIONS.CLIENTES.VIEW,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
  {
    id: "veiculos",
    label: "Veículos",
    href: "/veiculos",
    permission: PERMISSIONS.VEICULOS.VIEW,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 7h11l1.96 2.5H4.54L6.5 7zm0 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
      </svg>
    ),
  },
  {
    id: "os",
    label: "OS",
    href: "/os",
    permission: PERMISSIONS.OS.VIEW,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12,2v4c0,0.833,0.292,1.542,0.875,2.125S14.167,9,15,9h4v11c0,0.55-0.196,1.021-0.587,1.413  S17.55,22,17,22H7c-0.55,0-1.021-0.196-1.412-0.587S5,20.55,5,20V4c0-0.55,0.196-1.021,0.588-1.413S6.45,2,7,2H12z M14,2l5,5h-4  c-0.283,0-0.521-0.096-0.712-0.287C14.096,6.521,14,6.283,14,6V2z M10,19h2c0.283,0,0.521-0.096,0.713-0.288  C12.904,18.521,13,18.283,13,18s-0.096-0.521-0.287-0.712C12.521,17.096,12.283,17,12,17h-2c-0.283,0-0.521,0.096-0.712,0.288  C9.096,17.479,9,17.717,9,18s0.096,0.521,0.288,0.712C9.479,18.904,9.717,19,10,19z M10,15h4c0.283,0,0.521-0.096,0.713-0.288  C14.904,14.521,15,14.283,15,14s-0.096-0.521-0.287-0.713C14.521,13.096,14.283,13,14,13h-4c-0.283,0-0.521,0.096-0.712,0.287  C9.096,13.479,9,13.717,9,14s0.096,0.521,0.288,0.712S9.717,15,10,15z" />
      </svg>
    ),
  },
  {
    id: "produtos",
    label: "Produtos",
    href: "/produtos",
    permission: PERMISSIONS.PRODUTOS.VIEW,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11,21.725v-9.15L3,7.95v8.025c0,0.367,0.088,0.7,0.263,1C3.438,17.275,3.683,17.517,4,17.7  L11,21.725z M13,21.725l7-4.025c0.317-0.183,0.562-0.425,0.738-0.725c0.175-0.3,0.262-0.633,0.262-1V7.95l-8,4.625V21.725z   M16.975,7.975l2.95-1.725L13,2.275C12.683,2.092,12.35,2,12,2c-0.35,0-0.683,0.092-1,0.275L9.025,3.4L16.975,7.975z M12,10.85  l2.975-1.7L7.05,4.55l-3,1.725L12,10.85z" />
      </svg>
    ),
  },
  {
    id: "tabelas",
    label: "Tabelas",
    href: "/tabelas",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11,16H3v3c0,0.55,0.196,1.021,0.588,1.413S4.45,21,5,21h6V16z M13,16v5h6  c0.55,0,1.021-0.196,1.413-0.587S21,19.55,21,19v-3H13z M11,14V9H3v5H11z M13,14h8V9h-8V14z M3,7h18V5  c0-0.55-0.196-1.021-0.587-1.412S19.55,3,19,3H5C4.45,3,3.979,3.196,3.588,3.587S3,4.45,3,5V7z" />
      </svg>
    ),
  },
  {
    id: "fornecedores",
    label: "Fornecedores",
    href: "/fornecedores",
    permission: PERMISSIONS.CLIENTES.VIEW,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    ),
  },
  {
    id: "configuracoes",
    label: "Configurações",
    href: "/configuracoes",
    permission: PERMISSIONS.CONFIG.VIEW,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.1-.62l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
  },
  {
    id: "relatorios",
    label: "Relatórios",
    href: "/relatorios",
    permission: PERMISSIONS.RELATORIOS.VIEW,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
      </svg>
    ),
  },
  {
    id: "usuarios",
    label: "Usuários",
    href: "/usuarios",
    permission: PERMISSIONS.USUARIOS.VIEW,
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1,20v-2.8c0-0.567,0.146-1.088,0.438-1.563C1.729,15.162,2.117,14.8,2.6,14.55  c1.033-0.517,2.083-0.904,3.15-1.163S7.9,13,9,13s2.183,0.129,3.25,0.387s2.117,0.646,3.15,1.163  c0.483,0.25,0.871,0.612,1.162,1.087C16.854,16.112,17,16.633,17,17.2V20H1z M19,20v-3c0-0.733-0.204-1.438-0.612-2.113  S17.4,13.633,16.65,13.15c0.85,0.1,1.65,0.271,2.4,0.512c0.75,0.242,1.45,0.538,2.1,0.888c0.6,0.333,1.058,0.704,1.375,1.112  C22.842,16.071,23,16.517,23,17v3H19z M6.175,10.825C5.392,10.042,5,9.1,5,8s0.392-2.042,1.175-2.825S7.9,4,9,4  s2.042,0.392,2.825,1.175C12.608,5.958,13,6.9,13,8s-0.392,2.042-1.175,2.825C11.042,11.608,10.1,12,9,12S6.958,11.608,6.175,10.825  z M17.825,10.825C17.042,11.608,16.1,12,15,12c-0.183,0-0.417-0.021-0.7-0.062c-0.283-0.042-0.517-0.088-0.7-0.137  c0.45-0.533,0.796-1.125,1.037-1.775C14.879,9.375,15,8.7,15,8s-0.121-1.375-0.363-2.025C14.396,5.325,14.05,4.733,13.6,4.2  c0.233-0.083,0.467-0.138,0.7-0.162C14.533,4.012,14.767,4,15,4c1.1,0,2.042,0.392,2.825,1.175S19,6.9,19,8  S18.608,10.042,17.825,10.825z" />
      </svg>
    ),
  },
];

export default function Sidebar({
  user,
  currentPath,
  onLogout,
  onNavigate,
}: SidebarProps) {
  const { hasPermission } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsMobileOpen(false);
  };

  /* const userRole = (user: User) => {
    switch (user.role) {
      case "Administrador":
        return "Admin";
      case "Supervisor":
        return "Supervisor";
      case "Padrão":
        return "Usuário";
    }
  };

  const userColorClass = (user: User) => {
    switch (user.role) {
      case "Administrador":
        return "text-sidebar-primary";
      case "Supervisor":
        return "text-sidebar-secondary";
      case "Padrão":
        return "text-sidebar-tertiary";
    }
  }; */

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          "lg:relative lg:z-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4">
          {!isCollapsed && (
            <h1 className="font-bold text-lg text-sidebar-primary">AutoPro</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isCollapsed ? "rotate-90" : "-rotate-90"
              )}
            />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {menuItems
            .filter(item => !item.permission || hasPermission(item.permission))
            .map(item => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                  currentPath === item.href
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          {!isCollapsed && (
            <div className="text-xs">
              <p className="font-semibold text-sidebar-foreground truncate">
                {user.nome}
              </p>
              <p className="text-sidebar-foreground/60 truncate">
                {user.email}
              </p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && "Sair"}
          </Button>
        </div>
      </aside>

      {/* Spacer for mobile when sidebar is open */}
      {isMobileOpen && <div className="fixed inset-0 z-20 lg:hidden" />}
    </>
  );
}
