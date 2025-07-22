import express from "express";
import {
  uploadMedia,
  uploadMiddleware,
} from "../controllers/mediaController.js";

const mediaRouter = express.Router();

mediaRouter.post("/upload", uploadMiddleware, uploadMedia);

export default mediaRouter;
