export class CreateJury {
    constructor(juryRepository) {
      this.juryRepository = juryRepository;
    }
  
    async execute(nom) {
      if (!nom) throw new Error("Nom is required");
      return await this.juryRepository.create(nom);
    }
  }