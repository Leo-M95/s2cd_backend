import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js"; 
import jwtGenerator from "./controllers/jwtGenerator.js";
import foodRoute from "./routes/foodRoute.js";
import orderRoute from "./routes/orderRoute.js";
import dotenv from "dotenv";
import cors from "cors";
import itemRoute from "./routes/itemRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import mediaRouter from "./routes/mediaRoute.js";
import path from "path";
dotenv.config();

const app = express();
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(() => {
    console.log("Database connection failed");
  });

app.use(bodyParser.json());
app.use(jwtGenerator);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/user", userRoute);
app.use("/api/food", foodRoute);
app.use("/api/order", orderRoute);
app.use("/api/item", itemRoute);
app.use("/api/review", reviewRoute);
app.use("/api/media", mediaRouter);

app.listen(5000, () => {
  console.log("Server connected on port 5000");
});
