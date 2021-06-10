/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Lista jerárquica (árbol).
 * @class
 * @extends componente
 */
var componenteArbol=function() {   
    "use strict";

    var t=this;

    this.componente="arbol";
    this.iterativo=true;

    this.itemSinDatos=null;
    this.ul=null;
    this.li=[];

    /**
     * Propiedades de Árbol.
     */
    this.propiedadesConcretas={
        "Árbol":{
            mensajeVacio:{
                etiqueta:"Mensaje de árbol vacío",
                ayuda:"Cuando se asigne un origen de datos vacío, se mostrará este mensaje.",
                adaptativa:false
            },
            estadoInicial:{
                etiqueta:"Estado inicial",
                tipo:"opciones",
                opciones:{
                    "normal":"Normal",
                    "expandido":"Todo expandido"
                },
                ayuda:"Esta propiedad afecta solo al estado inicial del componente.",
                adaptativa:false
            },
            descendencia:{
                etiqueta:"Propiedad descendencia",
                adaptativa:false,
                ayuda:"Nombre de la propiedad que contiene la descendencia."
            },
            interactivo:{
            	etiqueta:"Interactivo",
            	tipo:"logico"
            },
            devuelve:{
                etiqueta:"Valor devuelto",
                adaptativa:false,
                tipo:"opciones",
                opciones:{
                    "normal":"Origen de datos actualizado",
                    "listado":"Listado plano (sin anidar)"
                }
            },
            filtrarPropiedades:{
                etiqueta:"Devolver propiedades",
                adaptativa:false,
                ayuda:"Propiedades a incluir de cada elemento del listado del valor devuelto, separadas por coma (por defecto\
                    devuelve el objeto original)."
            },
            filtrarItems:{
                etiqueta:"Filtrar valor devuelto",
                adaptativa:false,
                ayuda:"Nombre de una propiedad a evaluar en cada elemento del listado. Solo se incluirán en el valor devuelto aquellos\
                    elementos cuya valor se evalúe como verdadero (truthy)."
            }
        },
        "Eventos":{
            expandido:{
                etiqueta:"Item expandido",
                adaptativa:false,
                evento:true
            },
            contraido:{
                etiqueta:"Item contraído",
                adaptativa:false,
                evento:true
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     * @returns {componenteArbol}
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.contenedor=this.elemento.querySelector(".componente-arbol-plantilla");

        this.clasesCss.push("no-interactivo");

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     * @returns {componenteArbol}
     */
    this.crear=function() {
        this.elemento=document.crear("<div></div>");
        this.contenedor=document.crear("<div class='componente-arbol-plantilla'></div></div>")
            .anexarA(this.elemento);
        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
        this.actualizar();
        this.prototipo.listo.call(this);
    };

    /**
     * Actualiza el componente.
     * @returns {componenteArbol}
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        if(propiedad=="interactivo") {
	            if(valor===false||valor===0||valor==="0") {
	                this.elemento.agregarClase("no-interactivo");
	            } else {
	                this.elemento.removerClase("no-interactivo");
	            }
	            return this;
	        }
	    }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Actualiza el componente.
     * @returns {componenteArbol}
     */
    this.actualizarIterativo=function() {
        if(ui.enModoEdicion()) return this;
        
        var rutasAbiertas=this.obtenerItemsExpandidos();

        //TODO Actualizar elementos al actualizar el origen de datos
        //Por el momento, el árbol siempre se regenera por completo, sus items nunca son actualizados
        this.redibujar=true;
        if(this.ul) this.ul.remover();

        this.prototipo.actualizarIterativo.call(this);
        
        //Volver a abrir los items
        this.expandirItems(rutasAbiertas);
        
        return this;
    };    
    
    /**
     * Elimina el mensaje de bloque sin datos, si existe.
     * @returns {componenteArbol}
     */
     this.removerMensajeSinDatos=function() {
        if(this.itemSinDatos) {
            this.itemSinDatos.remover();
            this.itemSinDatos=null;
        }
        return this;
    };

    /**
     * Genera el mensaje de bloque sin datos.
     * @returns {componenteArbol}
     */
    this.mostrarMensajeSinDatos=function() {
        var texto=this.propiedad(null,"mensajeVacio");
        if(!texto||this.itemSinDatos) return this;

        if(!this.elementoPadre) this.elementoPadre=this.elemento.padre();

        this.itemSinDatos=document.crear("div")
            .agregarClase("autogenerado item-sin-datos")
            .anexarA(this.elemento)
            .establecerHtml(texto);

        return this;
    };

    /**
     * Genera y agrega un nuevo item correspondiente a un elemento del origen de datos del componente iterativo.
     * @param {Node} destino - Elemento de destino. Por defecto, `this.contenedorItems` o `this.elemento`.
     * @param {*} objeto - Objeto o elemento del origen de datos.
     * @param {number} indice - Indice del elemento en el listado u origen de datos.
     * @param {Object} recursivo - Parámetros del recorrido recursivo del listado, si corresponde.
     * @returns {Node}
     */
    this.generarItem=function(destino,objeto,indice,recursivo) {
        if(typeof destino=="undefined"||!destino) destino=this.elemento;

        var li=documento.crear("<li class='arbol-item'>")
                .anexarA(destino),
            contenedor=documento.crear("<div class='contenedor arbol-componentes-item'>")
                .anexarA(li);

        this.li.push(li);
        
        if(recursivo.expandir) li.agregarClase("expandido");

        li.dato("ruta",recursivo.ruta.concat(indice).join("."));

        this.prototipo.generarItem.call(this,contenedor,objeto,indice,recursivo);
        
        return li;
    };    

    /**
     * Genera los items del árbol.
     * @param {number} [indice] - Ignorado.
     * @param {object[]} [listado] - Listado a utilizar. Por defecto, utilizará el origen de datos.
     * @param {Node} [destino] - Elemento de destino. Por defecto, utilizará el elemento del componente.
     * @param {int} [recursivo.nivel=0] - Nivel actual.
     * @param {Object} [recursivo] - Parámetros para recorrer `listado` en forma recursiva. Puede presentar propiedades adicionales, las cuales serán pasadas
     * tal cual a la descendencia.
     * @param {string} [recursivo.propiedad] - Propiedad de cada elemento de `listado` que contiene la descendencia.
     * @param {int} [recursivo.nivel=0] - Nivel actual.
     * @param {int[]} [recursivo.ruta] - Ruta actual, como listado de índices.
     * @returns {componenteArbol}
     */
    this.generarItems=function(indice,listado,destino,recursivo) {
        if(typeof destino=="undefined") destino=this.elemento;

        var ul=documento.crear("<ul class='arbol-listado'>")
            .anexarA(destino);

        if(typeof recursivo=="undefined") {
            //Primer nivel     
            this.li=[];
            this.ul=ul;

            recursivo={
                propiedad:this.propiedad(false,"descendencia"),
                expandir:this.propiedad(false,"estadoInicial")=="expandido"
            };
        }

        destino=ul;
        
        this.prototipo.generarItems.call(this,null,listado,destino,recursivo);

        return this;
    };

    /**
     * Devuelve un listado de las rutas de los items expandidos.
     * @returns {string[]}
     */
     this.obtenerItemsExpandidos=function() {
        var resultado=[];
        if(!this.ul) return resultado;
        this.ul.querySelectorAll(".arbol-item.expandido").porCada(function(i,elem) {
            resultado.push(elem.dato("ruta"));
        });
        return resultado;
    };

    /**
     * Expande los ítems especificados dadas sus rutas.
     * @param {string[]} rutas 
     * @returns {componenteArbol}
     */
    this.expandirItems=function(rutas) {
        rutas.porCada(function(i,ruta) {
            t.expandir(ruta);
        });
        return this;
    };

    /**
     * Expande o abre un nivel dada su ruta.
     * @param {string} [ruta] - Ruta como array o índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`). Si se omite, se expandirá el árbol
     * completo. Para expandir todo el primer nivel (pero no los sub-niveles), especificar `-1`.
     * @returns {componenteArbol}
     */
    this.expandir=function(ruta) {
        if(typeof ruta==="undefined") {
            this.ul.querySelectorAll("li").agregarClase("expandido");
            return this;
        }
        
        if(ruta==="-1") {
            this.ul.hijos({etiqueta:"li"}).forEach(function(elem) {
                elem.agregarClase("expandido");
            });
            return this;
        }

        var elem=this.obtenerItem(ruta);
        if(!elem) return this;
        elem.agregarClase("expandido");

        var evento=document.createEvent("Event");
            evento.ruta=ruta;
        this.procesarEvento("expandido","expandido",null,evento);

        return this;
    };

    /**
     * Contrae o cierra un nivel dada su ruta.
     * @param {string} [ruta] - Ruta como array o índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`). Si se omite, se expandirá
     * el árbol completo. Para contraer todo el primer nivel (pero mantener el estado de los sub-niveles), especificar `-1`.
     * @returns {componenteArbol}
     */
    this.contraer=function(ruta) {
        if(typeof ruta==="undefined") {
            this.ul.querySelectorAll("li").removerClase("expandido");
            return this;
        }
        
        if(ruta==="-1") {
            this.ul.hijos({etiqueta:"li"}).forEach(function(elem) {
                elem.removerClase("expandido");
            });
            return this;
        }

        var elem=this.obtenerItem(ruta);
        if(!elem) return this;
        elem.removerClase("expandido");

        var evento=document.createEvent("Event");
            evento.ruta=ruta;
        this.procesarEvento("contraido","contraido",null,evento);

        return this;
    };

    /**
     * Alterna el estado de un nivel dada su ruta.
     * @param {string} [ruta] - Ruta como índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`). Si se omite, se expandirá/contraerá el árbol
     * completo. Para alternar todo el primer nivel (pero mantener el estado de los sub-niveles), especificar `-1`.
     * @returns {componenteArbol}
     */
    this.alternar=function(ruta) {
        if(typeof ruta==="undefined") {
            this.ul.querySelectorAll("li").alternarClase("expandido");
            return this;
        }
        
        if(ruta==="-1") {
            this.ul.hijos({etiqueta:"li"}).forEach(function(elem) {
                elem.alternarClase("expandido");
            });
            return this;
        }

        var elem=this.obtenerItem(ruta);
        if(!elem) return this;
        elem.alternarClase("expandido");

        var tipo="expandido",
            evento=document.createEvent("Event");
            evento.ruta=ruta;
        if(!elem.es({clase:"expandido"})) tipo="contraido";
        this.procesarEvento(tipo,tipo,null,evento);

        return this;
    };

    /**
     * Determina si un nivel se encuentra expandido o no.
     * @param {string} [ruta] - Ruta como índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`).
     * @returns {boolean}
     */
    this.expandido=function(ruta) {
        var elem=this.obtenerItem(ruta);
        return elem&&elem.es({clase:"expandido"});
    };

    /**
     * Genera y devuelve el valor de retorno según las propiedades `devuelve`, `filtrarPropiedades` y `filtrarItems`.
     * @returns {*}
     */
    this.extraerValor=function() {
        return this.prototipo.extraerValor.call(
            this,
            this.propiedad(false,"descendencia"),
            this.propiedad(false,"devuelve")=="listado"
        );
    };

    /**
     * Devuelve un elemento del origen de datos correspondiente a un índice o, en el caso de listados a nidados, una ruta.
     * @param {(number|string|number[])} [indice] - Índice, o ruta como array o índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`).
     * @returns {(Object|null)}
     */
    this.obtenerObjetoDatos=function(indice) {
        return this.prototipo.obtenerObjetoDatos.call(
            this,
            indice,
            this.propiedad(false,"descendencia")
        );
    };

    /**
     * Devuelve el elemento (`<li>`) correspondiente a un nivel.
     * @param {string} [ruta] - Ruta como array o índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`).
     * @returns {Node}
     */
    this.obtenerItem=function(ruta) {
        var elemento=this.ul;

        if(typeof ruta=="string") ruta=ruta.split(".");

        for(var i=0;i<ruta.length;i++) {
            var indice=parseInt(ruta[i]);

            if(typeof elemento=="undefined") return null;

            if(elemento.nodeName=="LI") {
                //Si estamos en un <li>, tomar el <ul>
                elemento=elemento.hijos({etiqueta:"ul"});
                if(!elemento.length) return null;
                elemento=elemento[0];
            }
            
            var hijos=elemento.hijos({etiqueta:"li"});
            
            if(!hijos.length||hijos.length<indice) return null;
            
            elemento=hijos[indice];
        }

        return elemento;
    };

    /**
     * Dado un elemento del árbol, devuelve su ruta.
     * @param {(Element|Node)} elemento - Elemento `<li>`.
     * @returns {(string|null)}
     */
    this.obtenerRuta=function(elemento) {
        if(!elemento.es({clase:"arbol-item"})) return null;
        return elemento.dato("ruta");
    };

    /**
     * Evento Click. Por defecto, expande/contrae el nivel.
     * @param {MouseEvent} evento - Parámetros del evento.
     * @returns {boolean}
     */
    this.click=function(evento) {
    	var interactivo=this.propiedad("interactivo");
    	if(interactivo!==null&&!interactivo) return false;

        //Buscar el <li>
        var li=null;
        for(var i=0;i<evento.path.length;i++) {
            if(!(evento.path[i] instanceof Node)||evento.path[i].nodeName=="BODY"||evento.path[i].nodeName=="HTML") break;
            if(evento.path[i].es({clase:"arbol-item"})) {
                li=evento.path[i];
                break;
            }
        }

        //Ejecutar evento
        evento.ruta=t.obtenerRuta(li);
        var retorno=t.procesarEvento("click","click",null,evento);
        
        //Si no hubo un controlador definido, alternar
        if(retorno!==true) {
            li.alternarClase("expandido");

            var tipo="expandido";
            if(!li.es({clase:"expandido"})) tipo="contraido";
            this.procesarEvento(tipo,tipo,null,evento);
        }

        return true;
    };
};

ui.registrarComponente("arbol",componenteArbol,configComponente.clonar({
    descripcion:"Lista anidada (árbol)",
    etiqueta:"Árbol",
    grupo:"Estructura",
    icono:"arbol.png"
}));