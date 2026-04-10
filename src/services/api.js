const BASE_URL = import.meta.env.VITE_API_URL;

// Global helper to inject the token in requests
const getHeaders = () => ({
  "Content-Type": "application/json",
});

//Request for Login.jsx
export const authService = {
  login: async (credentials) => {
    try {
      // Endpoint
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseBody = isJson ? await response.json() : null;

      // HTTP status like the backend 'success' flag
      if (!response.ok || (responseBody && responseBody.success === false)) {
        // We read 'standard' error from Railway
        throw new Error(responseBody?.error || `Error del servidor: ${response.status}`);
      }

      // return the 'data' object directly
      return responseBody.data; 
    } catch (error) {
      console.error("API Error [login]:", error.message);
      throw error; 
    }
  },
};

// Request for Position.jsx
export const positionService = {
  create: async (positionData) => {
    try {
      const response = await fetch(`${BASE_URL}/positions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(positionData),
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseBody = isJson ? await response.json() : null;

      if (!response.ok || (responseBody && responseBody.success === false)) {
        throw new Error(responseBody?.error || `Error al crear posición: ${response.status}`);
      }

      return responseBody.data;
    } catch (error) {
      console.error("API Error [createPosition]:", error.message);
      throw error;
    }
  },
};

// Request for UploadCV.jsx
export const uploadService = {
  uploadCVs: async (files) => {
    try {
      // Native FormData for sending files
      const formData = new FormData();
      // The key 'pdfs'
      files.forEach(file => formData.append("pdfs", file));

      const response = await fetch(`${BASE_URL}/uploads`, {
        method: "POST",
        // NO enviamos headers() porque el navegador debe calcular el Content-Type multipart/form-data con su propio boundary
        body: formData,
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseBody = isJson ? await response.json() : null;

      if (!response.ok || (responseBody && responseBody.success === false)) {
        throw new Error(responseBody?.error || `Error del servidor: ${response.status}`);
      }

      return responseBody.data;
    } catch (error) {
      console.error("API Error [uploadCVs]:", error.message);
      throw error;
    }
  },
};

// Request for CVHistory.jsx
export const candidateService = {
  getAll: async () => {
    try {
      const response = await fetch(`${BASE_URL}/candidates`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseBody = isJson ? await response.json() : null;

      if (!response.ok || (responseBody && responseBody.success === false)) {
        throw new Error(responseBody?.error || `Error del servidor: ${response.status}`);
      }

      return responseBody.data;
    } catch (error) {
      console.error("API Error [getCandidates]:", error.message);
      throw error;
    }
  },
};