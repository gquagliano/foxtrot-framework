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

    var t=this,
    	ignorarValor=false;

    this.componente="arbol";

    this.itemsAutogenerados=[];
    this.itemSinDatos=null;
    this.listado=null;
    
    this.redibujar=true;

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
            propiedad:{
                etiqueta:"Propiedad",
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

    //Remover propiedad común "Propiedad" (movida al grupo "Árbol")
    delete this.propiedadesComunes["Datos"]["propiedad"];

    /**
     * Inicializa la instancia tras ser creada o restaurada.
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
     * Establece el origen de datos.
     * @param {Object} obj - Objeto a asignar.
     * @param {boolean} [actualizar=true] - Actualizar el componente luego de establecer el origen de datos.
     * @returns Componente
     */
    this.establecerDatos=function(obj,actualizar) {
        //No recursivo, ya que los componentes que contiene se usan solo como plantilla, y sin tener en cuenta el valor de `propiedad`.
        this.redibujar=true;
        this.prototipo.establecerDatos.call(this,obj,actualizar,false,true);
        return this;
    };

    /**
     * Devuelve un listado de las rutas de los items abiertos.
     * @returns string[]
     */
    this.obtenerItemsAbiertos=function() {
        var resultado=[];
        if(!this.listado) return resultado;
        this.listado.querySelectorAll(".arbol-item.expandido").porCada(function(i,elem) {
            resultado.push(elem.dato("ruta"));
        });
        return resultado;
    };

    /**
     * Abre los ítems especificados dadas sus rutas.
     * @param {string[]} rutas 
     * @returns {componenteArbol}
     */
    this.abrirItems=function(rutas) {
        rutas.porCada(function(i,ruta) {
            t.expandir(ruta);
        });
        return this;
    };

    /**
     * Actualiza el componente.
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
     * @returns {Componente}
     */
    this.actualizar=function() {
        this.prototipo.actualizar.call(this,false);

        if(ui.enModoEdicion()) return;

        this.actualizacionEnCurso=true;

        //Aplicar cambios en los campos
        if(!this.redibujar) this.obtenerDatosActualizados();
        this.redibujar=false;

        var rutasAbiertas=this.obtenerItemsAbiertos();        

        //Limpiar filas autogeneradas
        if(this.listado) {
            ui.eliminarComponentes(this.listado);
            this.listado=null;
        }
        this.itemsAutogenerados=[];

        if(!this.datos||!util.esArray(this.datos)) return this;

        //Ocultamos toda la descendencia para que las instancias originales de los campos que se van a duplicar no se vean afectadas al obtener/establecer los valores de la vista
        this.ocultarDescendencia();

        if(this.itemSinDatos) {
            this.itemSinDatos.remover();
            this.itemSinDatos=null;
        }

        if(!this.datos.length) {
            this.mostrarMensajeSinDatos();
        } else {
            this.generarItems();
            //Volver a abrir los items
            this.abrirItems(rutasAbiertas);
        }
        
        this.actualizacionEnCurso=false;

        return this;
    };

    /**
     * Genera el mensaje de bloque sin datos.
     * @returns {Componente}
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
     * Genera y devuelve un nuevo item.
     * @param {Componente} elemento - Elemento a clonar.
     * @param {(Node|Element)} elementoPadre - Elemento de destino donde insertar el componente.
     * @param {Object} obj - Objeto a representar (datos del item).
     * @param {number} nivel - Nivel actual dentro del árbol.
     * @param {string} ruta - Ruta como concatenación de índices.
     * @param {number} indice - Indice del origen de datos (índice del elemento).
     * @returns {Componente}
     */
    this.generarItem=function(hijo,elementoPadre,obj,nivel,ruta,indice) {
        var nuevo=hijo.clonar(elementoPadre,true);
        this.itemsAutogenerados.push(nuevo);

        //Agregar métodos al origen de datos

        obj.obtenerIndice=(function(i) {
            return function() {
                return i;
            };
        })(indice);

        obj.obtenerNivel=(function(i) {
            return function() {
                return i;
            };
        })(nivel);

        obj.obtenerRuta=(function(i) {
            return function() {
                return i;
            };
        })(ruta);

        nuevo.establecerDatos(obj)
            .establecerValores(obj,true);
        nuevo.indice=indice;
        nuevo.nivel=nivel;
        nuevo.ruta=ruta;
        nuevo.autogenerado=true;
        nuevo.obtenerElemento().agregarClase("autogenerado");

        return nuevo;
    };

    /**
     * Genera los items del componente.
     * @param {object[]} [listado] - Listado de items a utilizar. Por defecto, utilizará el origen de datos y avanzará recursivamente a por la propiedad establecida.
     * @param {(Node|Element)} [padre] - Elemento padre. Por defecto, utilizará el elemento del componente. En el nivel `0`, el `<ul>` generado será asignado a `this.listado`.
     * @param {number} [nivel=0] - Nivel actual.
     * @param {string[]} [ruta] - Ruta actual.
     * @param {string} [propiedad] - Nombre de la propiedad que contiene la descendencia. Por defecto, utilizará el valor de *Propiedad* (`propiedad`).
     * @param {boolean} [expandido] - Crear expandido. Por defecto, utilizará el valor de *Estado inicial* (`estadoInicial`).
     * @returns {Componente}
     */
    this.generarItems=function(listado,elementoPadre,nivel,ruta,propiedad,expandido) {
        if(typeof listado==="undefined") listado=this.datos;
        if(typeof elementoPadre==="undefined") elementoPadre=this.elemento;
        if(typeof nivel==="undefined") nivel=0;
        if(typeof ruta==="undefined") ruta=[];
        if(typeof propiedad==="undefined") propiedad=this.propiedad(false,"propiedad");
        if(typeof expandido==="undefined") expandido=this.propiedad(false,"estadoInicial")=="expandido";

        var ul=documento.crear("<ul class='arbol-listado'>")
            .anexarA(elementoPadre);
        if(nivel==0) this.listado=ul;

        //TODO Implementar util.recorrerSinRecursion() cuando este método esté estable  (al momento de escribir esto, se estaba migrando desde Foxtrot 6)

        if(listado) {
            listado.forEach(function(obj,indice) {
                var li=documento.crear("<li class='arbol-item'>")
                        .anexarA(ul),
                    contenedor=documento.crear("<div class='contenedor arbol-componentes-item'>")
                        .anexarA(li);
                if(expandido) li.agregarClase("expandido");

                var rutaItem=ruta.concat(indice).join(".");
                li.dato("ruta",rutaItem);

                t.obtenerHijos().forEach(function(hijo) {
                    if(!t.autogenerado) t.generarItem(hijo,contenedor,obj,nivel,rutaItem,indice);
                });

                //Si tienen la propiedad con la descendencia, avanzar recursivamente
                if(obj.hasOwnProperty(propiedad)) {
                    t.generarItems(obj[propiedad],li,nivel+1,ruta.concat(indice),propiedad,expandido);
                }

                //Sin hijos
                if(!obj.hasOwnProperty(propiedad)||!util.esArray(obj[propiedad])||!obj[propiedad].length) li.agregarClase("ultimo-nivel");
            });
        }

        return this;
    };

    /**
     * Devuelve o establece el valor del componente.
     * @param {*} [valor] - Valor a establecer
     * @returns {*}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") {
        	if(ignorarValor) return null;
            //Cuando se solicite el valor del componente, devolver el origen de datos actualizado con las propiedades que puedan haber cambiado
            return this.extraerValor();
        } else if(valor===null) {
            //Si valor es null, solo limpiar
            this.limpiarValoresAutogenerados();
        } else {
            //Cuando se asigne un valor, tratarlo como nuevo origen de datos
            this.establecerDatos(valor);
        }
    };

    this.limpiarValoresAutogenerados=function() {
        for(var i=0;i<this.itemsAutogenerados.length;i++)
            this.itemsAutogenerados[i].limpiarValores();
        return this;
    };

    /**
     * Genera y devuelve el valor de retorno según las propiedades `devuelve`, `filtrarPropiedades` y `filtrarItems`.
     * @returns {*}
     */
    this.extraerValor=function() {
        var obj=this.obtenerDatosActualizados(),
            devuelve=this.propiedad(false,"devuelve"),
            propiedad=this.propiedad(false,"propiedad"),
            propiedades=this.propiedad(false,"filtrarPropiedades"),
            filtro=this.propiedad(false,"filtrarItems");

        if(!obj) return obj;

        var filtrar=function(item) {
            if(filtro&&!item[filtro]) return null;

            if(!propiedades||typeof item!="object") return item;

            if(typeof propiedades!="string") {
                propiedades=propiedades.split(",");
                for(var i=0;i<propiedades.length;i++)
                    propiedades[i]=propiedades[i].trim();
            }

            var nuevoItem={};

            for(var prop in item) {
                if(~propiedades.indexOf(prop))
                    nuevoItem[prop]=item[prop];
            }

            return nuevoItem;
        },
        listado=[];

        (function recorrer(items,destino) {
            for(var i=0;i<items.length;i++) {
                var item=items[i],
                    filtrado=filtrar(item);

                if(filtrado===null) {
                    //Si el item no se incluye tras los filtros, se debe detener la búsqueda solo si el valor debe ser devuelto como árbol, de
                    //lo contrario, el item se omite pero continúa la búsqueda en forma recursiva añadiendo los items al listado independientemente
                    //de si la ascendencia fue incluida o no.
                    if(devuelve!="listado") continue;
                } else {
                    destino.push(filtrado);
                }

                if(propiedad&&typeof item[propiedad]=="object") {
                    if(devuelve=="listado") {
                        //Agregar descendencia directamente en el listado 
                        recorrer(item[propiedad],destino);
                    } else {
                        //Mantener la estructura anidada
                        destino[propiedad]=[];
                        recorrer(item[propiedad],destino[propiedad]);
                    }
                }
            }
        })(obj,listado);

        return listado;
    };

    /**
     * Devuelve el origen de datos actualizado con las propiedades que hayan cambiado por tratarse de componentes de ingreso de datos (campos, etc.)
     * @returns {Object[]}
     */
    this.obtenerDatosActualizados=function() {
    	//Pausar la respuesta de valor(), que invocaría obtenerDatosActualizados()
    	ignorarValor=true;
        var res=this.prototipo.obtenerDatosActualizados.call(this,this.itemsAutogenerados,function(elem,indice) {
        	//Buscar la fila a la que corresponde cada componente con nombre
        	var item=elem.obtenerElemento().padre({clase:"arbol-item"}),
        		ruta=item.dato("ruta");
        	return t.obtenerObjeto(ruta,false);        	
        });
        ignorarValor=false;
        return res;
    };

    /**
     * Busca todos los componentes con nombre que desciendan de este componente y devuelve un objeto con sus valores.
     * @returns {Object}
     */
    this.obtenerValores=function() {
        return;
        //No queremos que continúe la búsqueda en forma recursiva entre los componentes autogenerados
    };

    /**
     * Agrega un nuevo elemento.
     * @param {*} obj - Elemento a insertar.
     * @returns {componente}
     */
    this.agregarElemento=function(obj) {
        if(!util.esArray(this.datos)) this.datos=[];

        //Preservar estado actual
        this.datos=this.obtenerDatosActualizados();

        this.datos.push(obj);
        this.actualizar();
        return this;
    };

    /**
     * Remueve un elemento dado su índice.
     * @param {number} indice - Número de fila (basado en 0).
     * @returns {componente}
     */
    this.removerElemento=function(indice) {
        //Preservar estado actual
        this.datos=this.obtenerDatosActualizados();

        this.datos.splice(indice,1);
        this.actualizar();
        return this;
    };

    /**
     * Expande o abre un nivel dada su ruta.
     * @param {string} [ruta] - Ruta como índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`). Si se omite, se expandirá el árbol completo. Para expandir todo
     * el primer nivel, especificar `-1`.
     * @returns {componenteArbol}
     */
    this.expandir=function(ruta) {
        if(typeof ruta==="undefined") {
            this.listado.querySelectorAll("li").agregarClase("expandido");
            return this;
        }
        
        if(ruta==="-1") {
            this.listado.hijos({etiqueta:"li"}).forEach(function(elem) {
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
     * @param {string} [ruta] - Ruta como índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`). Si se omite, se expandirá el árbol completo. Para contraer todo
     * el primer nivel, especificar `-1`.
     * @returns {componenteArbol}
     */
    this.contraer=function(ruta) {
        if(typeof ruta==="undefined") {
            this.listado.querySelectorAll("li").removerClase("expandido");
            return this;
        }
        
        if(ruta==="-1") {
            this.listado.hijos({etiqueta:"li"}).forEach(function(elem) {
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
     * completo. Para alternar todo el primer nivel, especificar `-1`.
     * @returns {componenteArbol}
     */
    this.alternar=function(ruta) {
        if(typeof ruta==="undefined") {
            this.listado.querySelectorAll("li").alternarClase("expandido");
            return this;
        }
        
        if(ruta==="-1") {
            this.listado.hijos({etiqueta:"li"}).forEach(function(elem) {
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
     * Devuelve un objeto correspondiente a un nivel e índice.
     * @param {string} [ruta] - Ruta como índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`).
     * @param {boolean} [actualizarValores=true] - Determina si se debe utilizar el listado de valores actualizados (`true`) o el
     * origen de datos actual.
     * @returns {(object|null)}
     */
    this.obtenerObjeto=function(ruta,actualizarValores) {
    	if(typeof actualizarValores=="undefined") actualizarValores=true;

        var obj=actualizarValores?this.obtenerDatosActualizados():this.datos,
            propiedad=this.propiedad("propiedad");
        ruta=ruta.split(".");

        for(var i=0;i<ruta.length;i++) {
            var indice=parseInt(ruta[i]);
            
            if(i>0) {
                if(!obj.hasOwnProperty(propiedad)||!util.esArray(obj[propiedad])) return null;
                obj=obj[propiedad];
            }

            if(!util.esArray(obj)||obj.length<indice) return null;

            obj=obj[indice];
        }

        return obj;
    };

    /**
     * Devuelve el elemento (`<li>`) correspondiente a un nivel.
     * @param {string} [ruta] - Ruta como índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`).
     * @returns {Node}
     */
    this.obtenerItem=function(ruta) {
        var elemento=this.listado;
        ruta=ruta.split(".");

        for(var i=0;i<ruta.length;i++) {
            var indice=parseInt(ruta[i]);

            if(typeof elemento==="undefined") return null;

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
            if(evento.nodeName==="BODY") break;
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
    descripcion:"Lista jerárquica (árbol)",
    etiqueta:"Árbol",
    grupo:"Estructura",
    icono:"arbol.png"
}));