// src/controllers/EvaluationController.js
class EvaluationController {
  /**
   * @param {GetEvaluationsByEncadrant} getEvaluationsByEncadrant 
   * @param {SaveEvaluation} saveEvaluation 
   */
  constructor(getEvaluationsByEncadrant, saveEvaluation) {
    this.getEvaluationsByEncadrant = getEvaluationsByEncadrant;
    this.saveEvaluation = saveEvaluation;
  }

  async getEvaluations(req, res) {
    try {
      const evaluations = await this.getEvaluationsByEncadrant.execute(req.params.idEncadrant);
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async saveEvaluation(req, res) {
    try {
      await this.saveEvaluation.execute(req.body);
      res.json({ message: 'Evaluation saved successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = EvaluationController;