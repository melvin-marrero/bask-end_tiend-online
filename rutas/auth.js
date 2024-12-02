const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usuario = require("../esquemas/esquemaUsuario");
const router = express.Router();

// Ruta para iniciar sesión
router.post("/login", async (req, res) => {
  const { email, contraseña } = req.body;

  // Verifica si el email existe
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    return res.status(400).json({ error: "Usuario no encontrado" });
  }

  // Compara las contraseñas
  const match = await bcrypt.compare(contraseña, usuario.contraseña);
  console.log('Contraseña proporcionada:', contraseña);  // Log para depuración
  console.log('Contraseña en base de datos:', usuario.contraseña);  // Log para depuración
  if (!match) {
    return res.status(400).json({ error: "Contraseña incorrecta" });
  }

  // Genera un JWT
  const token = jwt.sign({ userId: usuario._id,email}, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token });
});

module.exports = router;
