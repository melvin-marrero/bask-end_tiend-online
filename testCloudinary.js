const cloudinary = require("cloudinary").v2;

// Configuración
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ruta a la imagen
const rutaImagen = "public/upload/producto2.jpg";

// Subir imagen
cloudinary.uploader.upload(rutaImagen, { folder: "productos" })
    .then((result) => {
        console.log("Subida exitosa:", result.secure_url);
    })
    .catch((error) => {
        console.error("Error al subir a Cloudinary:", error);
    });
