class Palito {
    #fichas;
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
        this.#fichas = new Array();
        this.#width = Tablero.ANCHO;
        this.#base = Tablero.INICIO_BASE_Y;
        this.#height = (Ficha.RADIO * 2) * fichasMax;
        this.#coordY = this.#base - this.#height;
    }

    cargarFicha(ficha) {
        if (this.#fichas.length != 0) {
            let ultimaficha = this.#fichas[this.#fichas.length -1];
            ficha.setCoord(this.#coordX + (this.#width/2), ultimaficha.coordY - (Ficha.RADIO * 2));
            this.#fichas.push(ficha);
        } else {
            ficha.setCoord(this.#coordX + (this.#width/2), this.#base - Ficha.RADIO);
            this.#fichas.push(ficha);
        }
    }

    quitarFicha() {
        return this.#fichas.pop
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

    dibujar(context) {
        context.fillStyle = "black";
        context.fillRect(this.#coordX, this.#coordY, this.#width, this.#height);
        
        for(let ficha of this.#fichas) {
            ficha.dibujar(context);
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
    #canvas;

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
        return this.LARGO_TOTAL - ((Ficha.RADIO * 2) + this.ANCHO);
    }

    constructor(canvas) {
        this.#palitos = new Array();
        this.#canvas = canvas;
        this.crearPalitos();
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

    // limpiarCanvas() {
    //     context.clearRect(0, 0, canvas.width, canvas.height);
    // }

    jugar() {
        let press = false
        let elem 
        let dif = 0
        this.#canvas.onmousedown = (e) => {
            press = true

            let palo = this.palitoActivo(e.layerX, e.layerY);
            if (palo != null) {
                elem = palo.esBolitaSuperior(e.layerX, e.layerY);
            }

            if ((elem != undefined && elem != null) && press){
                // dif = elem.getDif(e.layerX, e.layerY) //diferencia click a  draw
            }
        }
        this.#canvas.onmousemove = (e) => {
            if ((elem != undefined && elem != null) && press){
                // elem.setCoord(e.layerX - dif.x, e.layerY - dif.y)
                // limpiarCanvas()
                // this.dibujar()
            }
        }
        this.#canvas.onmouseup = () => {
            press = false;
            dif = 0
        }
    }

    dibujar(context) {
        context.fillStyle = "black";
        context.fillRect(Tablero.INICIO_BASE_X, Tablero.INICIO_BASE_Y, Tablero.LARGO_TOTAL, Tablero.ANCHO);
       
        for (let palito of this.#palitos) {
            palito.dibujar(context);
        }
    }
}

//manejo del juego
class Game {
    #context;
    #canvas;

    constructor(canvas) {
        this.#canvas = canvas;
        this.#context = canvas.getContext("2d");
    }

    init() {
        Ficha.RADIO = this.#canvas.width / (5 * 2); //mis medidas son a base de radio (10rad x 10rad)
        
        let tablero = new Tablero(this.#canvas);
        tablero.cargarPalo(0, "red", "green");
        tablero.cargarPalo(1, "blue");
        
        tablero.dibujar(this.#context);
        tablero.jugar();
    }

}

let canvas = document.querySelector("canvas");
let game = new Game(canvas);
game.init();

//TODO: arreglar la crotada del context (hacer una inetrfaz o elemento heredable para hacer super() )