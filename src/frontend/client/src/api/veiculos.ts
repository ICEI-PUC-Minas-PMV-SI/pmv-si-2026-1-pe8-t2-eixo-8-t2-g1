import { createCrudApi } from "./crud";
import type { VeiculoApi, VeiculoPayload } from "./types";

export const veiculosApi = createCrudApi<VeiculoApi, VeiculoPayload>("/veiculos");
