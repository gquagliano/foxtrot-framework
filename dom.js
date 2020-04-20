/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 /**
 * Gestor de acceso al DOM, ideado para abastraer el acceso al mismo para abreviar el código y por cuestiones de intercompatibilidad
 * entre navegadores (como jQuery, pero ultra-fino--y no está basado en jQuery). Debe ser compatible con navegadores modernos, pero escrita en ES5.
 */
(function() {
    "use strict";

    var id=0,
        almacenMetadatos={};

    /**
     * Establece o devuelve los metadatos de un elemento del DOM. Trabaja con una instancia de Element (no objetoDom).
     */
    function metadatos(elemento,clave,valor) {
        //if(dom.esInstancia(elemento)) elemento=elemento.obtener(0);

        //if(!elemento.hasOwnProperty("_dom_id")) elemento._dom_id=id++;
        var id=elemento._dom_id;

        if(!almacenMetadatos.hasOwnProperty(id)) almacenMetadatos[id]={};
        var obj=almacenMetadatos[id];

        if(!dom.esIndefinido(clave)&&!obj.hasOwnProperty(clave)) obj[clave]=null;

        if(dom.esIndefinido(clave)) return obj;

        if(dom.esIndefinido(valor)) return obj[clave];

        obj[clave]=valor;

        return obj[clave];
    }

    /**
     * Inicializa los metadatos de un elemento del DOM. Trabaja con una instancia de Element (no objetoDom).
     */
    function inicializarMetadatos(elemento) {
        var obj=metadatos(elemento);
        obj={
            eventos:{},
            variables:{}
        };
    }

    function objetoDom(consulta,buscarEn,busquedaProfunda) {
        //Nota sobre la documentación:
        //Algunos métodos trabajan sobre elementos únicos, otros pueden trabajar sobre todos los elementos seleccionados. Esto debe diferenciarse
        //en la documentación de cada método.

        var elementos=[],    
            d=document;        

        /**
         * Devuelve la cantidad de elementos contenidos en esta instancia.
         */
        this.cantidad=function() {
            return elementos.length;
        };

        /**
         * Devuelve el elemento # i, o un array de elementos si i no está definido. Devuelve instancias de Element (no de objetoDom).
         */
        this.obtener=function(i) {
            if(typeof i!=="number") return elementos;
            return elementos[i];
        };

        /**
         * Agrega los elementos especificados a los elementos de esta instancia.
         */
        this.anexar=function(elemento) {
            elemento=$(elemento);
            var elemAnexar=elemento.obtener();
            for(var i=0;i<elementos.length;i++) {
                var e=elementos[i];
                for(var j=0;j<elemAnexar.length;j++) {
                    var f=elemAnexar[j];
                    e.appendChild(f);
                }
            }
            return this;
        };

        /**
         * Determina si todos los elementos coinciden con la consulta.
         */
        this.es=function(consulta) {
            //TODO
        };

        /**
         * Escucha un evento para todos los elementos de esta instancia. Acepta un array de funciones en funcion.
         */    
        this.evento=function(nombre,funcion,captura) {
            if(typeof captura==="undefined") captura=false;

            for(var i=0;i<elementos.length;i++) {
                var elem=elementos[i];

                inicializarMetadatos(elem);
                var eventos=metadatos(elem,"eventos");
                if(eventos===null) eventos=[];
                if(!eventos.hasOwnProperty(nombre)) eventos[nombre]=[];

                //Eventos especiales
                if(elem===document&&nombre=="ready") {
                    nombre="DOMContentLoaded";
                    captura=false;
                } else if(elem===window&&nombre=="load") {
                    captura=false;
                }

                if(Array.isArray(funcion)) {
                    for(var j=0;j<funcion.length;j++) {
                        elem.addEventListener(nombre,funcion[j],captura);
                        eventos[nombre].push(funcion[j]);
                    }
                } else  if(typeof funcion==="function") {
                    elem.addEventListener(nombre,funcion,captura);
                    eventos[nombre].push(funcion);
                }
            }

            return this;
        };

        /**
         * Remueve un evento, o todos los eventos si funcion no está definido. Acepta un array de funciones en funcion.
         */
        this.removerEvento=function(nombre,funcion) {
            for(var i=0;i<elementos.length;i++) {
                var elem=elementos[i];

                if(Array.isArray(funcion)) {
                    for(var j=0;j<funcion.length;j++)
                        if(typeof funcion[j]==="function") elem.removeEventListener(nombre,funcion[j]);
                } else if(typeof funcion==="function") {
                    elem.removeEventListener(nombre,funcion);
                }

                //TODO remover todo
                //TODO remover funcion de metadatos
            }
            return this;
        };

        /**
         * Devuelve un objeto {x,y} con la posición relativa del elemento.
         */
        this.posicion=function() {
            //TODO
        };
        
        /**
         * Devuelve un objeto {x,y} con la posición absoluta del elemento.
         */
        this.posicionAbsoluta=function() {
            return {
                x: elementos[0].offsetLeft,
                y: elementos[0].offsetTop
            };
        };

        function normalizarValorCss(valor) {
            if(typeof valor==="number") valor=valor+"px";
            return valor;
        }

        /**
         * Devuelve el valor del estilo, si valor no está definido, o asigna el mismo. Estilo puede ser un objeto para establecer múltiples estilos a la vez.
         */
        this.estilo=function(estilo,valor) {
            if(typeof estilo==="string"&&typeof valor==="undefined") {
                return elementos[i].style[estilo];
            } else if(typeof estilo==="object") {
                for(var clave in estilo) {
                    if(!estilo.hasOwnProperty(clave)) continue;
                    this.estilo(clave,estilo[clave]);
                }
            } else {
                for(var i=0;i<elementos.length;i++) elementos[i].style[estilo]=normalizarValorCss(valor);
            }
            return this;
        };

        /**
         * Devuelve el ancho del elemento, incluyendo bordes (pero no márgenes). Si el elemento es document, devolverá el ancho de la página. Si el elemento
         * es window, devolverá el ancho de la ventana (viewport).
         */
        this.ancho=function() {
            if(elementos[0]===document) return document.body.offsetWidth;
            if(elementos[0]===window) return window.innerWidth;
            return elementos[0].offsetWidth;
        };

        /**
         * Devuelve el alto del elemento, incluyendo bordes (pero no márgenes). Si el elemento es document, devolverá el alto de la página. Si el elemento
         * es window, devolverá el alto de la ventana (viewport).
         */
        this.alto=function() {
            if(elementos[0]===document) return document.body.offsetHeight;
            if(elementos[0]===window) return window.innerHeight;
            return elementos[0].offsetHeight;
        };

        /**
         * Devuelve o establece el id del elemento.
         */
        this.id=function(valor) {
            if(typeof valor==="undefined") return this.atributo("id");
            this.atributo("id",valor);
            return this;
        };

        /**
         * Agrega una clase css a los elementos. Soporta múltiples clases separadas por espacios.
         */
        this.agregarClase=function(clase) {
            clase=clase.split(" ");
            for(var i=0;i<elementos.length;i++)
                for(var j=0;j<clase.length;j++)
                    elementos[i].classList.add(clase[j]);
            return this;
        };

        /**
         * Remueve una clase css de los elementos. Soporta RegExp o múltiples clases separadas por espacios.
         */
        this.removerClase=function(clase) {
            if(clase instanceof RegExp) {
                for(var i=0;i<elementos.length;i++) 
                    for(var j=0;j<elementos[i].classList.length;j++)
                        if(clase.test(elementos[i].classList[j]))
                            elementos[i].classList.remove(elementos[i].classList[j]);
                return this;
            }

            clase=clase.split(" ");
            for(var i=0;i<elementos.length;i++)
                for(var j=0;j<clase.length;j++)
                    elementos[i].classList.remove(clase[j]);
            return this;
        };

        /**
         * Alterna una clase css en los elementos. Soporta RegExp o múltiples clases separadas por espacios.
         */
        this.alternarClase=function() {
            if(clase instanceof RegExp) {
                for(var i=0;i<elementos.length;i++) 
                    for(var j=0;j<elementos[i].classList.length;j++)
                        if(clase.test(elementos[i].classList[j]))
                            elementos[i].classList.toggle(elementos[i].classList[j]);
                return this;
            }

            clase=clase.split(" ");
            for(var i=0;i<elementos.length;i++)
                for(var j=0;j<clase.length;j++)
                    elementos[i].classList.toggle(clase[j]);
            return this;
        };

        /**
         * Busca en todo el árbol de descendencia del elemento.
         */
        this.buscar=function(consulta) {
            return new objetoDom(consulta,elementos[0]);
        };

        /**
         * Busca en los hijos del elemento.
         */
        this.hijos=function(consulta) {
            return new objetoDom(consulta,elementos[0],false);
        };

        /**
         * Devuelve el padre del elemento o, si consulta está definido, busca en la ascendencia hasta dar con el elemento que coincida o con body.
         */
        this.padre=function(consulta) {
            if(typeof consulta==="undefined") {
                //Devolver el padre
                return new objectDom(elementos[0].parent);
            }

            //Buscar el padre que coincida con consulta
            //TODO
            
            return new objetoDom(padre);
        };

        /**
         * Obtiene o establece una propiedad (atributo sin valor) de los elementos.
         */
        this.propiedad=function(nombre,valor) {
            if(typeof valor==="boolean") this.atributo(nombre,valor);
            return this;
        };

        /**
         * Obtiene o establece el valor de un atributo de los elementos.
         */
        this.atributo=function(nombre,valor) {
            for(var i=0;i<elementos.length;i++) elementos[i][nombre]=valor;
            return this;
        };

        /**
         * Obtiene o establece el texto de los elementos.
         */
        this.texto=function(valor) {
            for(var i=0;i<elementos.length;i++) elementos[i].innerText=valor;
            return this;
        };

        /**
         * Obtiene o establece el html de los elementos.
         */
        this.html=function(valor) {
            for(var i=0;i<elementos.length;i++) elementos[i].innerHTML=valor;
            return this;
        };

        /**
         * Limpia los hijos y texto de los elementos.
         */
        this.limpiar=function() {
            for(var i=0;i<elementos.length;i++) elementos[i].innerHTML=null;
            return this;
        };

        /**
         * Devuelve o establece un metadato del elemento (valores internos de Dom).
         */
        this.metadatos=function(nombre,valor) {
            if(typeof valor==="undefined") {
                return metadatos(elementos[0],nombre);
            }

            for(var i=0;i<elementos.length;i++) {
                metadatos(elementos[i],nombre,valor);
            }
            return this;
        };

        /**
         * Devuelve o establece un atributo data de los elementos.
         */
        this.data=function(nombre,valor) {
            if(typeof valor==="undefined") {
                return elementos[0].dataset[nombre];
            }

            for(var i=0;i<elementos.length;i++) elementos[i].dataset[nombre]=valor;
            return this;
        };

        /**
         * Asigna un ID a cada elemento para identificarlo en los diferentes objetos como los metadatos o el (futuro) caché.
         */
        function actualizarIds() {
            for(var i=0;i<elementos.length;i++)
                if(!elementos[i].hasOwnProperty("_dom_id"))
                    elementos[i]._dom_id=id++;
        }

        /**
         * Devuelve el ID interno del elemento.
         */
        this.id=function() {
            return elementos[0]._dom_id;
        };

        /**
         * Constructor.
         */
        (function(consulta,buscarEn,busquedaProfunda) {
            if(typeof consulta==="undefined") return;
            if(typeof buscarEn==="undefined") buscarEn=null;
            if(typeof busquedaProfunda==="undefined") busquedaProfunda=true;

            if(consulta instanceof Element||consulta===window||consulta===document) {
                //Elemento
                elementos.push(consulta);
            } else if(typeof consulta==="string") {
                if(/^[a-zA-Z0-9#\.\s-]+$/.test(consulta)) {
                    //Selector            
                    var nodos=(buscarEn||d).querySelectorAll(consulta);
                    elementos=Array.from(nodos);
                    if(!busquedaProfunda) elementos=elementos.filter(e=>e.parent===buscarEn);
                } else {
                    //Código (asumimos html válido)
                    var div=d.createElement("div");
                    div.innerHTML=consulta;
                    for(var i=0;i<div.children.length;i++) elementos.push(div.children[i]);
                }
            }

            actualizarIds();
        })(consulta,buscarEn,busquedaProfunda);
    }

    /**
     * Atajo para crear y devolver una instancia de objetoDom.
     * @param {String} consulta 
     */
    window["$"]=function(consulta) {
        if(typeof consulta==="undefined") return new objetoDom();

        //Recibimos otra instancia, devolver para seguir trabajando con ella directamente
        if(consulta instanceof objetoDom) return consulta;
        
        if(typeof consulta!=="string"&&!(consulta instanceof Element)&&consulta!==window&&consulta!==document) return null;

        return new objetoDom(consulta);
    };

    /**
     * Objeto público con funciones útiles.
     */
    window["dom"]={
        /**
         * Devuelve el prototipo de objetoDom.
         */
        prototipo:function() {
            return objetoDom.prototype;
        },

        /**
         * Agrega un nuevo método a las instancias de objetoDom.
         */
        agregarMetodo:function(nombre,funcion) {
            dom.prototipo()[nombre]=funcion;
        },

        /**
         * Determina si un objeto es instancia de objetoDom.
         */
        esInstancia:function(obj) {
            return obj instanceof objetoDom;
        },

        /**
         * Determina si un objeto es un elemento del DOM (Element).
         */
        esElemento:function(obj) {
            return obj instanceof Element;
        },

        //Utilidades varias

        /**
         * Determina si una expresión es indefinida o no.
         */
        esIndefinido:function(expr) {
            return typeof expr==="undefined";
        },

        /**
         * Determina si un objeto es un array.
         */
        esArray:function(obj) {
            return Array.isArray(obj);
        }
    };
})();