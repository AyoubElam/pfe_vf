// src/routers/documentRouter.js
import express from "express";
import multer from "multer";
import path from "path";
import { DocumentRepository } from "../src/application/repositories/DocumentRepository.js";
import { GetProfDocuments } from "../src/application/use-cases/prof/GetProfDocuments.js";
import { GetTutorGroupDocuments } from "../src/application/use-cases/tutor/GetTutorGroupDocuments.js";
import { GetStudentDocuments } from "../src/application/use-cases/etu/GetStudentDocuments.js";
import { SubmitStudentDocuments } from "../src/application/use-cases/etu/SubmitStudentDocuments.js";
import { DeleteStudentDocument } from "../src/application/use-cases/etu/DeleteStudentDocument.js";

// Multer setup for file uploads (unchanged from previous work)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Controller for document operations
class DocumentController {
  constructor(
    getProfDocuments,
    getTutorGroupDocuments,
    getStudentDocuments,
    submitStudentDocuments,
    deleteStudentDocument
  ) {
    // Renamed properties with 'UseCase' suffix to avoid collision with methods
    this.getProfDocumentsUseCase = getProfDocuments;
    this.getTutorGroupDocumentsUseCase = getTutorGroupDocuments;
    this.getStudentDocumentsUseCase = getStudentDocuments;
    this.submitStudentDocumentsUseCase = submitStudentDocuments;
    this.deleteStudentDocumentUseCase = deleteStudentDocument;
    this.upload = upload;
  }

  async getProfDocuments(req, res) {
    const { idEncadrant } = req.query;
    try {
      // Updated to use the renamed property
      const documents = await this.getProfDocumentsUseCase.execute(idEncadrant);
      res.json(documents);
    } catch (err) {
      console.error("❌ Error fetching prof documents:", err);
      res.status(err.message === "Missing idEncadrant parameter" ? 400 : 500).json({
        error: err.message || "Server error",
      });
    }
  }

  async getTutorGroupDocuments(req, res) {
    const { idTuteur } = req.query;
    try {
      // Updated to use the renamed property
      const documents = await this.getTutorGroupDocumentsUseCase.execute(idTuteur);
      res.json(documents);
    } catch (err) {
      console.error("❌ Error fetching tutor group documents:", err);
      res.status(err.message === "Missing idTuteur parameter" ? 400 : 500).json({
        error: err.message || "Server error",
      });
    }
  }

  async getStudentDocuments(req, res) {
    const { idEtudiant } = req.query;
    try {
      // Updated to use the renamed property
      const documents = await this.getStudentDocumentsUseCase.execute(idEtudiant);
      res.json(documents);
    } catch (err) {
      console.error("❌ Error fetching student documents:", err);
      res.status(err.message === "Missing idEtudiant" ? 400 : 500).json({
        error: err.message || "Server error",
      });
    }
  }

  async submitStudentDocuments(req, res) {
    this.upload.array("files")(req, res, async (err) => {
      if (err) {
        console.error("❌ Upload error:", err);
        return res.status(500).json({ error: "Server error", details: err.message });
      }
      const { idEtudiant, idGroupe } = req.body;
      const files = req.files;
      try {
        // Updated to use the renamed property
        await this.submitStudentDocumentsUseCase.execute({ idEtudiant, idGroupe, files });
        res.json({ message: "Documents submitted successfully" });
      } catch (err) {
        console.error("❌ Error submitting documents:", err);
        res.status(err.message === "Missing required fields or files" ? 400 : 500).json({
          error: err.message || "Server error",
        });
      }
    });
  }

  async deleteStudentDocument(req, res) {
    const { idEtudiant, idPFE, id } = req.body;
    try {
      // Updated to use the renamed property
      await this.deleteStudentDocumentUseCase.execute({ idEtudiant, idPFE, id });
      res.json({ message: "Document deleted successfully" });
    } catch (err) {
      console.error("❌ Error deleting document:", err);
      res.status(err.message === "Missing required fields" ? 400 : 500).json({
        error: err.message || "Server error",
      });
    }
  }
}

// Router setup
const router = express.Router();
const documentRepo = new DocumentRepository();
const controller = new DocumentController(
  new GetProfDocuments(documentRepo),
  new GetTutorGroupDocuments(documentRepo),
  new GetStudentDocuments(documentRepo),
  new SubmitStudentDocuments(documentRepo),
  new DeleteStudentDocument(documentRepo)
);

// Routes
router.get("/prof", controller.getProfDocuments.bind(controller));          // GET /api/livrable/prof?idEncadrant=...
router.get("/tutor", controller.getTutorGroupDocuments.bind(controller));   // GET /api/livrable/tutor?idTuteur=...
router.get("/student", controller.getStudentDocuments.bind(controller));    // GET /api/livrable/student?idEtudiant=...
router.post("/submit", controller.submitStudentDocuments.bind(controller)); // POST /api/livrable/submit
router.post("/delete", controller.deleteStudentDocument.bind(controller));  // POST /api/livrable/delete

export default router;