// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../esquemas/esquemaUsuario');
const router = express.Router();

// Ruta de login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

  // Compara la contraseña
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

  // Si el usuario es administrador
  if (!user.isAdmin) {
    return res.status(403).json({ message: 'No tienes permisos de administrador' });
  }

  // Generar JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

module.exports = router;
