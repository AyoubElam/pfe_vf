// src/application/use-cases/evaluation/GetEvaluationsByEncadrant.js
export class GetEvaluationsByEncadrant {
    constructor(evaluationRepository) {
      this.evaluationRepository = evaluationRepository;
    }
  
    async execute(idEncadrant) {
      if (!idEncadrant) throw new Error("idEncadrant is required");
      return this.evaluationRepository.getByEncadrant(idEncadrant);
    }
  }