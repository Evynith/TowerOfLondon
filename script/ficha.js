'use strict';

import Palito from './palito.js'
import Tablero from './tablero.js'
import {Observable, Observer} from './observer.js'

export default class Ficha {
    #coordX;
    #coordY;
    #fill;
    #alpha;
    static #RADIO;

    static get RADIO() {
        return this.#RADIO;
    }

    static set RADIO(rad) {
       this.#RADIO = rad;
    }

    get coordY() {
        return this.#coordY;
    }

    get coordX() {
        return this.#coordX;
    }

    get color() {
        return this.#fill;
    }

    constructor(fill, alpha = 1) {
        this.#fill = fill;
        this.#alpha = alpha;
    }

    setCoord(coordX, coordY) {
        this.#coordX = coordX;
        this.#coordY = coordY;
    }

    distanciaEntrePuntos(mouseX, mouseY) {
        let c1 = this.#coordX - mouseX; 
        let c2 = this.#coordY - mouseY; 
        let distancia = Math.hypot(c1, c2);
        return distancia;
    }

    estaDentro(mouseX, mouseY){
        return (this.distanciaEntrePuntos(mouseX, mouseY) <= Ficha.RADIO)
    }

    getDif(mouseX, mouseY) {
        return {"x": mouseX - this.#coordX, "y": mouseY - this.#coordY}
    }

    dibujar(context) {
        context.beginPath();
        context.arc(this.#coordX, this.#coordY, Ficha.RADIO, 0, 2 * Math.PI);
        context.fillStyle = this.#fill;
        context.globalAlpha = this.#alpha;
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = this.#fill;
        context.globalAlpha = 1;
        context.setLineDash([9]);
        context.beginPath();
        context.arc(this.#coordX, this.#coordY, Ficha.RADIO - 5, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
    }

}
