// src/application/use-cases/evaluation/SaveEvaluation.js
import { Evaluation } from "../../../entities/models/Evaluation.js";

export class SaveEvaluation {
  /**
   * @param {EvaluationRepository} evaluationRepository 
   */
  constructor(evaluationRepository) {
    this.evaluationRepository = evaluationRepository;
  }

  /**
   * @param {{
   *   idSoutenance: number,
   *   idEtudiant: string,
   *   idGroupe: number,
   *   idEncadrant: string,
   *   noteRapport?: number|null,
   *   notePresentation?: number|null,
   *   noteDiscussion?: number|null,
   *   noteSavoirFaireSavoirEtre?: number|null,
   *   remarque?: string
   * }} evaluationData
   */
  async execute(evaluationData) {
    this.validateGrades(evaluationData);

    const evaluation = new Evaluation(
      evaluationData.idSoutenance,
      evaluationData.idEtudiant,
      evaluationData.idGroupe,
      evaluationData.idEncadrant,
      evaluationData.noteRapport,
      evaluationData.notePresentation,
      evaluationData.noteDiscussion,
      evaluationData.noteSavoirFaireSavoirEtre,
      null, // noteTotale will be calculated
      evaluationData.remarque
    );

    // Calculate and set total
    evaluation.noteTotale = evaluation.calculateTotal();

    await this.evaluationRepository.save(evaluation);
    return evaluation;
  }

  /**
   * Validate all grade fields
   * @private
   */
  validateGrades({ 
    noteRapport, 
    notePresentation, 
    noteDiscussion, 
    noteSavoirFaireSavoirEtre 
  }) {
    const validate = (grade, fieldName) => {
      if (grade !== undefined && grade !== null) {
        if (isNaN(grade)) {
          throw new Error(`${fieldName} must be a number`);
        }
        if (grade < 0 || grade > 20) {
          throw new Error(`${fieldName} must be between 0 and 20`);
        }
      }
    };

    validate(noteRapport, "noteRapport");
    validate(notePresentation, "notePresentation");
    validate(noteDiscussion, "noteDiscussion");
    validate(noteSavoirFaireSavoirEtre, "noteSavoirFaireSavoirEtre");
  }
}