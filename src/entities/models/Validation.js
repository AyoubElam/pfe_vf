// src/entities/models/Validation.js
export class Validation {
  constructor(validationStatus, comment = null) {
    this.validationStatus = validationStatus;
    this.comment = comment;
  }
}