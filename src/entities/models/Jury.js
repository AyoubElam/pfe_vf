export class Jury {
  constructor(idJury, nom, valideDeliberation = 0) {
    this.idJury = idJury;
    this.nom = nom;
    this.valideDeliberation = valideDeliberation;
  }
}