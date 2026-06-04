import api from "./http";
import type { LoginPayload, LoginResponse, SessionResponse } from "./types";

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/usuarios/login", payload);
    return data;
  },
  async me(): Promise<SessionResponse> {
    const { data } = await api.get<SessionResponse>("/usuarios/me");
    return data;
  },
  async logout(): Promise<void> {
    await api.post("/usuarios/logout");
  },
};
