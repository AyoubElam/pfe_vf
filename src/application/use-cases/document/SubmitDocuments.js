export class SubmitDocuments {
    constructor(documentRepository) {
      this.documentRepository = documentRepository;
    }
  
    async execute({ idPFE, idEtudiant, idGroupe, files }) {
      return await this.documentRepository.save({ idPFE, idEtudiant, idGroupe, files });
    }
  }