// src/routers/tutorRoutes.js
import express from "express";
import { TutorController } from "../src/interface-adapters/controllers/TutorController.js";
import { SoutenanceRepository } from "../src/application/repositories/SoutenanceRepository.js";
import { DocumentRepository } from "../src/application/repositories/DocumentRepository.js"
import { GetTutorSoutenances } from "../src/application/use-cases/tutor/GetTutorSoutenances.js";
import { GetTutorGroupDocuments } from "../src/application/use-cases/tutor/GetTutorGroupDocuments.js";

const router = express.Router();
const soutenanceRepo = new SoutenanceRepository();
const documentRepo = new DocumentRepository();
const controller = new TutorController(
  new GetTutorSoutenances(soutenanceRepo),
  new GetTutorGroupDocuments(documentRepo),
  null,
  null
);

// Updated routes
router.get("/soutenances/tuteur/:idTuteur", controller.getSoutenances.bind(controller));
router.get("/group-documents", controller.getGroupDocuments.bind(controller)); // Keep this as is

export default router;