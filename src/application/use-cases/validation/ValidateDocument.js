export class ValidateDocument {
    constructor(validationRepository) {
      this.validationRepository = validationRepository;
    }
  
    async execute({ idPFE, pfeLivrableId, idTuteur, idEncadrant, validationStatus, comment }) {
      const validation = { idPFE, pfeLivrableId, idTuteur, idEncadrant, validationStatus, comment };
      return await this.validationRepository.save(validation);
    }
  }