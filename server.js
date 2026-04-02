import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 1. Cargar variables de entorno
dotenv.config();

const app = express();
// Usamos el puerto del .env o el 5000 por defecto
const PORT = 5000; 

// 2. Middlewares
app.use(cors()); // Permite que React (puerto 5173) hable con Node (puerto 5000)
app.use(express.json()); // Permite recibir JSON en el body

// 3. Ruta de Login (Coincidiendo con lo que pide el Lead)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Obtenemos las credenciales válidas desde el .env
  const VALID_USER = process.env.VITE_TEST_USER;
  const VALID_PASS = process.env.VITE_TEST_PASS;

  console.log(`📩 Intento de login: ${email}`);

  if (email === VALID_USER && password === VALID_PASS) {
    return res.status(200).json({
      token: "ABC_TOKEN_2026_XYZ",
      user: { name: "Admin Master", email: VALID_USER }
    });
  } else {
    return res.status(401).json({ 
      message: "Credenciales incorrectas. Revisa tu archivo .env" 
    });
  }
});

// 4. Encender el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de TalentMatch corriendo en: http://localhost:${PORT}`);
  console.log(`🔑 Credenciales aceptadas: ${process.env.VITE_TEST_USER}`);
});