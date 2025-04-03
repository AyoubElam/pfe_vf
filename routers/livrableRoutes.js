// livrableRoutes.js
import express from "express";
import { LivrableController } from "../controllers/LivrableController.js";

const router = express.Router();
const controller = new LivrableController(/* dependencies */);

router.get("/documents", controller.getDocuments.bind(controller));
// Add other livrable-related routes

export default router;