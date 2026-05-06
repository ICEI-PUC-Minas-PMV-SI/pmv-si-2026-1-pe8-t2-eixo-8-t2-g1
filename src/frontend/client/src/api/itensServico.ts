import { createCrudApi } from "./crud";
import type { ItemServicoApi, ItemServicoPayload } from "./types";

export const itensServicoApi = createCrudApi<ItemServicoApi, ItemServicoPayload>("/itens-servico");
