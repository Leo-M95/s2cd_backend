import express from "express";
import { registerUser, userLogin } from "../controllers/userControllers.js";

const userRoute = express.Router();

userRoute.post("/",registerUser);
userRoute.post("/login",userLogin)


export default userRoute;