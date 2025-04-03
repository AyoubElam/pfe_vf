// src/routers/evaluationRoutes.js
import express from "express";

import { EvaluationRepository } from "../src/application/repositories/EvaluationRepository.js";
import { GetEvaluationsByEncadrant } from "../src/application/use-cases/evaluation/GetEvaluationsByEncadrant.js";
import { SaveEvaluation } from "../src/application/use-cases/evaluation/SaveEvaluation.js";
import { GenerateEvaluationPDF } from "../src/application/use-cases/evaluation/GenerateEvaluationPDF.js";

const router = express.Router();
const evaluationRepository = new EvaluationRepository();

// Initialize use cases
const getEvaluationsByEncadrant = new GetEvaluationsByEncadrant(evaluationRepository);
const saveEvaluation = new SaveEvaluation(evaluationRepository);
const generateEvaluationPDF = new GenerateEvaluationPDF(evaluationRepository);

/**
 * @route GET /api/evaluation/groups-students/:idEncadrant
 * @desc Get all evaluations for students supervised by an encadrant
 * @access Private
 */
router.get("/groups-students/:idEncadrant", async (req, res, next) => {
  try {
    const evaluations = await getEvaluationsByEncadrant.execute(req.params.idEncadrant);
    res.json(evaluations);
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
});

/**
 * @route POST /api/evaluation
 * @desc Create or update an evaluation
 * @access Private
 */
router.post("/", async (req, res, next) => {
  try {
    const { idEncadrant, evaluation } = req.body;
    
    if (!idEncadrant || !evaluation) {
      const error = new Error("idEncadrant and evaluation are required");
      error.statusCode = 400;
      throw error;
    }

    await saveEvaluation.execute({ idEncadrant, ...evaluation });
    res.status(201).json({ message: "Evaluation saved successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/evaluation/generate-pdf/:idEncadrant
 * @desc Generate PDF report for evaluations
 * @access Private
 */
router.get("/generate-pdf/:idEncadrant", async (req, res, next) => {
  try {
    const pdfBuffer = await generateEvaluationPDF.execute(req.params.idEncadrant);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition", 
      `attachment; filename="evaluations-${req.params.idEncadrant}.pdf"`
    );
    
    res.send(pdfBuffer);
  } catch (error) {
    error.statusCode = 500;
    next(error);
  }
});

export default router;