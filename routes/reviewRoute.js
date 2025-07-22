import express from "express";
import { submitReview, viewReview } from "../controllers/reviewController.js";

const reviewRoute = express.Router();

reviewRoute.post("/", submitReview);
reviewRoute.get("/", viewReview);

export default reviewRoute;
