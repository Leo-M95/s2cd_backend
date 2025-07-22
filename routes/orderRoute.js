import express from "express";
import {
  cancelOrder,
  createOrder,
  getDailyOrderSummary,
  getOrderById,
  getUserCurrentOrder,
  markTableChecked,
  orderHistory,
  paymentStatusUpdate,
  updateOrder,
  updateProgress,
  updateServedStatus,
  viewOrder,
  viewPaymentStatus,
} from "../controllers/orderControllers.js";

const orderRoute = express.Router();

orderRoute.post("/", createOrder);
orderRoute.get("/", viewOrder);
orderRoute.put("/", updateOrder);
orderRoute.get("/history", orderHistory);
orderRoute.get("/daily-summary", getDailyOrderSummary);
orderRoute.get("/payment", viewPaymentStatus);
orderRoute.put("/table-check", markTableChecked);
orderRoute.put("/served", updateServedStatus);
orderRoute.put("/progress", updateProgress);
orderRoute.get("/mycurrent", getUserCurrentOrder);
orderRoute.post("/cancel", cancelOrder);
orderRoute.get("/:orderId", getOrderById);
orderRoute.patch("/:orderId/paymentStatus", paymentStatusUpdate);

export default orderRoute;
