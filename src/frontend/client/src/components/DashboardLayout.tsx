import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import type { User } from '@/types';

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export default function DashboardLayout({
  user,
  children,
  currentPath,
  onNavigate,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        user={user}
        currentPath={currentPath}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Navbar */}
        <Navbar user={user} onLogout={onLogout} />

        {/* Content Area */}
        <main className="flex-1 overflow-hidden bg-secondary/30 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 bg-white border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Painel Administrativo. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}
