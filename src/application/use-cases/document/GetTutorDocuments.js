// src/application/use-cases/document/GetTutorDocuments.js
export class GetTutorDocuments {
    constructor(documentRepository) {
      this.documentRepository = documentRepository;
    }
  
    async execute(idTuteur) {
      return await this.documentRepository.getTutorGroupDocuments(idTuteur);
    }
  }