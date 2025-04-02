// src/interface-adapters/controllers/TuteurDocumentController.js
import PFELivrableRepository from "../../application/repositories/PfeLivrableRepository.js";
import ValidationCommentRepository from "../../application/repositories/ValidationCommentRepository.js";

export default class TuteurDocumentController {
  constructor() {
    this.pfeLivrableRepository = new PFELivrableRepository();
    this.validationCommentRepository = new ValidationCommentRepository();
  }
  
  async getGroupDocuments(req, res) {
    const { idTuteur } = req.query;
    
    if (!idTuteur) {
      return res.status(400).json({ error: "Missing idTuteur parameter" });
    }
    
    try {
      const documents = await this.pfeLivrableRepository.findByTuteur(idTuteur);
      res.json(documents);
    } catch (err) {
      console.error("Error fetching documents:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
  
  async validateDocument(req, res) {
    const { idPFE, pfeLivrableId, idTuteur, validationStatus, comment } = req.body;
    
    if (!idPFE || !pfeLivrableId || !idTuteur || !validationStatus) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
      const result = await this.validationCommentRepository.createOrUpdateByTuteur({
        idPFE, 
        pfeLivrableId, 
        idTuteur, 
        validationStatus, 
        comment
      });
      
      res.json({
        message: result.success 
          ? (result.isNew ? "Validation created successfully" : "Validation updated successfully") 
          : "No changes made",
      });
    } catch (err) {
      console.error("Validation insert/update error:", err);
      res.status(500).json({ error: `Server error: ${err.message}` });
    }
  }
  
  async deleteValidation(req, res) {
    const { idPFE, pfeLivrableId, idTuteur } = req.query;
    
    if (!idPFE || !pfeLivrableId || !idTuteur) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    try {
      const result = await this.validationCommentRepository.deleteByTuteur(idPFE, pfeLivrableId, idTuteur);
      
      if (!result.success) {
        return res.status(404).json({ message: "Validation not found" });
      }
      
      return res.json({ message: "Validation deleted successfully" });
    } catch (err) {
      console.error("Error deleting validation:", err);
      res.status(500).json({ error: "Server error", details: err.message });
    }
  }
}