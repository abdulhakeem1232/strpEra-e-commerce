const mongoose=require('mongoose')
const bcyrpt= require('bcrypt')


mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema=new mongoose.Schema({
    f_name:{
        type:String,
        required:true,
    },
    l_name:{
        type:String,
        // required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone_no:{
        type:Number,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:false,
        required:true
    },
    session:{
        type:String,
    },
    status:{
        type:Boolean,
        default:false,
        required:true
    },
    wallet:{
        type:Number,
        default:0,
    }
})

const userModel=new mongoose.model("users",schema)

module.exports=userModel