const mongoose=require('mongoose')
const Schema = mongoose.Schema;

mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    sessionId:String,
    item:[{
        productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products',
        required:true,
        },
        stock:{
            type:String,
            required:true,
        },
        size:{
            type:String,
            required:true,
        },
        quantity:{
            type:Number,
            required:true,
        },
        price:{
            type:Number,
            required:true
        },
        total:{
            type:Number,
            required:true
        }
    },
    ],
    total:Number
}, { strictPopulate: false });


const cartModel=new mongoose.model("cart",schema)

module.exports=cartModel