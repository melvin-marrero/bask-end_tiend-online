const cloudinary = require("cloudinary").v2;

// Configuración
cloudinary.config({
    cloud_name: "dcizijq9y", // Reemplaza con tu valor exacto
    api_key: "587669285117954", // Reemplaza con tu clave exacta
    api_secret: "EGctlcpRhz1B9hL5swHYMEU0WKg", // Reemplaza con tu secreto exacto
});

// Ruta a la imagen
const path = require("path");

const filePath = path.resolve(__dirname, "public", "upload", "producto2.jpg");
cloudinary.uploader.upload(filePath, { folder: "productos" })
    .then((result) => {
        console.log("Subida exitosa:", result.secure_url);
    })
    .catch((error) => {
        console.error("Error al subir a Cloudinary:", error);
    });
