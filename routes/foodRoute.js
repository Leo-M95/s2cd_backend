import express from "express";
import { addFood, deleteFood, getFood,} from "../controllers/foodControllers.js";

const foodRoute = express.Router();

foodRoute.post("/",addFood)
foodRoute.get("/search",getFood)
foodRoute.delete("/:productId",deleteFood)

export default foodRoute;