const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Configura las variables en tu archivo .env
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;

// Función de prueba de subida a Cloudinary
async function testUpload() {
    try {
        const result = await cloudinary.uploader.upload("./public/uploads/cargador-auto.jpg", {
            folder: 'test-folder', // Carpeta en Cloudinary donde se subirá la imagen
        });
        console.log("Upload exitoso:", result);
    } catch (error) {
        console.error("Error en la subida de prueba:", error.message);
    }
}

// Llamar a la función de prueba
testUpload();
module.exports = cloudinary;