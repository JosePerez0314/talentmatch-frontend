import { apiClient } from "./apiClient";

export const uploadService = {
  // Received the userId
  uploadCVs: (files, userId) => {
    if (!userId) {
      throw new Error("No se puede subir archivos sin un ID de usuario válido.");
    }

    const formData = new FormData();
    
    // Attach the files
    files.forEach(file => formData.append("pdfs", file));

    // Attach the userId that we received from the component
    formData.append("userId", userId);

    return apiClient('/uploads', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });
  },
};