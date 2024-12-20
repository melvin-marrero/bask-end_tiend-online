const express = require("express");
const { jesonResponse } = require("../biblioteca/jesonResponse");
const router = express.Router();
const Producto = require("../esquemas/esquemaProducto");
const multer = require("multer");
const path = require("path");
const { verificarToken } = require("../middleware/auth");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./config/cloudinaryConfig');

// Configuración de Multer y CloudinaryStorage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'productos', // Carpeta en Cloudinary
        allowed_formats: []  // Esto permite todos los formatos de imagen
    },
});

const cargar = multer({ storage });

router.post("/", cargar.single("image"), async function (req, res) {
    const { nombre, precio, cantidaDisponible, descri, cantida } = req.body;
    const imageUrl = req.file?.path;

    if (!nombre || !precio || !cantidaDisponible || !descri || !imageUrl || !cantida) {
        return res.status(402).json(
            jesonResponse(402, {
                error: "Los campos son requeridos"
            })
        );
    }
    try {
        const producto = new Producto();
        const exitProduct = await producto.pruductExit(nombre);
        if (exitProduct) {
            return res.status(400).json(jesonResponse(400, {
                error: "Este producto ya existe"
            }));
        } else {
            const newPruducto = new Producto({ nombre, precio, cantidaDisponible, descri, cantida, image: imageUrl });
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

router.put("/:id", cargar.single("image"), async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, cantidaDisponible, descri } = req.body;
    let imageUrl;

    try {
        // Si se proporciona una nueva imagen, sube la imagen a Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'productos',  // Carpeta en Cloudinary
                allowed_formats: []  // Esto permite todos los formatos de imagen
            });
            imageUrl = result.secure_url;  // Obtén la URL segura de Cloudinary
        }

        // Actualiza el producto con la nueva información (si hay imagen nueva)
        const updatedData = {
            nombre,
            precio,
            cantidaDisponible,
            descri,
            ...(imageUrl && { image: imageUrl }),  // Solo agrega la imagen si se ha subido una nueva
        };

        const producto = await Producto.findByIdAndUpdate(id, updatedData, { new: true });
        if (!producto) {
            return res.status(404).json(jesonResponse(404, { error: "Producto no encontrado" }));
        }
        res.status(200).json(jesonResponse(200, { message: "Producto actualizado con éxito" }));
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json(jesonResponse(500, { error: "Error al actualizar producto" }));
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
