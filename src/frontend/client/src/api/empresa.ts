import { createCrudApi } from "./crud";
import api from "./http";
import type { EmpresaApi, EmpresaPayload } from "./types";

export const empresaApi = createCrudApi<EmpresaApi, EmpresaPayload>("/config/empresa");

// Função para upload de logotipo
export async function uploadLogotipo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("logo", file);

  const { data } = await api.post<{ logoPath: string }>(
    "/config/empresa/upload-logo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.logoPath;
}

// Função para buscar logotipo
export async function getLogotipo(): Promise<Blob> {
  const { data } = await api.get<Blob>(
    "/config/empresa/logotipo",
    {
      responseType: "blob",
    }
  );

  return data;
}
