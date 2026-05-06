import { useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import Pessoas from '@/pages/pessoas/PessoasPage';
import Veiculos from '@/pages/veiculos/VeiculosPage';
import OS from '@/pages/OS';
import Produtos from '@/pages/Produtos';
import Tabelas from '@/pages/Tabelas';
import Fornecedores from '@/pages/Fornecedores';
import Configuracoes from '@/pages/Configuracoes';
import Relatorios from '@/pages/Relatorios';
import Usuarios from '@/pages/usuarios/UsuariosPage';
import Login from '@/pages/Login';
import EditarOS from '@/pages/EditarOS';
import EditarPessoaPage from '@/pages/pessoas/EditarPessoaPage';
import EditarProduto from '@/pages/EditarProduto';
import EditarVeiculoPage from '@/pages/veiculos/EditarVeiculoPage';
import { mockOrdensSevico, mockPessoas, mockProdutos } from '@/lib/mockData';
import type { User, OrdemServico, Pessoa, Produto } from '@/types';
import type { UsuarioApi } from '@/api';

function usuarioToUser(usuario: UsuarioApi): User {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.perfil === 'Administrador' ? 'admin' : 'user',
  };
}

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem('authUser');

  if (!storedUser) {
    return null;
  }

  try {
    return usuarioToUser(JSON.parse(storedUser) as UsuarioApi);
  } catch {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    return null;
  }
}

function AppLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <DashboardLayout
      user={user}
      currentPath={location.pathname}
      onNavigate={navigate}
      onLogout={onLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
}

function ProtectedLayout({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout user={user} onLogout={onLogout} />;
}

function LoginRoute({ user, onLogin }: { user: User | null; onLogin: (token: string, usuario: UsuarioApi) => void }) {
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Login onLogin={onLogin} />;
}

function EditarOSRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const os = mockOrdensSevico.find((item) => item.id === id);

  if (!os) {
    return <Navigate to="/os" replace />;
  }

  return (
    <EditarOS
      os={os}
      onSave={(osAtualizada: OrdemServico) => {
        navigate('/os');
      }}
      onCancel={() => navigate('/os')}
    />
  );
}

function EditarPessoaRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/veiculos" replace />;
  }

  return (
    <EditarPessoaPage id={id} onNavigate={navigate}/>
  );
}

function EditarProdutoRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const produto = mockProdutos.find((item) => item.id === id);

  if (!produto) {
    return <Navigate to="/produtos" replace />;
  }

  return (
    <EditarProduto
      produto={produto}
      onSave={(produtoAtualizado: Produto) => {
        navigate('/produtos');
      }}
      onCancel={() => navigate('/produtos')}
    />
  );
}

function EditarVeiculoRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/veiculos" replace />;
  }

  return <EditarVeiculoPage id={id} onNavigate={navigate} />;
}

function AppRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => getStoredUser());

  const handleLogin = (_token: string, usuario: UsuarioApi) => {
    setUser(usuarioToUser(usuario));
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const handleUserUpdate = (usuarioAtualizado: UsuarioApi) => {
    const userAtualizado = usuarioToUser(usuarioAtualizado);

    localStorage.setItem('authUser', JSON.stringify(usuarioAtualizado));
    setUser(userAtualizado);
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginRoute user={user} onLogin={handleLogin} />} />

      <Route element={<ProtectedLayout user={user} onLogout={handleLogout} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pessoas" element={<Pessoas />} />
        <Route path="/pessoas/:id/editar" element={<EditarPessoaRoute />} />
        <Route path="/veiculos" element={<Veiculos />} />
        <Route path="/veiculos/:id/editar" element={<EditarVeiculoRoute />} />
        <Route path="/os" element={<OS />} />
        <Route path="/os/:id/editar" element={<EditarOSRoute />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produtos/:id/editar" element={<EditarProdutoRoute />} />
        <Route path="/tabelas" element={<Tabelas />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/usuarios" element={<Usuarios onUserUpdate={handleUserUpdate} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
