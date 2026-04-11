import { apiClient } from "./apiClient";

export const uploadService = {
  uploadCVs: (files) => {
    const formData = new FormData();
    
    files.forEach(file => formData.append("pdfs", file));

    // Extract the user from the current session
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    const userId = user?.id || user?._id;

    if (!userId) {
      throw new Error("Sesión inválida: No se encontró el ID de usuario para subir el CV.");
    }

    // Add the userId strictly required by the new endpoint
    formData.append("userId", userId);

    return apiClient('/uploads', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });
  },
};