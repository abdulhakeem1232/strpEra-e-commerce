const mongoose=require('mongoose')
const Schema = mongoose.Schema;
const { category } = require('../controller/admin_controller')

mongoose.connect('mongodb://127.0.0.1/stepEras')

const schema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'categories', 
      required: true,
  },
  sub_category: {
      type: Schema.Types.ObjectId,
      ref: 'subcategories', 
      required: true,
  },
    price:{
        type:Number,
        required:true
    },
    images: {
    type:Array,
    required:true,
    },
    stock: [{
        size: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      }],
      status:{
        type:Boolean,
        default:true,
      },
    description:{
        type:String,
        required:true
    }
})


const productModel=new mongoose.model("products",schema)

module.exports=productModel