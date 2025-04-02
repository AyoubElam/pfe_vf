export class GetAllJurys {
    constructor(juryRepository) {
      this.juryRepository = juryRepository;
    }
  
    async execute() {
      return await this.juryRepository.getAll();
    }
  }