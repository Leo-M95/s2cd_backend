import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUser,
  loginWithGoogle,
  registerUser,
  userLogin,
} from "../controllers/userControllers.js";

const userRoute = express.Router();

userRoute.post("/", registerUser);
userRoute.get("/", getAllUsers);
userRoute.post("/login", userLogin);
userRoute.get("/access", getUser);
userRoute.post("/google/login", loginWithGoogle);
userRoute.delete("/:email", deleteUser);

export default userRoute;
