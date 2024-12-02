const express = require("express");
const { jesonResponse } = require("../biblioteca/jesonResponse");
const router = express.Router();
const Producto = require("../esquemas/esquemaMasbuscado");
const multer = require("multer");
const path = require("path");
const { verificarToken } = require("../middleware/auth");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        if (file !== null) {
            const ext = file.originalname.split(".").pop();
            cb(null, Date.now() + "." + ext);
        }
    }
});

const cargar = multer({ storage });

router.post("/",verificarToken, cargar.single("image"), async function (req, res) {
    const { nombre, precio, cantidaDisponible, descri, cantida } = req.body;
    const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;

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
        return res.status(500).json(jesonResponse(500, {
            error: "Error al crear producto"
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

router.put("/:id",verificarToken, cargar.single("image"), async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, cantidaDisponible, descri } = req.body;
    let imageUrl;

    // Si se proporciona una nueva imagen, actualizar la URL
    if (req.file) {
        imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    try {
        const updatedData = {
            nombre,
            precio,
            cantidaDisponible,
            descri,
            ...(imageUrl && { image: imageUrl }), // Solo actualiza si hay nueva imagen
        };

        const producto = await Producto.findByIdAndUpdate(id, updatedData, { new: true });
        if (!producto) {
            return res.status(404).json(jesonResponse(404, { error: "Producto no encontrado" }));
        }
        res.status(200).json(jesonResponse(200, { message: "Producto actualizado", producto }));
    } catch (error) {
        res.status(500).json(jesonResponse(500, { error: "Error al actualizar producto" }));
    }
});

router.delete("/:id",verificarToken, async (req, res) => {
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




module.exports = router;