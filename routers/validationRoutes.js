// src/routes/validationRoutes.js
import express from "express";
import { TutorController } from "../src/interface-adapters/controllers/TutorController.js";
import { ValidationRepository } from "../src/application/repositories/ValidationRepository.js";
import { ValidateTutorDocument } from "../src/application/use-cases/tutor/ValidateTutorDocument.js";
import { DeleteTutorValidation } from "../src/application/use-cases/tutor/DeleteTutorValidation.js";

const router = express.Router();
const validationRepo = new ValidationRepository();
const controller = new TutorController(
  null,
  null,
  new ValidateTutorDocument(validationRepo),
  new DeleteTutorValidation(validationRepo)
);

router.post("/", controller.validateDocument.bind(controller));
router.delete("/", controller.deleteValidation.bind(controller));

export default router;