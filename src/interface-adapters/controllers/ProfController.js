/* eslint-disable @typescript-eslint/no-unused-vars */
// src/controllers/ProfController.js
import { GetProfDocuments } from "../../application/use-cases/prof/GetProfDocuments.js";
import { ValidateProfDocument } from "../../application/use-cases/prof/ValidateProfDocument.js";
import { DeleteProfValidation } from "../../application/use-cases/prof/DeleteProfValidation.js";
import { GetSoutenancesByEncadrant } from "../../application/use-cases/prof/GetSoutenancesByEncadrant.js";
export class ProfController {
    constructor(
        getProfDocuments,
        validateProfDocument,
        deleteProfValidation,
        getSoutenancesByEncadrantUseCase
      ) {
        this.getProfDocuments = getProfDocuments;
        this.validateProfDocument = validateProfDocument;
        this.deleteProfValidation = deleteProfValidation;
        this.getSoutenancesByEncadrantUseCase = getSoutenancesByEncadrantUseCase;
    
        // Auto-bind all methods
        const methods = [
          'getDocuments',
          'validateDocument',
          'deleteValidation',
          'getSoutenancesByEncadrant'
        ];
        methods.forEach(method => {
          if (this[method]) {
            this[method] = this[method].bind(this);
          }
        });
      }
    

  async getDocuments(req, res) {
    const { idEncadrant } = req.query;
    try {
      const documents = await this.getProfDocuments.execute(idEncadrant);
      res.json(documents);
    } catch (err) {
      console.error("Error fetching documents:", err);
      res.status(err.message === "Missing idEncadrant parameter" ? 400 : 500).json({
        error: err.message === "Missing idEncadrant parameter" ? err.message : "Server error",
        details: err.message
      });
    }
  }

  async validateDocument(req, res) {
    const { idPFE, pfeLivrableId, idEncadrant, validationStatus, comment } = req.body;
    console.log("Received validation request:", req.body);
    try {
      const result = await this.validateProfDocument.execute({ 
        idPFE, 
        pfeLivrableId, 
        idEncadrant, 
        validationStatus, 
        comment 
      });
      res.json({
        message: result.affectedRows > 0
          ? (result.insertId ? "Validation created successfully" : "Validation updated successfully")
          : "No changes made"
      });
    } catch (err) {
      console.error("Validation insert/update error:", err);
      res.status(err.message === "Missing required fields" ? 400 : 500).json({ 
        error: `Server error: ${err.message}` 
      });
    }
  }

  async deleteValidation(req, res) {
    const { idPFE, pfeLivrableId, idEncadrant } = req.query;
    try {
      const result = await this.deleteProfValidation.execute({ 
        idPFE, 
        pfeLivrableId, 
        idEncadrant 
      });
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

  async getSoutenancesByEncadrant(req, res) {
    try {
      const { idEncadrant } = req.params;
      const { year } = req.query;
      
      if (!idEncadrant) {
        return res.status(400).json({ error: "Missing idEncadrant parameter" });
      }
  
      const soutenances = await this.getSoutenancesByEncadrantUseCase.execute(
        idEncadrant, 
        year
      );
      
      res.json(soutenances || []);
    } catch (err) {
      console.error("Error fetching soutenances:", err);
      res.status(500).json({ 
        error: "Failed to fetch soutenances",
        details: err.message 
      });
    }
  }
}