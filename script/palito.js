'use strict';

import Ficha from './ficha.js'
import Tablero from './tablero.js'
import {Observable, Observer} from './observer.js'

export default class Palito extends Observable {
    #fichas;
    #estadoFinal;
    #fichasMax;
    #base;
    #width;
    #height;
    #coordX;
    #coordY;
    #selector;

    static get ALTURA_MAXIMA() {
        return (Ficha.RADIO *2) * 3;
    }

    get ultimaFicha() {
        if (this.#fichas.length > 0 ) {
            return this.#fichas[this.#fichas.length -1];
        } else {
            null
        }
    }

    get selector() {
        return this.#selector
    }

    /**
     * @param {Ficha} ficha
     */
    set selector(ficha) {
        this.crearSelector(ficha);
    }

    /**
     * @param {number} coord
     */
     set coordX(coord) {
        this.#coordX = coord;
    }

    constructor(fichasMax) {
        super();
        this.#fichasMax = fichasMax;
        this.#fichas = new Array();
        this.#estadoFinal = new Array();
        this.#width = Tablero.ANCHO;
        this.#base = Tablero.INICIO_BASE_Y;
        this.#height = (Ficha.RADIO * 2) * fichasMax;
        this.#coordY = this.#base - this.#height;
    }

    cargarFicha(ficha) {
       let estado = this.#cargar(this.#fichas, ficha);
       if (estado != undefined) {
            this.notify();
       }
       return estado
    }

    cargarFichaEstadoFinal(ficha) {
        return this.#cargar(this.#estadoFinal, ficha);
    }

    notify() {
        this.notifyState({"id": this.#fichasMax, "st": this.#estado()});
    }

    #estado() {
        if ((this.#estadoFinal.length == 0 && this.#fichas.length > 0) || (this.#estadoFinal.length != this.#fichas.length )){
            return false
        } else if (this.#estadoFinal.length == 0 && this.#fichas.length == 0) {
            return true
        }
        for (let [i, ficha] of this.#estadoFinal.entries()) {
            if (this.#fichas[i] != null && this.#fichas[i] != undefined) {
                let equal = ficha.color == this.#fichas[i].color;
                if (equal == false) {
                    return false
                }
            } else {
                return false
            }
        }
        return true
    }

    #cargar (array, ficha) {
        if (array.length < this.#fichasMax) {
            if (array.length != 0) {
                let ultimaficha = array[array.length -1];
                ficha.setCoord(this.#coordX + (this.#width/2), ultimaficha.coordY - (Ficha.RADIO * 2));
                array.push(ficha);
            } else {
                ficha.setCoord(this.#coordX + (this.#width/2), this.#base - Ficha.RADIO);
                array.push(ficha);
            }
            return ficha;
        } else {
            return undefined;
        }
    }

    quitarFicha() {
        let ficha = this.#fichas.pop();
        this.notify();
        return ficha;
    }

    esBolitaSuperior(mouseX, mouseY) {
        let ultima = this.ultimaFicha;
        if (ultima != null) {
            if (ultima.estaDentro(mouseX, mouseY) ) {
                return this.ultimaFicha;
            }
        }
        return null;
    }

    crearSelector(ficha = new Ficha("yellow", 0.3)) {
        this.#selector = ficha;
        this.#selector.setCoord(this.#coordX + (this.#width/2), this.#coordY - Ficha.RADIO - (Ficha.RADIO/9) );
    }

    esMiSelector(mouseX, mouseY) {
        if ( this.#selector == null || this.#selector == undefined ) {
            this.crearSelector();
        }
        if (this.#selector.estaDentro(mouseX, mouseY) ) {
            return this.#selector;
        }
        return null;
    }

    estaEnMiArea(mouseX, mouseY) {
        let mitadArea = (this.#coordX + this.#width/2);
        let izquierda = mitadArea - Ficha.RADIO;
        let derecha = mitadArea + Ficha.RADIO;
        if (mouseX > izquierda && mouseX < derecha) {
            if (mouseY > this.#coordY && mouseY < this.#base || this.esMiSelector(mouseX, mouseY) ) { //más área del selector
                return true;
            }
        }
        return false;
    }

    mostrarSelector(contextGame) {
        if ( this.#selector == null || this.#selector == undefined ) {
            this.crearSelector();
        }
        this.#selector.dibujar(contextGame);
    }

    dibujar(contextBackground, contextGame) {
        contextBackground.fillStyle = "black";
        contextBackground.fillRect(this.#coordX, this.#coordY, this.#width, this.#height);
        
        for(let ficha of this.#fichas) {
            ficha.dibujar(contextGame);
        }
    }
}
