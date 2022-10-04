'use strict';

class Observable {
    constructor() {
      this.observers = [];
    }
 
    // Add an observer to this.observers.
    addObserver(observer) {
      this.observers.push(observer);
    }
 
    // Remove an observer from this.observers.
    removeObserver(observer) {
      const removeIndex = this.observers.findIndex((obs) => {
        return observer === obs;
      });
 
      if (removeIndex !== -1) {
        this.observers = this.observers.slice(removeIndex, 1);
      }
    }
 
    notifyState(data) {
      if (this.observers.length > 0) {
        this.observers.forEach((observer) => observer.updateState(data));
      }
    }

    notifyMoving(data) {
        if (this.observers.length > 0) {
            this.observers.forEach((observer) => observer.updateMoving(data));
          }
    }
 }

 class Observer {
    // Gets called by the Subject::notify method.
    update() {}
  }

class Palito extends Observable {
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

class Ficha {
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

//manejo del nivel
class Tablero  extends Observable{
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
                ['tiempoMax', {"h": 0, "m": 0, "s": 0}]
              ]),
              new Map([ //nvl2
              ['p1', {"estadoInicial":[ "blue", "green"], "estadoFinal":["red","green"]}],
              ['p2', {"estadoInicial":[],                 "estadoFinal":["blue"]}],
              ['p3', {"estadoInicial":["red"],            "estadoFinal":[]}],
              ['movMax', 5],
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
            this.initNivel(this.#niveles[0]);
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

    initNivel(nivel) {
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

    updateState(state) {
        this.#states.set(state.id,state.st);
    }

    updateMoving(state) {
        if (state == false && this.estadoCompletado()) {
            this.end();
        }
    }

}

let game = new Game();