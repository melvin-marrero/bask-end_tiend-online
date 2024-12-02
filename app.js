const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();
const loginRoutes = require("./rutas/auth");

const app = express();
app.use(cors({
    origin: 'http://localhost:3001' 
  }));
  
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

async function conectDB() {
    try {
        await mongoose.connect(process.env.db_conetion);
        console.log("Conectado a la base de datos >>>>>>>");
    } catch (error) {
        console.log(error);
    }
}
conectDB();

app.use("/api/iphone", require("./rutas/iphone"));
app.use("/api/sansung", require("./rutas/sansung"));
app.use("/api/xiaomi", require("./rutas/xiaomi"));
app.use("/api/iphonAcesory", require("./rutas/iphonAcesory"));
app.use("/api/sansungAcesory", require("./rutas/sansungAcesory"));
app.use("/api/xiaomiAcesory", require("./rutas/xiaomiAcesory"));
app.use("/api/masBuscado", require("./rutas/masBuscado"));
app.use('/api/auth', loginRoutes);

app.listen(3000);
console.log(`Servidor corriendo en el puerto ${3000}`);

app.get("/", (req, res) => {
    res.send("Hola mundo");
});
