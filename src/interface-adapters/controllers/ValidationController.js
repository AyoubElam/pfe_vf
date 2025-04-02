import { ValidateDocument } from "../../application/use-cases/validation/ValidateDocument.js";

export class ValidationController {
  constructor(validationRepository) {
    this.validateDocument = new ValidateDocument(validationRepository);
  }

  async validateDoc(req, res) {
    try {
      const { idPFE, pfeLivrableId, idTuteur, idEncadrant, validationStatus, comment } = req.body;
      const result = await this.validateDocument.execute({
        idPFE,
        pfeLivrableId,
        idTuteur,
        idEncadrant,
        validationStatus,
        comment,
      });
      res.status(200).json({ message: "Document validated", result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}