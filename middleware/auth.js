const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Acceso denegado. No hay token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Almacena el ID del usuario en la solicitud
    next();
  } catch (error) {
    return res.status(400).json({ error: "Token no válido" });
  }
}

module.exports = { verificarToken };
