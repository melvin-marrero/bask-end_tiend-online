const express = require("express");
const axios = require("axios");
const Pago = require("../esquemas/esquemaPagos");
const Producto = require("../esquemas/esquemaProducto"); // Importar el modelo de productos
require("dotenv").config();

const router = express.Router();

// Función para obtener el Access Token de PayPal
const getPayPalAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
  ).toString("base64");

  try {
    const response = await axios.post(
      `${process.env.PAYPAL_API}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error al obtener el token de PayPal:", error);
    return null;
  }
};

// Ruta para guardar el pago y actualizar stock
router.post("/", async (req, res) => {
  const { payerName, amount, currency, orderId, productos } = req.body;

  try {
    // Obtener el token de acceso de PayPal
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return res.status(500).json({ error: "No se pudo obtener el token de PayPal" });
    }

    // 1️⃣ Verificar el estado del pago en PayPal
    const paypalResponse = await axios.get(
      `${process.env.PAYPAL_API}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (paypalResponse.data.status !== "COMPLETED") {
      console.error("Pago no completado en PayPal:", paypalResponse.data);
      return res.status(400).json({ error: "El pago no se ha completado en PayPal." });
    }

    // 2️⃣ Guardar el pago en la base de datos
    const newPago = new Pago({ payerName, amount, currency, orderId });
    await newPago.save();

    // 3️⃣ Actualizar el stock de los productos comprados con verificación previa
    for (let item of productos) {
      const producto = await Producto.findById(item._id);
      
      if (!producto) {
        console.error(`Producto con ID ${item._id} no encontrado`);
        continue;
      }

      if (producto.cantidaDisponible < item.cantida) {
        console.error(`Stock insuficiente para ${producto.nombre}`);
        return res.status(400).json({ error: `Stock insuficiente para ${producto.nombre}` });
      }

      await Producto.findByIdAndUpdate(item._id, {
        $inc: { cantidaDisponible: -Math.abs(item.cantida) }, // Asegura que siempre reste
      });

      console.log(`Stock actualizado para ${producto.nombre}: Nuevo stock ${producto.cantidaDisponible - item.cantida}`);
    }

    res.status(200).json({ message: "Pago exitoso y stock actualizado." });
  } catch (error) {
    console.error("Error en el proceso de pago:", error);
    res.status(500).json({ error: "Error al procesar el pago" });
  }
});

module.exports = router;

