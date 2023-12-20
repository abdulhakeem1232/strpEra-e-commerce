const mongoose=require('mongoose')
const Schema = mongoose.Schema;


const schema=new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
    },
    address:[{
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        mobile:{
            type:Number,
            required:true
        },
        houseName:{
            type:String,
            required:true
        },
        street:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        country:{
            type:String,
            required:true
        },
        pincode:{
            type:String,
            required:true
        },
        save_as:{
            type:String,
            required:true
        },
    }],
   
})


const addressModel=new mongoose.model("address",schema)

module.exports=addressModel