import { createCrudApi } from "./crud";
import type { UsuarioApi, UsuarioPayload } from "./types";

export const usuariosApi = createCrudApi<UsuarioApi, UsuarioPayload>("/usuarios");
