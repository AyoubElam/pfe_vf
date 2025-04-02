/* eslint-disable @typescript-eslint/no-unused-vars */
// src/interface-adapters/controllers/LivrableController.js
import PFELivrableRepository from "../../application/repositories/PfeLivrableRepository";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export default class LivrableController {
  constructor() {
    this.pfeLivrableRepository = new PFELivrableRepository();
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, "uploads/"),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
      },
    });
    
    this.upload = multer({ storage });
  }
  
  getUploadMiddleware() {
    return this.upload.array("files");
  }
  
  async getDocuments(req, res) {
    const { idEtudiant } = req.query;
    
    if (!idEtudiant) {
      return res.status(400).send("Missing idEtudiant");
    }
    
    try {
      const documents = await this.pfeLivrableRepository.findByEtudiant(idEtudiant);
      res.json(documents);
    } catch (err) {
      console.error("Error fetching documents:", err);
      res.status(500).send(`Server error: ${err.message}`);
    }
  }
  
  async submitDocuments(req, res) {
    const { idEtudiant, idGroupe } = req.body;
    const files = req.files;
    
    if (!idEtudiant || !idGroupe || !files || files.length === 0) {
      return res.status(400).send("Missing required fields or files");
    }
    
    try {
      const promises = files.map(file => 
        this.pfeLivrableRepository.create({ idGroupe }, file, idEtudiant)
      );
      
      await Promise.all(promises);
      res.send("Documents submitted successfully.");
    } catch (err) {
      console.error("Error submitting documents:", err);
      
      if (err.message === "Unauthorized") {
        return res.status(403).send("Unauthorized");
      }
      
      if (err.message === "PFE not found") {
        return res.status(404).send("PFE not found");
      }
      
      res.status(500).send(`Server error: ${err.message}`);
    }
  }
  
  async deleteDocument(req, res) {
    const { idEtudiant, idPFE, id } = req.body;
    
    if (!idEtudiant || !idPFE || !id) {
      return res.status(400).send("Missing required fields");
    }
    
    try {
      await this.pfeLivrableRepository.delete(id, idPFE, idEtudiant);
      res.send("Document deleted successfully.");
    } catch (err) {
      console.error("Error deleting document:", err);
      
      if (err.message === "Unauthorized") {
        return res.status(403).send("Unauthorized");
      }
      
      if (err.message === "Document not found") {
        return res.status(404).send("Document not found");
      }
      
      res.status(500).send(`Server error: ${err.message}`);
    }
  }
}