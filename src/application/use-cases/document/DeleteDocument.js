export class DeleteDocument {
    constructor(documentRepository) {
      this.documentRepository = documentRepository;
    }
  
    async execute(idPFE, id) {
      return await this.documentRepository.delete(idPFE, id);
    }
  }