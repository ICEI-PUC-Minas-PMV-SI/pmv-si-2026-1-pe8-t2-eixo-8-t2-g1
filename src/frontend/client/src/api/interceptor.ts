import api from "./http";

export function setupInterceptors(logout: () => void) {
  const interceptorId = api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        logout();
      }

      return Promise.reject(error);
    }
  );

  return () => {
    api.interceptors.response.eject(interceptorId);
  };
}
