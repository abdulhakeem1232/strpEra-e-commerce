const mongoose=require('mongoose')
const Schema = mongoose.Schema;

// mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
   
    history:[{
       
        transaction:{
            type:String,
            required:true,
        },
        amount:{
            type:Number,
            required:true,
        },
        date:{
            type:Date,
            required:true,
        },   
    },
    ],

});


const walletModel=new mongoose.model("wallet",schema)

module.exports=walletModel