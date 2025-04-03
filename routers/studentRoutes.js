// src/routers/studentRoutes.js
import express from "express";
import { StudentController } from "../src/interface-adapters/controllers/StudentController.js";
import { DocumentRepository } from "../src/application/repositories/DocumentRepository.js";
import { SoutenanceRepository } from "../src/application/repositories/SoutenanceRepository.js";
import { GetStudentDocuments } from "../src/application/use-cases/etu/GetStudentDocuments.js";
import { SubmitStudentDocuments } from "../src/application/use-cases/etu/SubmitStudentDocuments.js";
import { DeleteStudentDocument } from "../src/application/use-cases/etu/DeleteStudentDocument.js";
import { GetSoutenancesByGroup } from "../src/application/use-cases/etu/GetSoutenancesByGroup.js";

const router = express.Router();
const documentRepo = new DocumentRepository();
const soutenanceRepo = new SoutenanceRepository();

const controller = new StudentController(
  new GetStudentDocuments(documentRepo),
  new SubmitStudentDocuments(documentRepo),
  new DeleteStudentDocument(documentRepo),
  new GetSoutenancesByGroup(soutenanceRepo)
);

// Document routes
router.get("/documents", controller.getDocuments.bind(controller));
router.post("/submit-documents", controller.submitDocuments.bind(controller));
router.post("/delete-document", controller.deleteDocument.bind(controller));

// Soutenance routes
router.get("/group-only/:groupId", controller.getSoutenancesByGroup.bind(controller));

export default router;