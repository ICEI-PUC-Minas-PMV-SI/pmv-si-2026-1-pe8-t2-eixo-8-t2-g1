import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
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
const Dashboard = lazy(() => import('@/pages/dashboard/DashboardPage'));
import Pessoas from '@/pages/pessoas/PessoasPage';
import Veiculos from '@/pages/veiculos/VeiculosPage';
import OS from '@/pages/os/OSPage';
import Produtos from '@/pages/produtos/produtosPage';
import Tabelas from '@/pages/Tabelas';
import Fornecedores from '@/pages/fornecedores/FornecedoresPage';
import Configuracoes from '@/pages/Configuracoes';
const Relatorios = lazy(() => import('@/pages/relatorios/RelatoriosPage'));
import Usuarios from '@/pages/usuarios/UsuariosPage';
import Login from '@/pages/Login';
import EditarOS from '@/pages/os/EditarOSPage';
import EditarPessoaPage from '@/pages/pessoas/EditarPessoaPage';
import EditarProduto from '@/pages/produtos/editarProdutoPage';
import EditarVeiculoPage from '@/pages/veiculos/EditarVeiculoPage';
import type { User } from '@/types';
import { authApi, type UsuarioApi } from '@/api';
import { AUTH_USER_STORAGE_KEY } from './const';

const TEMPO_INATIVIDADE = 10 * 60 * 1000;
const AUTO_LOGOUT_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

function useAutoLogout(onLogout: () => void, isActive: boolean) {
  const onLogoutRef = useRef(onLogout);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let timerId: number | null = null;

    const resetarTimer = () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }

      timerId = window.setTimeout(() => {
        onLogoutRef.current();
      }, TEMPO_INATIVIDADE);
    };

    AUTO_LOGOUT_EVENTS.forEach((evento) => {
      window.addEventListener(evento, resetarTimer);
    });

    resetarTimer();

    return () => {
      if (timerId) {
        window.clearTimeout(timerId);
      }

      AUTO_LOGOUT_EVENTS.forEach((evento) => {
        window.removeEventListener(evento, resetarTimer);
      });
    };
  }, [isActive]);
}



function usuarioToUser(usuario: UsuarioApi): User {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.perfil,
  };
}

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return usuarioToUser(JSON.parse(storedUser) as UsuarioApi);
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

function AppLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  useAutoLogout(onLogout, !!user);

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

function ProtectedLayout({
  user,
  onLogout,
  isSessionLoading,
}: {
  user: User | null;
  onLogout: () => void;
  isSessionLoading: boolean;
}) {
  if (isSessionLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout user={user} onLogout={onLogout} />;
}

function LoginRoute({ user, onLogin, isSessionLoading }: {
  user: User | null;
  onLogin: (usuario: UsuarioApi) => void;
  isSessionLoading: boolean;
}) {
  if (isSessionLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Login onLogin={onLogin} />;
}

function EditarOSRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/os" replace />;
  }

  return (
    <EditarOS
      id={id}
      onNavigate={navigate}
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

  if (!id) {
    return <Navigate to="/produtos" replace />;
  }

  return (
    <EditarProduto
      id={id}
      onNavigate={navigate}
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
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function validarSessao() {
      if (ignore) {
        return;
      }

      try {
        const response = await authApi.me();

        if (!ignore) {
          localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(response.usuario));
          setUser(usuarioToUser(response.usuario));
        }
      } catch {
        if (ignore) {
          return;
        }

        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        setUser(null);
      } finally {
        if (!ignore) {
          setIsSessionLoading(false);
        }
      }
    }

    validarSessao();

    return () => {
      ignore = true;
    };
  }, []);

  const handleLogin = (usuario: UsuarioApi) => {
    setUser(usuarioToUser(usuario));
    navigate('/', { replace: true });
  };

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Mantem o logout local mesmo se a API estiver indisponivel.
    }

    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleUserUpdate = (usuarioAtualizado: UsuarioApi) => {
    const userAtualizado = usuarioToUser(usuarioAtualizado);

    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(usuarioAtualizado));
    setUser(userAtualizado);
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginRoute user={user} onLogin={handleLogin} isSessionLoading={isSessionLoading} />}
      />

      <Route element={<ProtectedLayout user={user} onLogout={handleLogout} isSessionLoading={isSessionLoading} />}>
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
            <Suspense fallback={<div>Carregando...</div>}>
              <AppRoutes />
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
