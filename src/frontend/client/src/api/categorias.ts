import { createCrudApi } from "./crud";
import type { CategoriaApi, CategoriaPayload } from "./types";

export const categoriasApi =
  createCrudApi<CategoriaApi, CategoriaPayload>("/categorias");