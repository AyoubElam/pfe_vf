import { GetStudentDocuments } from "../../application/use-cases/document/GetStudentDocuments.js";
import { SubmitDocuments } from "../../application/use-cases/document/SubmitDocuments.js";
import { DeleteDocument } from "../../application/use-cases/document/DeleteDocument.js";
import { GetProfessorDocuments } from "../../application/use-cases/document/GetProfessorDocuments.js"
import { GetTutorDocuments } from "../../application/use-cases/document/GetTutorDocuments.js";

export class DocumentController {
  constructor(documentRepository) {
    this.getStudentDocuments = new GetStudentDocuments(documentRepository);
    this.submitDocuments = new SubmitDocuments(documentRepository);
    this.deleteDocument = new DeleteDocument(documentRepository);
    this.getProfessorDocuments = new GetProfessorDocuments(documentRepository);
    this.getTutorDocuments = new GetTutorDocuments(documentRepository);
  }

  async getStudentDocs(req, res) {
    try {
      const { idEtudiant } = req.query;
      const documents = await this.getStudentDocuments.execute(idEtudiant);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async submitDocs(req, res) {
    try {
      const { idEtudiant, idGroupe, idPFE } = req.body;
      const files = req.files;
      if (!files || files.length < 2) {
        return res.status(400).json({ error: "Two files are required" });
      }
      const documents = await this.submitDocuments.execute({ idPFE, idEtudiant, idGroupe, files });
      res.status(201).json(documents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteDoc(req, res) {
    try {
      const { idPFE, id } = req.body;
      const success = await this.deleteDocument.execute(idPFE, id);
      if (success) res.status(200).json({ message: "Document deleted" });
      else res.status(404).json({ error: "Document not found" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProfessorDocs(req, res) {
    try {
      const { idEncadrant } = req.query;
      const documents = await this.getProfessorDocuments.execute(idEncadrant);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTutorDocs(req, res) {
    try {
      const { idTuteur } = req.query;
      const documents = await this.getTutorDocuments.execute(idTuteur);
      res.status(200).json(documents);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}