export class GetStudentDocuments {
    constructor(documentRepository) {
      this.documentRepository = documentRepository;
    }
  
    async execute(idEtudiant) {
      return await this.documentRepository.findByStudentId(idEtudiant);
    }
  }