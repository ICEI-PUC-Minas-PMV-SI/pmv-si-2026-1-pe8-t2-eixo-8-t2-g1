import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, type UsuarioSessaoApi } from "@/api";
import type { User } from "@/types";

type AuthenticatedUser = User & {
  permissoes: string[];
};

type AuthContextType = {
  user: AuthenticatedUser | null;
  isSessionLoading: boolean;
  login: (usuario: UsuarioSessaoApi) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permissao: string) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function usuarioToUser(usuario: UsuarioSessaoApi): AuthenticatedUser {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.perfil,
    permissoes: usuario.permissoes,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const login = useCallback((usuario: UsuarioSessaoApi) => {
    setUser(usuarioToUser(usuario));
  }, []);

  const refreshSession = useCallback(async () => {
    const response = await authApi.me();
    login(response.usuario);
  }, [login]);

  useEffect(() => {
    let ignore = false;

    async function restoreSession() {
      try {
        const response = await authApi.me();

        if (!ignore) {
          login(response.usuario);
        }
      } catch {
        if (!ignore) {
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setIsSessionLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      ignore = true;
    };
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // A sessao local deve ser encerrada mesmo se a API estiver indisponivel.
    } finally {
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permissao: string) => user?.permissoes.includes(permissao) ?? false,
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isSessionLoading,
      login,
      logout,
      refreshSession,
      hasPermission,
    }),
    [hasPermission, isSessionLoading, login, logout, refreshSession, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
