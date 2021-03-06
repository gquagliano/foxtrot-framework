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

    this.descartarValores=false;

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
        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div></div>");
        this.contenedor=document.crear("<div class='componente-bucle-plantilla'></div></div>")
            .anexarA(this.elemento);
        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Evento Listo.
     */
    this.listo=function() {        
        //Ocultar toda la descendencia para que las instancias originales de los campos que se van a duplicar no se vean afectadas al obtener/establecer los valores de la vista
        this.ocultarDescendencia();

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
        //No recursivo, ya que los componentes que contiene se usan solo como plantilla
        this.descartarValores=true;
        this.prototipo.establecerDatos.call(this,obj,actualizar,false);
        return this;
    };

    /**
     * Actualiza el componente.
     * @param {boolean} [redibujar=false] - Si es `true`, descartará el contenido y forzará el redibujado del componente completo.
     * @returns {componente}
     */
    this.actualizar=function(redibujar) {
        if(typeof redibujar==="undefined") redibujar=false;

        this.prototipo.actualizar.call(this,false);

        if(ui.enModoEdicion()) return;
        
        this.actualizacionEnCurso=true;

        //var indiceFoco=-1;

        if(redibujar) {
            //Aplicar cambios en los campos
            if(!this.descartarValores) this.obtenerDatosActualizados();
            this.descartarValores=false;

            //Almacenar dónde está el foco
            //var enfocables=this.elemento.buscarEnfocables(),    
            //    foco=this.elemento.activeElement||(event&&event.activeElement)||(event&&event.target);
            //indiceFoco=enfocables.indexOf(foco);
        }

        if(redibujar||!this.datos||!this.datos.length) {
            //Limpiar filas autogeneradas
            ui.eliminarComponentes(this.itemsAutogenerados);
            this.itemsAutogenerados=[];
        }
        
        this.removerMensajeSinDatos();

        if(!this.datos) {
            this.actualizacionEnCurso=false;
            return this;
        }        

        if(!this.datos.length) {
            this.mostrarMensajeSinDatos();
        } else {
            this.generarItems();

            //Intentar reestablecer el foco
            //if(indiceFoco>=0) {
            //    enfocables=this.elemento.buscarEnfocables();
            //    if(indiceFoco<enfocables.length) enfocables[indiceFoco].focus();
            //}
        }
        
        this.actualizacionEnCurso=false;

        return this;
    };
    
    /**
     * Elimina el mensaje de bloque sin datos, si existe.
     * @returns {componente}
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
     * @returns {componente}
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
     * Genera y agrega un nuevo item.
     * @param {number} indice - Indice del origen de datos (índice del elemento).
     * @returns {componente}
     */
    this.generarItem=function(indice) {
        var t=this;

        if(!this.elementoPadre) this.elementoPadre=this.elemento.padre();
        
        this.obtenerHijos().forEach(function(hijo) {
            if(hijo.autogenerado) return;
    
            var nuevo=hijo.clonar(t.elementoPadre,true); //Anexar al padre del componente bucle

            t.itemsAutogenerados.push(nuevo);

            var obj=t.datos[indice];

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
        });

        return this;
    };

    /**
     * Genera los items del componente.
     * @param {number} [indice] - Índice del objeto de datos que se desea generar. Si se omite, iterará sobre todo el origen de datos. 
     * @returns {componente}
     */
    this.generarItems=function(indice) {
        var t=this;

        var fn=function(i) {
            if(i>=t.itemsAutogenerados.length) {
                t.generarItem(i);
            } else {
                t.itemsAutogenerados[i].establecerDatos(t.datos[i]);
            }
        },
        remover=function(i) {
            t.itemsAutogenerados[i].eliminar();
            t.itemsAutogenerados.splice(i,1);
        };

        if(typeof indice==="number") {
            fn(indice);
        } else {
            this.datos.forEach(function(obj,indice) {
                fn(indice);
            });
            //Remover items excedentes
            if(this.datos.length<this.itemsAutogenerados.length) {
                for(var i=this.datos.length;i<this.itemsAutogenerados.length;i++)
                    remover(i);
            }
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
            //Cuando se solicite el valor del componente, devolver el origen de datos actualizado con las propiedades que puedan haber cambiado
            return this.obtenerDatosActualizados();            
        } else {
            //Cuando se asigne un valor, establecer como origen de datos
            this.establecerDatos(valor);
        }
    };

    /**
     * Devuelve el origen de datos actualizado con las propiedades que hayan cambiado por tratarse de componentes de ingreso de datos (campos, etc.)
     * @returns {Object[]}
     */
    this.obtenerDatosActualizados=function() {
        return this.prototipo.obtenerDatosActualizados.call(this,this.itemsAutogenerados);
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
        var idx=this.datos.push(obj)-1;

        this.removerMensajeSinDatos();

        //Agregar el nuevo elemento sin redibujar todo
        this.generarItems(idx);
        
        //Autofoco
        ui.autofoco(this.itemsAutogenerados[idx].obtenerElemento());

        return this;
    };

    /**
     * Agrega los elementos del listado provisto.
     * @param {*[]} listado - Listado (*array*) de elementos a insertar.
     * @returns {componente}
     */
    this.agregarElementos=function(listado) {
        var t=this;

        listado.porCada(function(i,elem) {
            t.agregarElemento(elem);
        });

        return this;
    };

    /**
     * Remueve un elemento dado su índice.
     * @param {number} indice - Número de fila (basado en 0).
     * @returns {componente}
     */
    this.removerElemento=function(indice) {
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