const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema({
  payerName: String,
  amount: Number,
  currency: String,
  orderId: String,
  createdAt: { type: Date, default: Date.now },
});

const Pago = mongoose.model("Pago", pagoSchema);
module.exports = Pago;
