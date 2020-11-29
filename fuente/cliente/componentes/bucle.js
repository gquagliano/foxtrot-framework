/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Bucle.
 * @class
 * @extends componente
 */
var componenteBucle=function() {   
    "use strict";

    this.componente="bucle";

    this.itemsAutogenerados=[];
    this.itemSinDatos=null;
    this.elementoPadre=null;

    /**
     * Propiedades de Bucle.
     */
    this.propiedadesConcretas={
        "Bucle":{
            mensajeVacio:{
                etiqueta:"Mensaje de bloque vacío",
                ayuda:"Cuando se asigne un origen de datos vacío, se mostrará este mensaje.",
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.contenedor=this.elemento.querySelector(".componente-bucle-plantilla");
        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div></div>");
        this.contenedor=document.crear("<div class='componente-bucle-plantilla'></div></div>")
            .anexarA(this.elemento);
        this.clasePadre.crear.call(this);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {        
        //Ocultar toda la descendencia para que las instancias originales de los campos que se van a duplicar no se vean afectadas al obtener/establecer los valores de la vista
        this.ocultarDescendencia();

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
        //No recursivo, ya que los componentes que contiene se usan solo como plantilla
        this.clasePadre.establecerDatos.call(this,obj,actualizar,false);
        return this;
    };

    /**
     * Actualiza el componente.
     * @returns {Componente}
     */
    this.actualizar=function() {
        //Limpiar filas autogeneradas
        this.itemsAutogenerados.forEach(function(item) {
            item.eliminar();
        });
        this.itemsAutogenerados=[];

        if(!this.datos||!util.esArray(this.datos)) return this;

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
        var texto=this.propiedad("mensajeVacio");
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
     * @param {Object} obj - Objeto a representar (datos del item).
     * @param {number} indice - Indice del origen de datos (índice del elemento).
     * @returns {Componente}
     */
    this.generarItem=function(hijo,obj,indice) {
        if(!this.elementoPadre) this.elementoPadre=this.elemento.padre();
        var nuevo=hijo.clonar(this.elementoPadre,true); //Anexar al padre del componente bucle

        this.itemsAutogenerados.push(nuevo);

        //Agregar método al origen de datos
        obj.obtenerIndice=(function(i) {
            return function() {
                return i;
            };
        })(indice);

        nuevo.establecerDatos(obj);
        nuevo.indice=indice;
        nuevo.autogenerado=true;
        nuevo.ocultarDescendencia();
        nuevo.obtenerElemento().agregarClase("autogenerado");

        return nuevo;
    };

    /**
     * Genera los items del componente.
     * @returns {Componente}
     */
    this.generarItems=function() {
        var t=this;

        this.datos.forEach(function(obj,indice) {
            t.obtenerHijos().forEach(function(hijo) {
                if(!t.autogenerado) t.generarItem(hijo,obj,indice);
            });
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
                var propiedad=hijo.propiedad(false,"propiedadValor")||hijo.propiedad(false,"propiedad"),
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
};

ui.registrarComponente("bucle",componenteBucle,configComponente.clonar({
    descripcion:"Bucle",
    etiqueta:"Bucle",
    grupo:"Control",
    icono:"bucle.png"
}));