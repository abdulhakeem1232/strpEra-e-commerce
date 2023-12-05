const category=require('./server/model/categoryModel');
const userModel = require('./server/model/userModel');
constuserModel=require('./server/model/userModel')

const loadCategory=async(req,res,next)=>{
    try {
      res.locals.isAuth = req.session.isAuth || false;
        const categories = await category.find(); 
        res.locals.categories = categories; 
        next(); 
      } catch (error) {
       
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
      }
}
const iflooged=async(req,res,next)=>{
  if(req.session.isAuth){
    ('/')
  }else{
    next()
  }
}
const islogged = async (req, res, next) => {
  const user = await userModel.findOne({ _id: req.session.userId });
  if (req.session.isAuth ) {
    req.user = req.session.user;
    next();
  } else {
    res.redirect('/login');
  }
};



const isotp=async(req,res,next)=>{
  if(req.session.signup || req.session.forgot){
    req.user=req.session.user;
    next()
  }else{
    res.redirect('/')
  }
}

const adminifloged=async(req,res,next)=>{
  if(req.session.isAuth){
    ('/admin/dashboard')
  }else{
    next()
  }
}
const adminlogged=async(req,res,next)=>{
  if(req.session.isAuth){
    req.user=req.session.user;
    next()
  }else{
    res.redirect('/admin')
  }
}

const loggedout=async(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/')
  }
}

const isBlocked=async(req,res,next)=>{
  try{
    console.log('hjkhj');
  const user=await userModel.findOne({_id:req.session.userId})
  if(user.status){
    console.log(user.status,'vvv');
    res.redirect('/login')
  }
  else{
    next()
  }
}catch{
  res.redirect('/')
}
}


module.exports ={
    loadCategory,
    islogged,
    loggedout,
    iflooged,
    adminlogged,
    adminifloged,
    isotp,
    isBlocked,

}