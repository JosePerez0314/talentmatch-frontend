import { apiClient } from "./apiClient";
import { Candidate, ApiResponse } from "../../types/api.types";

export const uploadService = {
  // Procesar la subida múltiple de PDFs de currículums
  uploadCVs: async (files: File[]): Promise<ApiResponse<Candidate[]>> => {
    const formData = new FormData();

    // Adjuntar los archivos tipados estrictamente como la clase nativa File
    files.forEach((file: File) => formData.append("pdfs", file));

    return apiClient('/uploads', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });
  },
};