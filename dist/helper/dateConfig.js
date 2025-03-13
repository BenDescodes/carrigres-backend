"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dateFrancais(date) {
    const month = {
        0: "Janvier",
        1: "Février",
        2: "Mars",
        3: "Avril",
        4: "Mai",
        5: "Juin",
        6: "Juillet",
        7: "Août",
        8: 'Septembre',
        9: 'Octobre',
        10: "Novembre",
        11: "Décembre"
    }, day = {
        0: 'Dimanche',
        1: 'Lundi',
        2: "Mardi",
        3: "Mercredi",
        4: "Jeudi",
        5: 'Vendredi',
        6: "Samedi"
    };
    let myDate = new Date(date), nomJour = day[myDate.getDay()], numeroJour = myDate.getDate(), moi = month[myDate.getMonth()], annee = myDate.getFullYear();
    const dateFrancais = nomJour + ' ' + numeroJour + ' ' + moi + ' ' + annee;
    return dateFrancais;
}
exports.default = dateFrancais;
