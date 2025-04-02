export class GetProfessorDocuments {
    constructor(documentRepository) {
      this.documentRepository = documentRepository;
    }
  
    async execute(idEncadrant) {
      return await this.documentRepository.findByProfessorId(idEncadrant);
    }
  }