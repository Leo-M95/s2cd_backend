import express from "express";
import { addFood, deleteFood, getFood, getFoodById, updateFood,} from "../controllers/foodControllers.js";

const foodRoute = express.Router();

foodRoute.post("/",addFood)
foodRoute.get("/search",getFood)
foodRoute.delete("/:productId",deleteFood)
foodRoute.put("/:productId",updateFood)
foodRoute.get("/:productId",getFoodById)
export default foodRoute;