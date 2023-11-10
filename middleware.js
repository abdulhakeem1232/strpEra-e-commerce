const category=require('./server/model/categoryModel')

const loadCategory=async(req,res,next)=>{
    try {
        const categories = await category.find(); 
        res.locals.categories = categories; 
        next(); 
      } catch (error) {
       
        console.error('Error fetching categories:', error);
        res.status(500).send('Internal Server Error');
      }
}

const islogged=async(req,res,next)=>{
  if(req.session.isAuth){
    req.user=req.session.user;
    next()
  }else{
    res.redirect('/login')
  }
}
const loggedout=async(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/')
  }
}




module.exports = {
    loadCategory,
    islogged,
    loggedout

}