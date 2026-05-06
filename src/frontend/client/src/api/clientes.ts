import { createCrudApi } from "./crud";
import type { ClienteApi, ClientePayload } from "./types";

export const clientesApi = createCrudApi<ClienteApi, ClientePayload>("/clientes");
