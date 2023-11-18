const mongoose=require('mongoose')
const Schema = mongoose.Schema;

mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema=new mongoose.Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
    },
    address:[{
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
        pincode:{
            type:String,
            required:true
        },
    }],
})


const addressModel=new mongoose.model("address",schema)

module.exports=addressModel