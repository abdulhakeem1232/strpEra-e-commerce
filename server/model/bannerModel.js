const mongoose=require('mongoose')
const Schema = mongoose.Schema;

const schema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    subtitle:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    url:{
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