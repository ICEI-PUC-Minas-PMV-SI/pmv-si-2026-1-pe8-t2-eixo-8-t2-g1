import { createCrudApi } from "./crud";
import type { MarcaApi, MarcaPayload } from "./types";

export const marcasApi =
  createCrudApi<MarcaApi, MarcaPayload>("/marcas");