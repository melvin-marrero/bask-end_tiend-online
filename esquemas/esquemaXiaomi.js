const mongoose = require("mongoose");

const xiaomiSquema =new mongoose.Schema({
    id:{type:Object},
    nombre:{type:String,require:true,unique:true},
    precio:{type:Number,require:true,},
    cantidaDisponible:{type:Number,require:true},
    descri:{type:String,require:true},
    image: {type: String,require:true},
    cantida:{type:Number,require:true} 
},{versionKey:false});



xiaomiSquema.methods.pruductExit = async function(nombre){
  const result = await mongoose.model("Xiaomi").find({ nombre:nombre });
  return result.length > 0;
}

module.exports = mongoose.model("Xiaomi",xiaomiSquema);