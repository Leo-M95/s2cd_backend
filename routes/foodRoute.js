import express from "express";
import {
  addFood,
  availabilityUpdate,
  deleteFood,
  getAllFoods,
  getFood,
  getFoodById,
  updateFood,
} from "../controllers/foodControllers.js";

const foodRoute = express.Router();

foodRoute.post("/", addFood);
foodRoute.get("/", getAllFoods);
foodRoute.get("/search", getFood);
foodRoute.delete("/:productId", deleteFood);
foodRoute.put("/:productId", updateFood);
foodRoute.get("/:productId", getFoodById);
foodRoute.patch("/:productId/availability", availabilityUpdate);

export default foodRoute;
