const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./esquemas/esquemaUsuario'); // Importa el modelo de usuario
require('dotenv').config();  // Para leer variables de entorno

const email = process.env.USER_EMAIL || 'elfuerte@gmail.com';
const contraseña = process.env.USER_PASSWORD || '567890';
const isAdmin = true;

async function createUser() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.db_conetion);
    console.log('Conectado a la base de datos');

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('El usuario ya existe');
      return;
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear el nuevo usuario
    const newUser = new User({
      email,
      contraseña: hashedPassword,
      isAdmin
    });

    // Guardar el usuario en la base de datos
    await newUser.save();
    console.log(`Usuario ${email} creado exitosamente`);
  } catch (err) {
    console.error('Error al crear el usuario:', err);
  } finally {
    // Cerrar la conexión a la base de datos
    mongoose.disconnect();
  }
}

createUser();

