const mongoose = require("mongoose");

const XiaomiAcesorySquema =new mongoose.Schema({
    id:{type:Object},
    nombre:{type:String,require:true,unique:true},
    precio:{type:Number,require:true,},
    cantidaDisponible:{type:Number,require:true},
    descri:{type:String,require:true},
    image: {type: String,require:true},
    cantida:{type:Number,require:true} 
},{versionKey:false});



XiaomiAcesorySquema.methods.pruductExit = async function(nombre){
  const result = await mongoose.model("xiaomiAccesory").find({ nombre:nombre });
  return result.length > 0;
}

module.exports = mongoose.model("xiaomiAccesory",XiaomiAcesorySquema);