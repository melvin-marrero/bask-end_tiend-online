const express = require("express");
const { jesonResponse } = require("../biblioteca/jesonResponse");
const router = express.Router();
const Producto = require("../esquemas/esquemaSansung");
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

router.post("/", cargar.single("image"), async function (req, res) {
    const { nombre, precio, cantidaDisponible, descri, cantida } = req.body;
    const imageUrl = `https://bask-end-tiend-online.onrender.com/uploads/${req.file.filename}`;

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

// Ruta para actualizar un producto
router.put("/:id", cargar.single("image"), async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, cantidaDisponible, descri, cantida } = req.body;
    let imageUrl;

    if (req.file) {
        imageUrl = `https://bask-end-tiend-online.onrender.com/uploads/${req.file.filename}`;
    }

    try {
        // Construir los datos a actualizar
        const updateData = { nombre, precio, cantidaDisponible, descri, cantida };
        if (imageUrl) {
            updateData.image = imageUrl; // Solo agregar la imagen si se subió
        }

        // Actualizar el producto
        const productoActualizado = await Producto.findByIdAndUpdate(id, updateData, {
            new: true, // Devuelve el documento actualizado
            runValidators: true // Verifica las validaciones definidas en el esquema
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


router.delete("/:id",async (req, res) => {
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