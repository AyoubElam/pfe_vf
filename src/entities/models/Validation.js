export class Validation {
    constructor(idPFE, pfeLivrableId, idTuteur, idEncadrant, validationStatus, comment) {
      this.idPFE = idPFE;
      this.pfeLivrableId = pfeLivrableId;
      this.idTuteur = idTuteur;
      this.idEncadrant = idEncadrant;
      this.validationStatus = validationStatus;
      this.comment = comment;
    }
  }