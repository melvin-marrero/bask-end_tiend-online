const mongoose = require("mongoose");

const sansungAcesoySquema =new mongoose.Schema({
    nombre:{type:String,require:true,unique:true},
    precio:{type:Number,require:true,},
    cantidaDisponible:{type:Number,require:true},
    descri:{type:String,require:true},
    image: {type: String,require:true},
    cantida:{type:Number,require:true} 
},{versionKey:false});



sansungAcesoySquema.methods.pruductExit = async function(nombre){
  const result = await mongoose.model("SansungAccesory").find({ nombre:nombre });
  return result.length > 0;
}

module.exports = mongoose.model("SansungAccesory",sansungAcesoySquema);