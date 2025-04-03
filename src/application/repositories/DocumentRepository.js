// src/repositories/DocumentRepository.js
import db from "../../../config/db.js";
import { Document } from "../../entities/models/Document.js";

export class DocumentRepository {
  async getProfDocuments(idEncadrant) {
    const query = `
      SELECT 
        pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe,
        COUNT(DISTINCT e.idEtudiant) AS nbEtudiants,
        GROUP_CONCAT(DISTINCT CONCAT(e.nom, ' ', e.prenom) SEPARATOR ', ') AS studentNames,
        s.titre AS subjectTitle, vc.validationStatus, vc.comment, pl.idLivrable
      FROM pfe_livrable pl
      JOIN groupe g ON pl.idGroupe = g.idGroupe
      JOIN sujet s ON g.idSujet = s.idSujet
      LEFT JOIN etudiant e ON g.idGroupe = e.idGroupe
      LEFT JOIN validation_comment vc ON pl.id = vc.pfeLivrableId AND vc.idEncadrant = ?
      WHERE s.idEncadrant = ?
      GROUP BY pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe, s.titre, vc.validationStatus, vc.comment, pl.idLivrable;
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [idEncadrant, idEncadrant], (err, results) => {
        if (err) return reject(err);
        const documents = results.map(row => new Document(
          row.id, row.idPFE, row.fichier, row.type, row.nomGroupe, row.nbEtudiants,
          row.studentNames, row.subjectTitle, row.validationStatus || "pending", row.comment, row.idLivrable
        ));
        resolve(documents);
      });
    });
  }

  async getTutorGroupDocuments(idTuteur) {
    const query = `
      SELECT 
        pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe,
        COUNT(DISTINCT e.idEtudiant) AS nbEtudiants, pl.idLivrable,
        vc.validationStatus, vc.comment,
        GROUP_CONCAT(DISTINCT CONCAT(e.nom, ' ', e.prenom) SEPARATOR ', ') AS studentNames
      FROM pfe_livrable pl
      JOIN pfe p ON pl.idPFE = p.idPFE
      JOIN groupe g ON pl.idGroupe = g.idGroupe AND p.idGroupe = g.idGroupe
      LEFT JOIN etudiant e ON g.idGroupe = e.idGroupe
      LEFT JOIN validation_comment vc ON pl.id = vc.pfeLivrableId AND vc.idTuteur = ?
      WHERE p.idTuteur = ?
      GROUP BY pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe, pl.idLivrable, vc.validationStatus, vc.comment;
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [idTuteur, idTuteur], (err, results) => {
        if (err) return reject(err);
        const documents = results.map(row => new Document(
          row.id, row.idPFE, row.fichier, row.type, row.nomGroupe, row.nbEtudiants,
          row.studentNames, "", row.validationStatus || "pending", row.comment, row.idLivrable
        ));
        resolve(documents);
      });
    });
  }

  async getStudentDocuments(idEtudiant) {
    const query = `
      SELECT
        pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe,
        COUNT(DISTINCT e.idEtudiant) AS nbEtudiants,
        vt.validationStatus AS tutorValidationStatus, vt.comment AS tutorComment,
        vp.validationStatus AS profValidationStatus, vp.comment AS profComment,
        pl.idLivrable
      FROM pfe_livrable pl
      JOIN pfe p ON pl.idPFE = p.idPFE
      JOIN groupe g ON pl.idGroupe = g.idGroupe AND p.idGroupe = g.idGroupe
      JOIN etudiant e ON g.idGroupe = e.idGroupe
      LEFT JOIN validation_comment vt ON pl.id = vt.pfeLivrableId AND vt.idTuteur IS NOT NULL
      LEFT JOIN validation_comment vp ON pl.id = vp.pfeLivrableId AND vp.idEncadrant IS NOT NULL
      WHERE e.idEtudiant = ?
      GROUP BY pl.id, pl.idPFE, pl.fichier, pl.type, g.nomGroupe, pl.idLivrable;
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [idEtudiant], (err, rows) => {
        if (err) return reject(err);
        const documents = rows.map(row => ({
          id: row.id,
          idPFE: row.idPFE,
          fichier: row.fichier,
          type: row.type,
          nomGroupe: row.nomGroupe,
          nbEtudiants: row.nbEtudiants,
          tutorValidation: row.tutorValidationStatus
            ? { validationStatus: row.tutorValidationStatus, comment: row.tutorComment }
            : null,
          profValidation: row.profValidationStatus
            ? { validationStatus: row.profValidationStatus, comment: row.profComment }
            : null,
          idLivrable: row.idLivrable
        }));
        resolve(documents);
      });
    });
  }

  async submitStudentDocument(idPFE, idGroupe, fichier, type, idLivrable) {
    const query = `
      INSERT INTO pfe_livrable (idPFE, idGroupe, fichier, type, idLivrable)
      VALUES (?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [idPFE, idGroupe, fichier, type, idLivrable], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  async deleteStudentDocument(idPFE, id) {
    const query = `DELETE FROM pfe_livrable WHERE idPFE = ? AND id = ?`;
    return new Promise((resolve, reject) => {
      db.query(query, [idPFE, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  queryPromise(query, params) {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
}