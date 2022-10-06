'use strict';

import Palito from './palito.js'
import Ficha from './ficha.js'
import Tablero from './tablero.js'
import {Observable, Observer} from './observer.js'

let pantalla = document.querySelector("#pantalla-intermedia");

//manejo del juego
class Game  extends Observer {
    #canvasGame;
    #niveles;
    #canvasBackground;
    #tablero;
    #states;

    constructor() {
        super();
        this.#canvasGame = document.querySelector("#game-layer");
        this.#canvasBackground = document.querySelector("#background-layer");
        Ficha.RADIO = this.#canvasGame.width / (5 * 2); //mis medidas son a base de radio (10rad x 10rad)
        this.#tablero = new Tablero(this.#canvasGame, this.#canvasBackground, this);
        this.#states = new Map();

        this.#niveles = [
            new Map([ //nvl1
                ['p1', {"estadoInicial":[ "green", "red"], "estadoFinal":["red","green"]}],
                ['p2', {"estadoInicial":["blue"],          "estadoFinal":["blue"]}],
                ['p3', {"estadoInicial":[],                "estadoFinal":[]}],
                ['movMax', 6],
                ['img', "estado-nro1"],
                ['tiempoMax', {"h": 0, "m": 0, "s": 0}]
              ]),
              new Map([ //nvl2
              ['p1', {"estadoInicial":[ "blue", "green"], "estadoFinal":["red","green"]}],
              ['p2', {"estadoInicial":[],                 "estadoFinal":["blue"]}],
              ['p3', {"estadoInicial":["red"],            "estadoFinal":[]}],
              ['movMax', 5],
              ['img', "estado-nro1"],
              ['tiempoMax', {"h": 0, "m": 0, "s": 0}]
            ]),
        ];

        this.initNivel(this.#niveles[0]);
    }

    end() {
        console.log("-FIN-", " ", "tiempo planeamiento: ", this.#tablero.tiempoPlaneamiento, 
                                  "tiempo resolucion: ", this.#tablero.tiempoResolucion,
                                  "movimientos totales: ", this.#tablero.movimientosHechos
                                ) //TODO: voy sacando los niveles iniciales, acá guardo mis valores? - paso sig nvl
        // quito el actual y si tengo mas lo ejecuto
        this.#niveles.shift()
        this.#states = new Map();
        this.#tablero = new Tablero(this.#canvasGame, this.#canvasBackground, this);
        if (this.#niveles.length > 0) {
            pantalla.querySelector("h1").innerHTML = "Nivel superado";
            let btn = pantalla.querySelector("button");
            btn.innerHTML = "Siguiente nivel";
            pantalla.style.display = "flex";
            btn.onclick = () => {
                pantalla.style.display = "none";
                this.initNivel(this.#niveles[0]);
            }
        } else {
            pantalla.querySelector("h1").innerHTML = "Fin del juego";
            pantalla.querySelector("button").remove();
            pantalla.style.display = "flex";
        }
    }

    estadoCompletado() {
        if (this.#states.size < 3) { //para que no me compare antes de haber inicializado todo
            return false
        }
        for (let amount of this.#states.values()) {
            if (amount == false) {
                return false
            }
        }
        return true
    }

    mostrarDatos() {
        document.querySelector("#tiempo-planeamiento").innerHTML = this.#tablero.tiempoPlaneamiento != null ?  this.setearEstiloReloj("planeamiento", this.#tablero.tiempoPlaneamiento) : "";
        document.querySelector("#tiempo-resolucion").innerHTML = this.#tablero.tiempoResolucion != null ? this.setearEstiloReloj("resolucion", this.#tablero.tiempoResolucion) : "";
        document.querySelector("#movimientos").innerHTML = this.#tablero.movimientosHechos != null ? "Movimientos realizados: " + this.#tablero.movimientosHechos : "";
    }

    initNivel(nivel) {
        document.querySelector("#estado-final").src = `../assets/${nivel.get("img")}.png`;
        this.mostrarDatos(); //como un do-while
        let mostrarDatosInterval = setInterval(()=> {
            this.mostrarDatos();
        },1000);

        this.#tablero.estadoFinal(0, ...nivel.get("p1").estadoFinal);
        this.#tablero.estadoFinal(1, ...nivel.get("p2").estadoFinal);
        this.#tablero.estadoFinal(2, ...nivel.get("p3").estadoFinal); 

        this.#tablero.estadoInicial(0, ...nivel.get("p1").estadoInicial);
        this.#tablero.estadoInicial(1, ...nivel.get("p2").estadoInicial);
        this.#tablero.estadoInicial(2, ...nivel.get("p3").estadoInicial);

        this.#tablero.movMax = nivel.get("movMax");
        this.#tablero.tiempoMax = nivel.get("tiempoMax");

        this.#tablero.jugar();
    }

    setearEstiloReloj(tiempo, elem) {
        return `Tiempo de ${tiempo}: ${this.elemEstiloReloj(elem.h)}h ${this.elemEstiloReloj(elem.m)}m ${this.elemEstiloReloj(elem.s)}s`;
    }

    elemEstiloReloj(tiempo) {
        return tiempo < 10 ? `0${tiempo}` : tiempo
    }

    updateState(state) {
        this.#states.set(state.id,state.st);
    }

    updateMoving(state) {
        if (state == false && this.estadoCompletado()) {
            this.end();
        }
    }

}

document.querySelector("#btn-play").onclick = () => {
    pantalla.style.display = "none";
    let game = new Game();
}