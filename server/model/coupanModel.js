const mongoose=require('mongoose')

// mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema=new mongoose.Schema({
    coupancode:{
        type:String,
        required:true,
    },
    minprice:{
        type:Number,
        required:true,
    },
    discountpercentage:{
        type:Number,
        required:true,
        min:0,
        max:100,
    },
    expirydate:{
        type:Date,
        required:true,
    },
    status:{
        type:Boolean,
        required:true,
        default:true,
    },
})

schema.index({ expirydate: 1 }, { expireAfterSeconds: 0 });

const coupanModel=new mongoose.model("coupan",schema)

module.exports=coupanModel