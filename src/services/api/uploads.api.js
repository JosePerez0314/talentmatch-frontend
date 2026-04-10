import { apiClient } from "./apiClient";

export const uploadService = {
  uploadCVs: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append("pdfs", file));
    
    return apiClient('/uploads', {
      method: 'POST',
      headers: { 'Accept': 'application/json' }, // NO enviamos Content-Type
      body: formData,
    });
  },
};