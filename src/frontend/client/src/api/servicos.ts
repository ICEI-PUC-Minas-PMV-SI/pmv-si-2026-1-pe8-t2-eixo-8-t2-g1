import { createCrudApi } from "./crud";
import type { ServicoApi, ServicoPayload } from "./types";

export const servicosApi = createCrudApi<ServicoApi, ServicoPayload>("/servicos");
