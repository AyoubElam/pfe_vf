// src/entities/models/Etudiant.js
export default class Etudiant {
  constructor(idEtudiant, nom, prenom, email, motDePasse, annee, classe, filiere, idGroupe) {
    this.idEtudiant = idEtudiant;
    this.nom = nom;
    this.prenom = prenom;
    this.email = email;
    this.motDePasse = motDePasse;
    this.annee = annee;
    this.classe = classe;
    this.filiere = filiere;
    this.idGroupe = idGroupe;
  }
}