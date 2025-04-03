/* eslint-disable @typescript-eslint/no-unused-vars */
// src/application/repositories/EvaluationRepository.js
import db from "../../../config/db.js";
import { Evaluation } from "../../entities/models/Evaluation.js";

export class EvaluationRepository {
  async getByEncadrant(idEncadrant) {
    const query = `
      SELECT 
        g.idGroupe,
        g.nomGroupe,
        e.idEtudiant,
        CONCAT(e.nom, ' ', e.prenom) AS etudiant,
        MAX(s.idSoutenance) AS idSoutenance,
        ev.noteRapport,
        ev.notePresentation,
        ev.noteDiscussion,
        ev.noteSavoirFaireSavoirEtre,
        ev.noteTotale,
        ev.remarque
      FROM groupe g
      JOIN etudiant e ON g.idGroupe = e.idGroupe
      JOIN soutenance_groupe sg ON g.idGroupe = sg.idGroupe
      JOIN soutenance s ON sg.idSoutenance = s.idSoutenance
      LEFT JOIN evaluation ev ON e.idEtudiant = ev.idEtudiant 
        AND s.idSoutenance = ev.idSoutenance
        AND ev.idEncadrant = ?
      JOIN sujet sj ON g.idSujet = sj.idSujet
      WHERE sj.idEncadrant = ?
      GROUP BY g.idGroupe, e.idEtudiant, e.nom, e.prenom, g.nomGroupe,
               ev.noteRapport, ev.notePresentation, ev.noteDiscussion,
               ev.noteSavoirFaireSavoirEtre, ev.noteTotale, ev.remarque
      ORDER BY g.idGroupe, e.nom;
    `;
    
    const [rows] = await db.promise().query(query, [idEncadrant, idEncadrant]);

    // Filter out duplicate rows based on unique student keys
    const uniqueRows = rows.filter((row, index, self) =>
      index === self.findIndex(r => 
        r.idEtudiant === row.idEtudiant &&
        r.idSoutenance === row.idSoutenance &&
        r.idGroupe === row.idGroupe
      )
    );

    return uniqueRows.map(row => new Evaluation(
      row.idSoutenance,
      row.idEtudiant,
      row.idGroupe,
      idEncadrant,
      row.noteRapport,
      row.notePresentation,
      row.noteDiscussion,
      row.noteSavoirFaireSavoirEtre,
      row.noteTotale,
      row.remarque,
      row.etudiant,    // full name from SQL CONCAT
      row.nomGroupe    // group name from the query
    ));
  }

  async save(evaluation) {
    const query = `
      INSERT INTO evaluation (
        idSoutenance, idEtudiant, idGroupe, idEncadrant,
        noteRapport, notePresentation, noteDiscussion,
        noteSavoirFaireSavoirEtre, noteTotale, remarque
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        noteRapport = VALUES(noteRapport),
        notePresentation = VALUES(notePresentation),
        noteDiscussion = VALUES(noteDiscussion),
        noteSavoirFaireSavoirEtre = VALUES(noteSavoirFaireSavoirEtre),
        noteTotale = VALUES(noteTotale),
        remarque = VALUES(remarque)
    `;
    
    await db.promise().query(query, [
      evaluation.idSoutenance,
      evaluation.idEtudiant,
      evaluation.idGroupe,
      evaluation.idEncadrant,
      evaluation.noteRapport,
      evaluation.notePresentation,
      evaluation.noteDiscussion,
      evaluation.noteSavoirFaireSavoirEtre,
      evaluation.calculateTotal(),
      evaluation.remarque
    ]);
  }

  async generatePDF(idEncadrant) {
    throw new Error('PDF generation not implemented');
  }
}

export default EvaluationRepository;
