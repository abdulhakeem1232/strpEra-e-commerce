const mongoose=require('mongoose')
const Schema = mongoose.Schema;

// mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required: true,
    },
   
    item:[{
        productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products',
        required:true,
        },
    }   
    ],
})


const favModel=new mongoose.model("fav",schema)

module.exports=favModel