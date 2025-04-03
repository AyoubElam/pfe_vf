/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { SoutenancePdfRepository } from "../src/application/repositories/SoutenancePdfRepository.js";
import { PDFService } from "../src/infrastructure/services/PDFService.js";
import { GenerateSoutenancePdf } from "../src/application/use-cases/prof/GenerateSoutenancePdf.js";

const router = express.Router();

// Initialize repositories and services
const documentRepo = new DocumentRepository();
const validationRepo = new ValidationRepository();
const soutenanceRepo = new SoutenanceRepository();
const soutenancePdfRepo = new SoutenancePdfRepository();
const pdfService = new PDFService(); // Define this first

// Initialize use cases
const getProfDocuments = new GetProfDocuments(documentRepo);
const validateProfDocument = new ValidateProfDocument(validationRepo);
const deleteProfValidation = new DeleteProfValidation(validationRepo);
const getSoutenancesByEncadrant = new GetSoutenancesByEncadrant(soutenanceRepo);
const generateSoutenancePdfUseCase = new GenerateSoutenancePdf(soutenancePdfRepo, pdfService); // Single instance

// Initialize controller
const controller = new ProfController(
  getProfDocuments,
  validateProfDocument,
  deleteProfValidation,
  getSoutenancesByEncadrant,
  generateSoutenancePdfUseCase // Pass the correct instance
);

// Routes
router.get("/documents", controller.getDocuments);
router.post("/documents/validate", controller.validateDocument);
router.delete("/documents/validate", controller.deleteValidation);
router.get("/encadrant/:idEncadrant/soutenances", controller.getSoutenancesByEncadrant);
router.get("/soutenances/:idSoutenance/pdf", controller.generateSoutenancePdf);

export default router;