import { createCrudApi } from "./crud";
import type { EmpresaApi, EmpresaPayload} from "./types";

export const empresaApi = createCrudApi<EmpresaApi, EmpresaPayload>("/config/empresa");