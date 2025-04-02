import express from "express";
import { JuryController } from "../src/interface-adapters/controllers/JuryController.js";

const router = express.Router();
const juryController = new JuryController();

router.get("/", (req, res) => juryController.getAll(req, res));
router.post("/", (req, res) => juryController.create(req, res));
router.put("/:idJury", (req, res) => juryController.update(req, res));
router.delete("/:idJury", (req, res) => juryController.delete(req, res));

export default router;