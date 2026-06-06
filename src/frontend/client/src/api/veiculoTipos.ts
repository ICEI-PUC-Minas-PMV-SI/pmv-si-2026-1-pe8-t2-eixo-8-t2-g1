import { createCrudApi } from "./crud";
import type { TipoVeiculoApi, TipoVeiculoPayload } from "./types";

export const  tiposVeiculoApi = createCrudApi<TipoVeiculoApi, TipoVeiculoPayload>("/tipos/veiculos");