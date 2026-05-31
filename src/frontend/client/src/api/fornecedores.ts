import { createCrudApi } from "./crud";
import type { FornecedorApi, FornecedorPayload } from "./types";

export const fornecedoresApi =
  createCrudApi<FornecedorApi, FornecedorPayload>("/fornecedores");