// src/application/use-cases/prof/GenerateSoutenancePdf.js
export class GenerateSoutenancePdf {
  constructor(soutenancePdfRepository, pdfService) {
    this.soutenancePdfRepository = soutenancePdfRepository;
    this.pdfService = pdfService;
  }

  async execute(idSoutenance) {
    console.log(`Starting PDF generation for soutenance ID: ${idSoutenance}`);
    try {
      const evaluationData = await this.soutenancePdfRepository.getEvaluationDataForSoutenance(idSoutenance);
      console.log("Retrieved evaluation data:", evaluationData);
      
      if (!evaluationData) {
        throw new Error("No evaluation data found for this soutenance");
      }
      
      const pdfBuffer = await this.pdfService.generateSoutenancePdf(evaluationData);
      
      if (!pdfBuffer) {
        throw new Error("PDF generation returned empty buffer");
      }
      
      return pdfBuffer;
    } catch (error) {
      console.error("PDF Generation Error:", error);
      throw new Error(`Failed to generate PDF for soutenance ${idSoutenance}: ${error.message}`);
    }
  }
}