import Food from "../models/food.js";
import { isAdmin } from "./userControllers.js";


//function to add food to the menu
export async function addFood(req,res){
    // if (req.user==null) {
    //     res.status(403).json({
    //         message:"Unauthorized Access"
    //     })
    //     return
    // }
    // if (req.user.role!="admin") {
    //     res.status(403).json({
    //         message:"You are not an admin"
    //     })
    //     return
    // }
    // replaced the above code with the below fuction for covenient repetation
    if (!isAdmin(req)){
        res.status(403).json({
                message:"You don't have authorization to add products"
        })
        return
    }

    async function results(req) {
        let isUnique = false;
        let newId;

      
        while (!isUnique) {
          const prefix = req.body.productCategory?.slice(0, 2).toUpperCase() || 'PR';
          const randomNum = Math.floor(1000 + Math.random() * 9000);
          newId = `${prefix}${randomNum}`;
          console.log(newId)
          const existing = await Food.findOne({ productId: newId })
          if (!existing) isUnique = true;
        }
      
        return newId;
      }; 

    const productId= await results(req)
    const food = new Food({
        productCategory:req.body.productCategory,
        productId:productId,
        productName:req.body.productName,
        labeledPrice:req.body.labeledPrice,
        price:req.body.price,
        productImage:req.body.productImage,
        prepTime:req.body.prepTime,
        portion:req.body.portion,
        mainIngredients:req.body.mainIngredients,
        isAvailable:req.body.isAvailable 
})

    food.save().then(
        ()=>{
            res.json({
                message:"Item added successfully"
            })
        }
    ).catch(
        (err)=>{
            res.json({
                message:"Item wasn't added",
                error:err.message
            })
        }
    )

}

//function to search food

export async function getFood(req,res){
const searchedFood = req.body.productName
try {
    const foods = await Food.find({
        name:{$regex:searchedFood,$options:'i'}
    });
    res.json(foods)
} catch (error) {
    res.status(404).json(error)
}
}

//delete food

export async function deleteFood(req,res){
    if (!isAdmin(req)){
        res.status(403).json({
            message:"You don't have the authorization to delete a product"
        })
        return
    }
    try {
        await Product.deleteOne({productId:req.params.productId})
        res.json({
            message:"Product deleted successfully"
        })
    } catch (error) {
        res.status(500).json({
            message:"Failed to delete product",
            error:error
        })
        
    }
}






       
            
            
        
 