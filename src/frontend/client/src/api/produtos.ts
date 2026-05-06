import { createCrudApi } from "./crud";
import type { ProdutoApi, ProdutoPayload } from "./types";

export const produtosApi = createCrudApi<ProdutoApi, ProdutoPayload>("/produtos");
