const mongoose=require('mongoose')
const Schema = mongoose.Schema;

mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    subtitle:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    },



})
    
        
    

const bannerModel=new mongoose.model("banner",schema)

module.exports=bannerModel