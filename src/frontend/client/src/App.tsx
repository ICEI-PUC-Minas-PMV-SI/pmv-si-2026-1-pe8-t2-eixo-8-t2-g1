import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { setupInterceptors } from "./api/interceptor";
import { PERMISSIONS } from "@/constants/permissions";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "@/components/DashboardLayout";
import Pessoas from "@/pages/pessoas/PessoasPage";
import Veiculos from "@/pages/veiculos/VeiculosPage";
import OS from "@/pages/os/OSPage";
import Produtos from "@/pages/produtos/produtosPage";
import Tabelas from "@/pages/Tabelas";
import Fornecedores from "@/pages/fornecedores/FornecedoresPage";
import Configuracoes from "@/pages/Configuracoes";
import Usuarios from "@/pages/usuarios/UsuariosPage";
import Login from "@/pages/Login";
import EditarOS from "@/pages/os/EditarOSPage";
import EditarPessoaPage from "@/pages/pessoas/EditarPessoaPage";
import EditarProduto from "@/pages/produtos/editarProdutoPage";
import EditarVeiculoPage from "@/pages/veiculos/EditarVeiculoPage";
const Dashboard = lazy(() => import("@/pages/dashboard/DashboardPage"));
const Relatorios = lazy(() => import("@/pages/relatorios/RelatoriosPage"));
const TEMPO_INATIVIDADE = 10 * 60 * 1000;

function useAutoLogout(onLogout: () => void, isActive: boolean) {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const resetarTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(onLogout, TEMPO_INATIVIDADE);
    };

    const eventos = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    eventos.forEach(evento => {
      window.addEventListener(evento, resetarTimer);
    });
    resetarTimer();

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      eventos.forEach(evento => {
        window.removeEventListener(evento, resetarTimer);
      });
    };
  }, [isActive, onLogout]);
}

function useInterceptionLogout(handleLogout: () => void) {
  useEffect(() => {
    return setupInterceptors(handleLogout);
  }, [handleLogout]);
}

function getDefaultPath(hasPermission: (permission: string) => boolean) {
  if (hasPermission(PERMISSIONS.RELATORIOS.VIEW)) {
    return "/";
  }

  if (hasPermission(PERMISSIONS.CLIENTES.VIEW)) {
    return "/pessoas";
  }

  if (hasPermission(PERMISSIONS.VEICULOS.VIEW)) {
    return "/veiculos";
  }

  if (hasPermission(PERMISSIONS.OS.VIEW)) {
    return "/os";
  }

  if (hasPermission(PERMISSIONS.PRODUTOS.VIEW)) {
    return "/produtos";
  }

  if (hasPermission(PERMISSIONS.USUARIOS.VIEW)) {
    return "/usuarios";
  }

  if (hasPermission(PERMISSIONS.CONFIG.VIEW)) {
    return "/configuracoes";
  }

  return "/tabelas";
}

function AppLayout({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useAutoLogout(onLogout, !!user);
  useInterceptionLogout(onLogout);

  if (!user) {
    return null;
  }

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

function ProtectedLayout() {
  const navigate = useNavigate();
  const { user, logout, isSessionLoading } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  if (isSessionLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout onLogout={handleLogout} />;
}

function LoginRoute() {
  const { user, isSessionLoading, hasPermission } = useAuth();

  if (isSessionLoading) {
    return null;
  }

  if (user) {
    return <Navigate to={getDefaultPath(hasPermission)} replace />;
  }

  return <Login />;
}

function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: ReactNode;
}) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <Navigate to={getDefaultPath(hasPermission)} replace />;
  }

  return children;
}

function EditarOSRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/os" replace />;
  }

  return <EditarOS id={id} onNavigate={navigate} />;
}

function EditarPessoaRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/pessoas" replace />;
  }

  return <EditarPessoaPage id={id} onNavigate={navigate} />;
}

function EditarProdutoRoute() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return <Navigate to="/produtos" replace />;
  }

  return <EditarProduto id={id} onNavigate={navigate} />;
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
  const { hasPermission } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedLayout />}>
        <Route
          path="/"
          element={
            <RequirePermission permission={PERMISSIONS.RELATORIOS.VIEW}>
              <Dashboard />
            </RequirePermission>
          }
        />
        <Route
          path="/pessoas"
          element={
            <RequirePermission permission={PERMISSIONS.CLIENTES.VIEW}>
              <Pessoas />
            </RequirePermission>
          }
        />
        <Route
          path="/pessoas/:id/editar"
          element={
            <RequirePermission permission={PERMISSIONS.CLIENTES.EDIT}>
              <EditarPessoaRoute />
            </RequirePermission>
          }
        />
        <Route
          path="/veiculos"
          element={
            <RequirePermission permission={PERMISSIONS.VEICULOS.VIEW}>
              <Veiculos />
            </RequirePermission>
          }
        />
        <Route
          path="/veiculos/:id/editar"
          element={
            <RequirePermission permission={PERMISSIONS.VEICULOS.EDIT}>
              <EditarVeiculoRoute />
            </RequirePermission>
          }
        />
        <Route
          path="/os"
          element={
            <RequirePermission permission={PERMISSIONS.OS.VIEW}>
              <OS />
            </RequirePermission>
          }
        />
        <Route
          path="/os/:id/editar"
          element={
            <RequirePermission permission={PERMISSIONS.OS.EDIT}>
              <EditarOSRoute />
            </RequirePermission>
          }
        />
        <Route
          path="/produtos"
          element={
            <RequirePermission permission={PERMISSIONS.PRODUTOS.VIEW}>
              <Produtos />
            </RequirePermission>
          }
        />
        <Route
          path="/produtos/:id/editar"
          element={
            <RequirePermission permission={PERMISSIONS.PRODUTOS.EDIT}>
              <EditarProdutoRoute />
            </RequirePermission>
          }
        />
        <Route path="/tabelas" element={<Tabelas />} />
        <Route
          path="/fornecedores"
          element={
            <RequirePermission permission={PERMISSIONS.CLIENTES.VIEW}>
              <Fornecedores />
            </RequirePermission>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <RequirePermission permission={PERMISSIONS.CONFIG.VIEW}>
              <Configuracoes />
            </RequirePermission>
          }
        />
        <Route
          path="/relatorios"
          element={
            <RequirePermission permission={PERMISSIONS.RELATORIOS.VIEW}>
              <Relatorios />
            </RequirePermission>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RequirePermission permission={PERMISSIONS.USUARIOS.VIEW}>
              <Usuarios />
            </RequirePermission>
          }
        />
        <Route
          path="*"
          element={<Navigate to={getDefaultPath(hasPermission)} replace />}
        />
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
            <AuthProvider>
              <Suspense fallback={<div>Carregando...</div>}>
                <AppRoutes />
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
