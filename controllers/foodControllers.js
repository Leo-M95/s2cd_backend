import Food from "../models/food.js";
import { isAdmin } from "./userControllers.js";


//function to add food to the menu
export function addFood(req,res){
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

    const food = new Food(
        // productCategory:req.body.productCategory,
        // productId:req.body.productId,
        // productName:req.body.productName,
        // labeledPrice:req.body.labeledPrice,
        // price:req.body.price,
        // productImage:req.body.productImage,
        // prepTime:req.body.prepTime,
        // portion:req.body.portion,
        // mainIngredients:req.body.mainIngredients,
        // isAvailable:req.body.isAvailable 
        //replaced the above lines with below code
        req.body)

    food.save().then(
        ()=>{
            res.json({
                message:"Item added successfully"
            })
        }
    ).catch(
        ()=>{
            res.json({
                message:"Item wasn't added"
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