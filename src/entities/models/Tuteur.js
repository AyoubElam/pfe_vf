// src/entities/models/Tuteur.js
export default class Tuteur {
  constructor(idTuteur, nom, prenom, email, motDePasse, annee, classe, filiere) {
    this.idTuteur = idTuteur;
    this.nom = nom;
    this.prenom = prenom;
    this.email = email;
    this.motDePasse = motDePasse;
    this.annee = annee;
    this.classe = classe;
    this.filiere = filiere;
  }
}