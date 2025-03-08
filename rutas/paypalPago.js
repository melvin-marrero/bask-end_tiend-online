const express = require("express");
const Pago = require("../esquemas/esquemaPagos");

const router = express.Router();

// Ruta para guardar el pago
router.post("/", async (req, res) => {
  const { payerName, amount, currency, orderId } = req.body;
  const newPago = new Pago({ payerName, amount, currency, orderId });

  try {
    const savedPago = await newPago.save();
    res.status(200).json(savedPago);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar el pago" });
  }
});

module.exports = router;
