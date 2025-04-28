import express from "express"
import { createOrder } from "../controllers/orderControllers.js"

const orderRoute = express.Router()

orderRoute.post("/",createOrder)

export default orderRoute