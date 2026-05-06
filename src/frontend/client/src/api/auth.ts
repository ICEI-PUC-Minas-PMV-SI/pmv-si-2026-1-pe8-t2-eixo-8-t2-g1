import api from "./http";
import type { LoginPayload, LoginResponse } from "./types";

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/usuarios/login", payload);
    return data;
  },
};
