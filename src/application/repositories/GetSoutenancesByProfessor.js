export class GetSoutenancesByProfessor {
    constructor(soutenanceRepository) {
      this.soutenanceRepository = soutenanceRepository;
    }
  
    async execute(idEncadrant) {
      return await this.soutenanceRepository.findByProfessorId(idEncadrant);
    }
  }