import api from "./http";
import type { RelatoriosApi } from "./types";

export const relatoriosApi = {
  async getResumo() {
    const { data } = await api.get<RelatoriosApi>("/relatorios");
    return data;
  },
};
