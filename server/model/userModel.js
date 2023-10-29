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
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone_no:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    }
})


const userModel=new mongoose.model("users",schema)

module.exports=userModel