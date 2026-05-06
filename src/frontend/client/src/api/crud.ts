import api from "./http";

export function createCrudApi<TResponse, TPayload>(resource: string) {
  return {
    async getAll() {
      const { data } = await api.get<TResponse[]>(resource);
      return data;
    },

    async getById(id: number | string) {
      const { data } = await api.get<TResponse>(`${resource}/${id}`);
      return data;
    },

    async create(payload: TPayload) {
      const { data } = await api.post<TResponse>(resource, payload);
      return data;
    },

    async update(id: number | string, payload: Partial<TPayload>) {
      const { data } = await api.put<TResponse>(`${resource}/${id}`, payload);
      return data;
    },

    async remove(id: number | string) {
      await api.delete(`${resource}/${id}`);
    },
  };
}
