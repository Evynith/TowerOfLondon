class Palito {
    #fichas;
    #fichasMax;
    #base;
    #width;
    #height;
    #coordX;
    #coordY;

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

    /**
     * @param {number} coord
     */
     set coordX(coord) {
        this.#coordX = coord;
    }

    constructor(fichasMax) {
        this.#fichasMax = fichasMax;
        this.#fichas = new Array();
        this.#width = Tablero.ANCHO;
        this.#base = Tablero.INICIO_BASE_Y;
        this.#height = (Ficha.RADIO * 2) * fichasMax;
        this.#coordY = this.#base - this.#height;
    }

    cargarFicha(ficha) {
        if (this.#fichas.length < this.#fichasMax) {
            if (this.#fichas.length != 0) {
                let ultimaficha = this.#fichas[this.#fichas.length -1];
                ficha.setCoord(this.#coordX + (this.#width/2), ultimaficha.coordY - (Ficha.RADIO * 2));
                this.#fichas.push(ficha);
            } else {
                ficha.setCoord(this.#coordX + (this.#width/2), this.#base - Ficha.RADIO);
                this.#fichas.push(ficha);
            }
            return ficha;
        } else {
            return undefined;
        }
    }

    quitarFicha() {
        return this.#fichas.pop();
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

    estaEnMiArea(mouseX, mouseY) {
        let mitadArea = (this.#coordX + this.#width/2);
        let izquierda = mitadArea - Ficha.RADIO;
        let derecha = mitadArea + Ficha.RADIO;
        if (mouseX > izquierda && mouseX < derecha) {
            if (mouseY > this.#coordY && mouseY < this.#base) {
                return true;
            }
        }
        return false;
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

    constructor(fill) {
        this.#fill = fill;
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
        context.fillStyle = this.#fill;
        context.beginPath();
        context.arc(this.#coordX, this.#coordY, Ficha.RADIO, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    }

}

//manejo del nivel
class Tablero {
    #palitos;
    #canvasGame;
    #contextGame;
    #contextBackground;
    #movimientosHechos;
    #movimientosMax;
    #tiempoPlaneamiento;
    #tiempoResolucion;

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

    constructor(canvasGame, canvasBackground) {
        this.#palitos = new Array();
        this.#canvasGame = canvasGame;
        this.#contextGame = this.#canvasGame.getContext("2d");
        this.#contextBackground = canvasBackground.getContext("2d");
        this.crearPalitos();
        this.#tiempoPlaneamiento = {"h": 0, "m": 0, "s": 0}
        this.#tiempoResolucion = {"h": 0, "m": 0, "s": 0}

    }
    // mi palo es la 3ra parte de mi bolita
    // tengo 10 radios de largo 

    crearPalitos() {
        let x = Ficha.RADIO + Tablero.ANCHO;

        for (let i=3; i>0; i--) {
            let palo = new Palito(i);
            palo.coordX = x;
            this.#palitos.push(palo);
            x += (Tablero.ANCHO*3) + Ficha.RADIO;
        }
    }

    cargarPalo(nroPalo, ...bolitas) {
        for (let ficha of bolitas) {
            this.#palitos[nroPalo].cargarFicha(new Ficha(ficha));
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
        let press = false
        let elem = null
        let paloInit = null
        let paloFin = null
        let dif = 0
        let coordsInit;
        this.#movimientosHechos = 0;
        let tiempoPlaneamientoInterval = setInterval(()=> {
            this.sumarTiempo(this.#tiempoPlaneamiento)
        },1000);
        let tiempoResolucionInterval;

        this.#canvasGame.onmousedown = (e) => {
            press = true

            paloInit = this.palitoActivo(e.layerX, e.layerY);
            if (paloInit != null) {
                elem = paloInit.esBolitaSuperior(e.layerX, e.layerY);
                if (elem != null) {
                    coordsInit = {"x": elem.coordX, "y": elem.coordY};
                    if (this.#movimientosHechos == 0) {
                        tiempoResolucionInterval = setInterval(()=> {
                            this.sumarTiempo(this.#tiempoResolucion)
                        },1000);
                        clearInterval(tiempoPlaneamientoInterval);
                        //TODO: pararlo cuando llegue a max movimientos o llegue a estado final
                    }
                }
            }

            if ((elem != undefined && elem != null) && press){
                dif = elem.getDif(e.layerX, e.layerY)
            }
        }
    
        this.#canvasGame.onmousemove = (e) => {
            if ((elem != undefined && elem != null) && press){
                let coordX = e.layerX - dif.x;
                let coordY = e.layerY - dif.y;
                if  (coordX - Ficha.RADIO < 0) {
                    coordX = Ficha.RADIO
                }
                if (coordY - Ficha.RADIO < 0) {
                    coordY = Ficha.RADIO   
                }
                if (coordX + Ficha.RADIO > this.#canvasGame.width) {
                    coordX = this.#canvasGame.width - Ficha.RADIO
                }
                if (coordY + Ficha.RADIO > this.#canvasGame.height) {
                    coordY = this.#canvasGame.height - Ficha.RADIO
                }
                elem.setCoord(coordX, coordY)
                this.limpiarCanvas();
                this.dibujar();
            }
        }
        this.#canvasGame.onmouseup = (e) => {
            press = false;
            dif = 0
            paloFin = this.palitoActivo(e.layerX, e.layerY)

            if (elem != null) {
                if (paloFin != null && paloFin != paloInit) {
                    let ficha = paloInit.quitarFicha()
                    if (ficha != undefined) {
                        let fichaCargada = paloFin.cargarFicha(elem);
                        if (fichaCargada == undefined) {
                            paloInit.cargarFicha(elem);
                            // TODO: esperar respuestade si se computa o no asi
                        } else {
                            this.#movimientosHechos++;
                        }
                    } else {
                        elem.setCoord(coordsInit.x, coordsInit.y);
                    }
                } else {
                    elem.setCoord(coordsInit.x, coordsInit.y);
                }
                elem = null; // sino el mouse leave si o si me cambia el element guardado al salir del canvas
                this.limpiarCanvas();
                this.dibujar();
            }
        }

        this.#canvasGame.onmouseleave = (e) => {
            press = false;
            if (elem != null) {
                elem.setCoord(coordsInit.x, coordsInit.y);
                this.limpiarCanvas();
                this.dibujar();
            }
        }
    }

    // FIXME: algunas pelotitas se dibujan debajo de otras, restriccion de posicion si hay otro elemento?
    dibujar() {
        this.#contextBackground.fillStyle = "black";
        this.#contextBackground.fillRect(Tablero.INICIO_BASE_X, Tablero.INICIO_BASE_Y, Tablero.LARGO_TOTAL, Tablero.ANCHO);
       
        for (let palito of this.#palitos) {
            palito.dibujar(this.#contextBackground, this.#contextGame);
        }
    }
}

//manejo del juego
class Game {
    #canvasGame;
    #canvasBackground;

    constructor() {
        this.#canvasGame = document.querySelector("#game-layer");
        this.#canvasBackground = document.querySelector("#background-layer");
    }

    init() {
        Ficha.RADIO = this.#canvasGame.width / (5 * 2); //mis medidas son a base de radio (10rad x 10rad)
        
        let tablero = new Tablero(this.#canvasGame, this.#canvasBackground);
        tablero.cargarPalo(0, "red", "green");
        tablero.cargarPalo(1, "blue");
        
        tablero.dibujar();
        tablero.jugar();
    }

}

let game = new Game();
game.init();
