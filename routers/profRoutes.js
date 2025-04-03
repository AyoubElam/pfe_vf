// src/routes/profRoutes.js
import express from "express";
import { ProfController } from "../src/interface-adapters/controllers/ProfController.js";
import { DocumentRepository } from "../src/application/repositories/DocumentRepository.js";
import { ValidationRepository } from "../src/application/repositories/ValidationRepository.js";
import { SoutenanceRepository } from "../src/application/repositories/SoutenanceRepository.js";
import { GetProfDocuments } from "../src/application/use-cases/prof/GetProfDocuments.js";
import { ValidateProfDocument } from "../src/application/use-cases/prof/ValidateProfDocument.js";
import { DeleteProfValidation } from "../src/application/use-cases/prof/DeleteProfValidation.js";
import { GetSoutenancesByEncadrant } from "../src/application/use-cases/prof/GetSoutenancesByEncadrant.js";

const router = express.Router();

// Initialize repositories
const documentRepo = new DocumentRepository();
const validationRepo = new ValidationRepository();
const soutenanceRepo = new SoutenanceRepository();

// Initialize use cases
const getProfDocuments = new GetProfDocuments(documentRepo);
const validateProfDocument = new ValidateProfDocument(validationRepo);
const deleteProfValidation = new DeleteProfValidation(validationRepo);
const getSoutenancesByEncadrant = new GetSoutenancesByEncadrant(soutenanceRepo);

// Initialize controller
const controller = new ProfController(
  getProfDocuments,
  validateProfDocument,
  deleteProfValidation,
  getSoutenancesByEncadrant
);

// Routes
router.get("/documents", controller.getDocuments);  // More explicit
router.post("/documents/validate", controller.validateDocument);  // Consistent path
router.delete("/documents/validate", controller.deleteValidation);  // Consistent path
// Change the route to:
router.get("/encadrant/:idEncadrant/soutenances", controller.getSoutenancesByEncadrant);

export default router;