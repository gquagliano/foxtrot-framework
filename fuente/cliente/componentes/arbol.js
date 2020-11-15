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

    this.itemsAutogenerados=[];
    this.itemSinDatos=null;
    this.listado=null;

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
            expandido:{
                etiqueta:"Expandido",
                tipo:"logico",
                ayuda:"Esta propiedad afecta solo al estado inicial del componente.",
                adaptativa:false
            },
            propiedad:{
                etiqueta:"Propiedad",
                adaptativa:false,
                ayuda:"Nombre de la propiedad que contiene la descendencia."
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
        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div></div>");
        this.contenedor=document.crear("<div class='componente-arbol-plantilla'></div></div>")
            .anexarA(this.elemento);
        this.clasePadre.crear.call(this);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {
        this.actualizar();
        this.clasePadre.listo.call(this);
    };
    
    /**
     * Establece el origen de datos.
     * @param {Object} obj - Objeto a asignar.
     * @param {boolean} [actualizar=true] - Actualizar el componente luego de establecer el origen de datos.
     * @returns Componente
     */
    this.establecerDatos=function(obj,actualizar) {
        //No recursivo, ya que los componentes que contiene se usan solo como plantilla, y sin tener en cuenta el valor de `propiedad`.
        this.clasePadre.establecerDatos.call(this,obj,actualizar,false,true);
        return this;
    };

    /**
     * Actualiza el componente.
     * @returns {Componente}
     */
    this.actualizar=function() {
        //Limpiar filas autogeneradas
        if(this.listado) {
            this.listado.remover();
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
        }

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
            .anexarA(this.elementoPadre)
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
     * @param {boolean} [expandido] - Crear expandido. Por defecto, utilizará el valor de *Expandido* (`expandido`).
     * @returns {Componente}
     */
    this.generarItems=function(listado,elementoPadre,nivel,ruta,propiedad,expandido) {
        if(typeof listado==="undefined") listado=this.datos;
        if(typeof elementoPadre==="undefined") elementoPadre=this.elemento;
        if(typeof nivel==="undefined") nivel=0;
        if(typeof ruta==="undefined") ruta=[];
        if(typeof propiedad==="undefined") propiedad=this.propiedad("propiedad");
        if(typeof expandido==="undefined") expandido=this.propiedad("expandido");

        var ul=documento.crear("<ul class='arbol-listado'>")
            .anexarA(elementoPadre);
        if(nivel==0) this.listado=ul;

        //TODO Implementar util.recorrerSinRecursion() cuando este método esté estable  (al momento de escribir esto, se estaba migrando desde Foxtrot 6)

        listado.forEach(function(obj,indice) {
            var li=documento.crear("<li class='arbol-item'>")
                .anexarA(ul);
            if(expandido) li.agregarClase("expandido");

            var rutaItem=ruta.concat(indice).join(".");
            li.dato("ruta",rutaItem);

            t.obtenerHijos().forEach(function(hijo) {
                if(!t.autogenerado) t.generarItem(hijo,li,obj,nivel,rutaItem,indice);
            });

            //Si tienen la propiedad con la descendencia, avanzar recursivamente
            if(obj.hasOwnProperty(propiedad)) {
                t.generarItems(obj[propiedad],li,nivel+1,ruta.concat(indice),propiedad,expandido);
            }

            //Sin hijos
            if(!obj.hasOwnProperty(propiedad)||!util.esArray(obj[propiedad])||!obj[propiedad].length) li.agregarClase("ultimo-nivel");
        });

        return this;
    };

    /**
     * Devuelve o establece el valor del componente.
     * @param {*} [valor] - Valor a establecer
     * @returns {*}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") {
            //Cuando se solicite el valor del componente, devolver el origen de datos actualizado con las propiedades que puedan haber cambiado
            return this.obtenerDatosActualizados();            
        } else {
            //Cuando se asigne un valor, establecer como origen de datos
            this.establecerDatos(valor);
        }
    };

    /**
     * Obtiene una copia del origen de datos actualizado con las propiedades que hayan cambiado por tratarse de componentes de ingreso de datos (campos, etc.)
     * @returns {(Object[])}
     */
    this.obtenerDatosActualizados=function() {
        var resultado=this.datos?this.datos.clonar():[];

        var fn=function(comp,indice) {
            comp.obtenerHijos().forEach(function(hijo) {
                var propiedad=hijo.propiedad(null,"propiedad"),
                    nombre=hijo.obtenerNombre(),
                    valor=hijo.valor();
                if(typeof valor!=="undefined") {
                    if(propiedad) {
                        util.asignarPropiedad(resultado[indice],propiedad,valor);
                    } else if(nombre) {
                        resultado[indice][nombre]=valor;
                    }
                }
                fn(hijo,indice);
            });
        };

        this.itemsAutogenerados.forEach(function(hijo) {
            //if(!hijo.autogenerado) return;
            if(resultado.length<=hijo.indice) resultado[hijo.indice]={};
            
            //Dentro de cada item, buscar recursivamente todos los componentes relacionados con una propiedad
            fn(hijo,hijo.indice);
        });

        return resultado;
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
        return this;
    };

    /**
     * Alterna el estado de un nivel dada su ruta.
     * @param {string} [ruta] - Ruta como índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`). Si se omite, se expandirá el árbol completo. Para alternar todo
     * el primer nivel, especificar `-1`.
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
     * @param {string} [ruta] - Ruta como índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`). Si se omite, se expandirá el árbol completo. Para expandir solo
     * el primer nivel, especificar `0`.
     * @returns {(object|null)}
     */
    this.obtenerObjeto=function(ruta) {
        var obj=this.obtenerDatosActualizados(),
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
     * @param {string} [ruta] - Ruta como índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`). Si se omite, se expandirá el árbol completo. Para expandir solo
     * el primer nivel, especificar `0`.
     * @returns {Node}
     */
    this.obtenerItem=function(ruta) {
        var elemento=this.listado;
        ruta=ruta.split(".");

        for(var i=0;i<ruta.length;i++) {
            var indice=parseInt(ruta[i]);

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
        console.log(retorno)

        //Si no hubo un manejador definido, alternar
        if(retorno!==true) li.alternarClase("expandido");

        return true;
    };
};

ui.registrarComponente("arbol",componenteArbol,configComponente.clonar({
    descripcion:"Lista jerárquica (árbol)",
    etiqueta:"Árbol",
    grupo:"Estructura",
    icono:"arbol.png"
}));