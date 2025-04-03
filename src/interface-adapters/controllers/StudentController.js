/* eslint-disable @typescript-eslint/no-unused-vars */
import multer from "multer";
import path from "path";
import { GetStudentDocuments } from "../../application/use-cases/etu/GetStudentDocuments.js";
import { SubmitStudentDocuments } from "../../application/use-cases/etu/SubmitStudentDocuments.js";
import { DeleteStudentDocument } from "../../application/use-cases/etu/DeleteStudentDocument.js";
import { GetSoutenancesByGroup } from "../../application/use-cases/etu/GetSoutenancesByGroup.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

export class StudentController {
  constructor(getStudentDocuments, submitStudentDocuments, deleteStudentDocument, getSoutenancesByGroup) {
    this.getStudentDocuments = getStudentDocuments;
    this.submitStudentDocuments = submitStudentDocuments;
    this.deleteStudentDocument = deleteStudentDocument;
    this.getSoutenancesByGroupUseCase = getSoutenancesByGroup;
    this.upload = upload;
  }

  async getDocuments(req, res) {
    const { idEtudiant } = req.query;
    try {
      const documents = await this.getStudentDocuments.execute(idEtudiant);
      res.json(documents);
    } catch (err) {
      res.status(err.message === "Missing idEtudiant" ? 400 : 500).send(`Server error: ${err.message}`);
    }
  }

  async submitDocuments(req, res) {
    this.upload.array("files")(req, res, async (err) => {
      if (err) return res.status(500).send(`Server error: ${err.message}`);
      const { idEtudiant, idGroupe } = req.body;
      const files = req.files;
      try {
        await this.submitStudentDocuments.execute({ idEtudiant, idGroupe, files });
        res.send("Documents submitted successfully.");
      } catch (err) {
        res.status(err.message === "Missing required fields or files" ? 400 : 500).send(`Server error: ${err.message}`);
      }
    });
  }

 // In StudentController.js - update the deleteDocument method
async deleteDocument(req, res) {
    const { idEtudiant, idPFE, id } = req.body;
    try {
      const result = await this.deleteStudentDocument.execute({ idEtudiant, idPFE, id });
      res.json(result);
    } catch (err) {
      console.error("❌ Error deleting document:", err);
      res.status(err.message.includes("Unauthorized") ? 403 : 
          err.message.includes("not found") ? 404 : 500)
         .json({ error: err.message || "Failed to delete document" });
    }
  }

  async getSoutenancesByGroup(req, res) {
    const { groupId } = req.params;
    try {
      const soutenances = await this.getSoutenancesByGroupUseCase.execute(groupId);
      res.json(soutenances);
    } catch (err) {
      console.error("❌ Error fetching soutenances:", err);
      res.status(err.message === "Missing groupId" ? 400 : 500).json({ error: err.message || "Server error" });
    }
  }
}