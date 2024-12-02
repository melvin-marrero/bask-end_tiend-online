const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },  // Campo para identificar si el usuario es admin
}, { versionKey: false });

module.exports = mongoose.model("Usuario", usuarioSchema);


