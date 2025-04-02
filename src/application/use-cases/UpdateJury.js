export class UpdateJury {
    constructor(juryRepository) {
      this.juryRepository = juryRepository;
    }
  
    async execute(idJury, nom) {
      if (!nom) throw new Error("Nom is required");
      const success = await this.juryRepository.update(idJury, nom);
      if (!success) throw new Error("Jury not found");
      return { message: "Jury updated successfully" };
    }
  }