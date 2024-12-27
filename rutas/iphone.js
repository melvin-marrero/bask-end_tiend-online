const express = require("express");
const { jesonResponse } = require("../biblioteca/jesonResponse");
const router = express.Router();
const Producto = require("../esquemas/esquemaProducto");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const { verificarToken } = require("../middleware/auth");

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Configura las variables en tu archivo .env
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de almacenamiento en Cloudinary
const cargar = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limitar tamaño de archivo a 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Solo se permiten imágenes"), false);
        }
        cb(null, true);
    },
}).single("image");


// Ruta POST para agregar producto
router.post("/", cargar.single("image"), async function (req, res) {
    const { nombre, precio, cantidaDisponible, descri, cantida } = req.body;
    const imageUrl = req.file.path; // URL generada por Cloudinary
    console.log("Archivo recibido:", req.file);
    console.log("Cuerpo de la solicitud:", req.body);

    if (!req.file) {
        return res.status(400).json(
            jesonResponse(400, { error: "Se requiere una imagen para el producto." })
        );
    }

    if (!nombre || !precio || !cantidaDisponible || !descri || !imageUrl || !cantida) {
        return res.status(402).json(
            jesonResponse(402, {
                error: "Los campos son requeridos",
            })
        );
    }

    try {
        const producto = new Producto();
        const exitProduct = await producto.pruductExit(nombre);
        if (exitProduct) {
            return res.status(400).json(jesonResponse(400, {
                error: "Este producto ya existe",
            }));
        } else {
            const newPruducto = new Producto({
                nombre,
                precio,
                cantidaDisponible,
                descri,
                cantida,
                image: imageUrl, // URL de Cloudinary
            });
            await newPruducto.save();
            res.status(200).json(jesonResponse(200, { message: "Producto agregado con éxito" }));
        }
    } catch (error) {
        console.error("Error al crear producto:", error);
        return res.status(500).json(jesonResponse(500, {
            error: "Error al crear producto",
            detalles: error.message,
        }));
    }
});


router.get("/", async (req, res) => {
    try {
        const productos = await Producto.find(); // Obtener todos los productos
        res.json(productos); // Enviar los productos como respuesta
    } catch (error) {
        res.status(500).json(jesonResponse(500, { error: "Error al obtener productos" }));
    }
});

// Ruta para actualizar un producto
router.put("/:id", cargar.single("image"), async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, cantidaDisponible, descri, cantida } = req.body;
    let imageUrl;

    if (req.file) {
        imageUrl = req.file.path; // URL de Cloudinary
    }

    try {
        const updateData = { nombre, precio, cantidaDisponible, descri, cantida };
        if (imageUrl) {
            updateData.image = imageUrl;
        }

        const productoActualizado = await Producto.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!productoActualizado) {
            return res.status(404).json(jesonResponse(404, { error: "Producto no encontrado" }));
        }

        res.status(200).json(jesonResponse(200, { message: "Producto actualizado con éxito", producto: productoActualizado }));
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json(jesonResponse(500, { error: "Error al actualizar el producto" }));
    }
});

router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findByIdAndDelete(id);
        // Si no se encuentra el producto, devolvemos un error 404
        if (!producto) {
            return res.status(404).json(jesonResponse(404, { error: "Producto no encontrado" }));
        }
        res.status(200).json(jesonResponse(200, { message: "Producto eliminado con éxito" }));
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json(jesonResponse(500, { error: "Error al eliminar el producto" }));
    }
});

// Ruta para buscar productos
router.get("/search", async (req, res) => {
    const query = req.query.query || '';  // Toma el término de búsqueda de la query string

    if (!query) {
        return res.json([]); // Si no hay query, devuelve un array vacío
    }

    try {
        const productos = await Producto.find({
            nombre: { $regex: `^${query}`, $options: 'i' } // Busca productos cuyo nombre empieza con la 'query'
        });
        res.json(productos); // Devuelve los productos encontrados
    } catch (error) {
        res.status(500).json({ error: "Error al obtener productos" });
    }
});

module.exports = router;
