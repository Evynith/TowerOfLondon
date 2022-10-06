'use strict';

import Palito from './palito.js'
import Ficha from './ficha.js'
import {Observable, Observer} from './observer.js'

//manejo del nivel
export default class Tablero  extends Observable{
    #palitos;
    #canvasGame;
    #contextGame;
    #contextBackground;
    #movimientosHechos;
    #movimientosMax;
    #tiempoMaximo;
    #tiempoPlaneamiento;
    #tiempoResolucion;
    #pelotitaEnUso;

    static get LARGO_TOTAL() {
        return (Ficha.RADIO *10);
    }

    static get ANCHO() {
        return (Ficha.RADIO * 2) / 3;
    }

    static get INICIO_BASE_X() {
        return 0;
    }

    static get INICIO_BASE_Y() {
        return this.LARGO_TOTAL - (Ficha.RADIO * 2) + this.ANCHO;
    }

    get movimientosHechos() {
        return this.#movimientosHechos;
    }

    get tiempoPlaneamiento() {
        return this.#tiempoPlaneamiento;
    }

    get tiempoResolucion() {
        return this.#tiempoResolucion; //FIXME: nunca corta el tiempo de resolucion (necesario?)
    }

    get isPelotitaEnUso () {
        return this.#pelotitaEnUso;
    }

    set movMax (movimientos) {
        this.#movimientosMax = movimientos;
    }

    set tiempoMax (tiempo) {
        this.#tiempoMaximo = tiempo;
    }

    constructor(canvasGame, canvasBackground, game) {
        super();
        this.#canvasGame = canvasGame;
        this.#contextGame = this.#canvasGame.getContext("2d");
        this.#contextBackground = canvasBackground.getContext("2d");
        
        this.addObserver(game);// TODO: terminé mi movimiento, si termine mov y estado == completado, nivel FIN
        this.limpiarCanvas();
        this.#palitos = new Array();
        this.#pelotitaEnUso = false;
        this.#movimientosHechos = 0;
        this.#tiempoPlaneamiento = {"h": 0, "m": 0, "s": 0}
        this.#tiempoResolucion = {"h": 0, "m": 0, "s": 0}

        this.crearPalitos(game);
    }
    // mi palo es la 3ra parte de mi bolita
    // tengo 10 radios de largo 

    crearPalitos(game) {
        let x = Ficha.RADIO + Tablero.ANCHO;

        for (let i=3; i>0; i--) {
            let palo = new Palito(i);
            palo.addObserver(game);
            palo.coordX = x;
            this.#palitos.push(palo);
            x += (Tablero.ANCHO*3) + Ficha.RADIO;
        }
    }

    estadoInicial(nroPalo, ...bolitas) {
        for (let ficha of bolitas) {
            this.#palitos[nroPalo].cargarFicha(new Ficha(ficha));
        }
        this.#palitos[nroPalo].notify(); // acá por si su estado inicial es el mismo 
    }

    estadoFinal(nroPalo, ...bolitas) {
        for (let ficha of bolitas) {
            this.#palitos[nroPalo].cargarFichaEstadoFinal(new Ficha(ficha));
        }
    }

    palitoActivo(mouseX, mouseY) {
        for (let palo of this.#palitos) {
            if (palo.estaEnMiArea(mouseX, mouseY)) {
                return palo;
            }
        }
        return null;
    }

    limpiarCanvas() {
        this.#contextGame.clearRect(0, 0, this.#canvasGame.width, this.#canvasGame.height);
    }

    sumarTiempo(tiempoEspecifico) {
        tiempoEspecifico.s++;
        if (tiempoEspecifico.s>59){tiempoEspecifico.m++;tiempoEspecifico.s=0;}
        if (tiempoEspecifico.m>59){tiempoEspecifico.h++;tiempoEspecifico.m=0;}
        if (tiempoEspecifico.h>24){tiempoEspecifico.h=0;}
    }

    jugar() {
        this.limpiarCanvas();
        this.dibujar();
        let elem = null
        let paloInit = null
        let paloAnterior = null;
        let paloFin = null
        let tiempoResolucionInterval;
        let tiempoPlaneamientoInterval = setInterval(()=> {
            this.sumarTiempo(this.#tiempoPlaneamiento)
        },1000);

        this.#canvasGame.onmousedown = (e) => {
            if (this.#pelotitaEnUso == true) { // si ya tengo una pelotita seleccionada
                let cargaAceptada = paloFin.cargarFicha(elem);
                if (cargaAceptada) {
                    this.#movimientosHechos++; 
                    elem = null;
                    this.#pelotitaEnUso = false;
                }
            } else {
                paloInit = this.palitoActivo(e.layerX, e.layerY);
                if (paloInit != null) {
                    elem = paloInit.esBolitaSuperior(e.layerX, e.layerY);
                    if (elem != null) {
                        
                        paloInit.quitarFicha();
                        paloInit.selector = elem; //una sola vez
                        this.#pelotitaEnUso = true

                        //TODO: en los palitos restantes poner "fantasma de bolita para presionar"
                        if (this.#movimientosHechos == 0) {
                            tiempoResolucionInterval = setInterval(()=> {
                                this.sumarTiempo(this.#tiempoResolucion)
                            },1000);
                            clearInterval(tiempoPlaneamientoInterval);
                            //TODO: pararlo cuando llegue a max movimientos o llegue a estado final
                        }
                    }
                }
            }
            this.dibujarYnotificar(elem);
        }
    
        this.#canvasGame.onmousemove = (e) => {
            if ((elem != undefined && elem != null) && this.#pelotitaEnUso){
                    
                let paloActual = this.palitoActivo(e.layerX, e.layerY)
                if (paloActual != null) {
                    paloAnterior = paloFin;
                    paloFin = paloActual;
                }
                
                if (paloAnterior != paloFin) {
                    if (paloAnterior != null) {
                        paloAnterior.selector = undefined;
                    }
                    paloFin.selector = elem;
                }
            } else {
                if (paloFin != null) {
                    paloFin.selector = undefined;
                }
            }
            this.dibujarYnotificar(elem);
        }
    }

    dibujarYnotificar(elem) {
        this.limpiarCanvas();
        if ((elem != undefined && elem != null) && this.#pelotitaEnUso){
            this.mostrarSelectores();
        }
        this.dibujar();
        this.notifyMoving(this.#pelotitaEnUso);
    }

    dibujar() {
        this.#contextBackground.fillStyle = "black";
        this.#contextBackground.fillRect(Tablero.INICIO_BASE_X, Tablero.INICIO_BASE_Y, Tablero.LARGO_TOTAL, Tablero.ANCHO);
       
        for (let palito of this.#palitos) {
            palito.dibujar(this.#contextBackground, this.#contextGame);
        }
    }

    mostrarSelectores() {
        for (let palito of this.#palitos) {
            palito.mostrarSelector(this.#contextGame);
        }
    }
}
