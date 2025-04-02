import express from "express";
import { GroupController } from "../src/interface-adapters/controllers/GroupController.js";

const router = express.Router();
const groupController = new GroupController();

router.get("/", (req, res) => groupController.getAll(req, res));

export default router;