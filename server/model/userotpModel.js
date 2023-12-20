const mongoose=require('mongoose')



// mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    otp:{
        type:Number,
        required:true,
    },
    expiry:{
        type:Date,
        // required:true
    }
})

// schema.index({ expiry: 1 }, { expireAfterSeconds: 120*1000 });
const userotp=new mongoose.model("userotps",schema)

module.exports=userotp