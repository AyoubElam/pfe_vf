/* eslint-disable @typescript-eslint/no-unused-vars */
// src/controllers/TutorController.js
import { GetTutorSoutenances } from "../../application/use-cases/tutor/GetTutorSoutenances.js";
import { GetTutorGroupDocuments } from "../../application/use-cases/tutor/GetTutorGroupDocuments.js";
import { ValidateTutorDocument } from "../../application/use-cases/tutor/ValidateTutorDocument.js";
import { DeleteTutorValidation } from "../../application/use-cases/tutor/DeleteTutorValidation.js";

export class TutorController {
  constructor(getTutorSoutenances, getTutorGroupDocuments, validateTutorDocument, deleteTutorValidation) {
    this.getTutorSoutenances = getTutorSoutenances;
    this.getTutorGroupDocuments = getTutorGroupDocuments;
    this.validateTutorDocument = validateTutorDocument;
    this.deleteTutorValidation = deleteTutorValidation;
  }

  async getSoutenances(req, res) {
    const { idTuteur } = req.params;
    try {
      const soutenances = await this.getTutorSoutenances.execute(idTuteur);
      res.json(soutenances);
    } catch (err) {
      console.error("Error fetching soutenances:", err);
      res.status(err.message === "Missing idTuteur" ? 400 : 500).json({
        error: err.message === "Missing idTuteur" ? err.message : "Internal server error",
        message: err.message
      });
    }
  }

  async getGroupDocuments(req, res) {
    const { idTuteur } = req.query;
    try {
      const documents = await this.getTutorGroupDocuments.execute(idTuteur);
      res.json(documents);
    } catch (err) {
      console.error("Error fetching documents:", err);
      res.status(err.message === "Missing idTuteur parameter" ? 400 : 500).json({
        error: err.message === "Missing idTuteur parameter" ? err.message : "Server error",
        details: err.message
      });
    }
  }

  async validateDocument(req, res) {
    const { idPFE, pfeLivrableId, idTuteur, validationStatus, comment } = req.body;
    console.log("Received validation request:", req.body);
    try {
      const result = await this.validateTutorDocument.execute({ idPFE, pfeLivrableId, idTuteur, validationStatus, comment });
      res.json({
        message: result.affectedRows > 0
          ? (result.insertId ? "Validation created successfully" : "Validation updated successfully")
          : "No changes made"
      });
    } catch (err) {
      console.error("Validation insert/update error:", err);
      res.status(err.message === "Missing required fields" ? 400 : 500).json({ error: `Server error: ${err.message}` });
    }
  }

  async deleteValidation(req, res) {
    const { idPFE, pfeLivrableId, idTuteur } = req.query;
    try {
      const result = await this.deleteTutorValidation.execute({ idPFE, pfeLivrableId, idTuteur });
      res.json({
        message: result.affectedRows > 0 ? "Validation deleted successfully" : "Validation not found"
      });
    } catch (err) {
      console.error("Error deleting validation:", err);
      res.status(err.message === "Missing required fields" ? 400 : 500).json({
        error: "Server error",
        details: err.message
      });
    }
  }
}