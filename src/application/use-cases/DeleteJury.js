export class DeleteJury {
    constructor(juryRepository) {
      this.juryRepository = juryRepository;
    }
  
    async execute(idJury) {
      if (!idJury) throw new Error("idJury is required");
      const success = await this.juryRepository.delete(idJury);
      if (!success) throw new Error("Jury not found");
      return { message: "Jury deleted successfully" };
    }
  }