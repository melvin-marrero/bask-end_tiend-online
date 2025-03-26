const mongoose = require("mongoose");

const pagoSchema = new mongoose.Schema({
  payerName: String,
  amount: Number,
  currency: String,
  orderId: String,
  createdAt: { type: Date, default: Date.now },
},{versionKey:false});

const Pago = mongoose.model("Pago", pagoSchema);
module.exports = Pago;
