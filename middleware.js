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




module.exports = {
    loadCategory,
}