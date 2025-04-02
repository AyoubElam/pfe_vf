// src/entities/models/Evaluation.js
export default class Evaluation {
  constructor(idEvaluation, idSoutenance, idEtudiant, idGroupe, noteRapport, notePresentation, 
              noteDiscussion, noteSavoirFaireSavoirEtre, noteTotale, remarque, idEncadrant) {
    this.idEvaluation = idEvaluation;
    this.idSoutenance = idSoutenance;
    this.idEtudiant = idEtudiant;
    this.idGroupe = idGroupe;
    this.noteRapport = noteRapport;
    this.notePresentation = notePresentation;
    this.noteDiscussion = noteDiscussion;
    this.noteSavoirFaireSavoirEtre = noteSavoirFaireSavoirEtre;
    this.noteTotale = noteTotale;
    this.remarque = remarque;
    this.idEncadrant = idEncadrant;
  }
}