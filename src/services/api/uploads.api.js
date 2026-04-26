import { apiClient } from "./apiClient";

export const uploadService = {
  uploadCVs: (files) => {
    
    const formData = new FormData();
    
    // attach the files
    files.forEach(file => formData.append("pdfs", file));
    
    return apiClient('/uploads', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData,
    });
  },
};