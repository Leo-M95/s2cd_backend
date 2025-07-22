import express from "express";
import {
  addItem,
  getAllItems,
  updateItem,
} from "../controllers/itemControllers.js";

const itemRoute = express.Router();

itemRoute.post("/", addItem);
itemRoute.get("/", getAllItems);
itemRoute.put("/:itemId", updateItem);

export default itemRoute;
