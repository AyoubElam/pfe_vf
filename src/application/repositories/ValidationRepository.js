// src/repositories/ValidationRepository.js
import db from "../../../config/db.js";

export class ValidationRepository {
  async validateProfDocument(idPFE, pfeLivrableId, idEncadrant, validationStatus, comment) {
    const query = `
      INSERT INTO validation_comment (idPFE, pfeLivrableId, idEncadrant, validationStatus, comment)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        validationStatus = VALUES(validationStatus),
        comment = VALUES(comment)
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [idPFE, pfeLivrableId, idEncadrant, validationStatus, comment || null], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  async deleteProfValidation(idPFE, pfeLivrableId, idEncadrant) {
    const query = `
      DELETE FROM validation_comment
      WHERE idPFE = ? AND pfeLivrableId = ? AND idEncadrant = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [idPFE, pfeLivrableId, idEncadrant], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  async validateTutorDocument(idPFE, pfeLivrableId, idTuteur, validationStatus, comment) {
    const query = `
      INSERT INTO validation_comment (idPFE, pfeLivrableId, idTuteur, validationStatus, comment)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        validationStatus = VALUES(validationStatus),
        comment = VALUES(comment)
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [idPFE, pfeLivrableId, idTuteur, validationStatus, comment || null], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  async deleteTutorValidation(idPFE, pfeLivrableId, idTuteur) {
    const query = `
      DELETE FROM validation_comment
      WHERE idPFE = ? AND pfeLivrableId = ? AND idTuteur = ?
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [idPFE, pfeLivrableId, idTuteur], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}