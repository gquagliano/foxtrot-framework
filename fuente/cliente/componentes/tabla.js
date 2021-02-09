/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Tabla de datos.
 * @class
 * @extends componente
 */
var componenteTabla=function() {   
    "use strict";

    this.componente="tabla";

    this.redibujar=true;

    var t=this;

    /**
     * Propiedades de Tabla.
     */
    this.propiedadesConcretas={
        "Tabla":{
            ocultarContenidos:{
                etiqueta:"Ocultar contenido",
                tipo:"bool",
                ayuda:"Si la tabla va a ser utilizada con un origen de datos, activar esta opción evitará que se muestren sus filas hasta que el contenido haya sido asignado.",
                adaptativa:false
            },
            vacia:{
                etiqueta:"Mensaje de tabla vacía",
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

        this.contenedor=this.elemento.querySelector("tbody");

        this.clasePadre.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div><div class='table-responsive'><table class='table table-striped table-hover' cellspacing='0'><tbody/></table></div></div>"); 
        this.clasePadre.crear.call(this);
        return this;
    };    
    
    /**
     * Actualiza el componente tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;

        if(propiedad=="ocultarContenidos") {
            if(valor===true||valor===1||valor==="1") {
                this.elemento.agregarClase("ocultar-contenidos");
            } else {
                this.elemento.removerClase("ocultar-contenidos");
            }
            return this;
        }

        this.clasePadre.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };
    
    /**
     * Establece el origen de datos.
     * @param {Object} obj - Objeto a asignar.
     * @param {boolean} [actualizar=true] - Actualizar el componente luego de establecer el origen de datos.
     * @returns Componente
     */
    this.establecerDatos=function(obj,actualizar) {
        //No recursivo, ya que los componentes que contiene se usan solo como plantilla
        this.redibujar=true;
        this.clasePadre.establecerDatos.call(this,obj,actualizar,false);
        return this;
    };

    /**
     * Actualiza el componente.
     * @returns {Componente}
     */
    this.actualizar=function() {
        this.clasePadre.actualizar.call(this,false);

        if(ui.enModoEdicion()) return;

        //Aplicar valores de los campos
        if(!this.redibujar) this.obtenerDatosActualizados();
        this.redibujar=false;

        //Almacenar dónde está el foco
        var enfocables=this.elemento.buscarEnfocables(),    
            foco=this.elemento.activeElement||(event&&event.activeElement)||(event&&event.target),
            indiceFoco=enfocables.indexOf(foco);
            
        //Limpiar filas autogeneradas
        ui.eliminarComponentes(this.elemento.querySelectorAll(".autogenerado"));

        if(!this.datos) return this;

        //Vamos a ocultar toda la descendencia para que las instancias originales de los campos que se van a duplicar no se vean afectadas al obtener/establecer los valores de la vista
        this.ocultarDescendencia();

        t.generarEncabezados();

        if(!this.datos.length) {
            this.mostrarMensajeSinDatos();
        } else {
            t.generarFilas();

            //Intentar reestablecer el foco
            if(indiceFoco>=0) {
                enfocables=this.elemento.buscarEnfocables();
                if(indiceFoco<enfocables.length) enfocables[indiceFoco].focus();
            }
        }

        return this;
    };

    /**
     * Genera la fila con el mensaje de tabla sin datos.
     * @returns {Componente}
     */
    this.mostrarMensajeSinDatos=function() {
        var texto=this.propiedad(null,"vacia");
        if(!texto) return this;

        var cantidadColumnas=this.elemento.querySelectorAll("thead th").length,
            tr=document.crear("tr")
                .agregarClase("autogenerado fila-sin-datos")
                .establecerHtml("<td colspan='"+cantidadColumnas+"'>"+texto+"</td>");

        this.contenedor.anexar(tr);

        return this;
    };

    /**
     * Devuelve los componentes fila que no sean autogenerados.
     * @returns {Componente[]}
     */
    this.buscarFilas=function() {
        var hijos=this.obtenerHijos(),
            filas=[];

        for(var i=0;i<hijos.length;i++) {
            if(!hijos[i].autogenerado) filas.push(hijos[i]);
        }
        
        return filas;
    };

    /**
     * Genera el encabezado de la tabla
     * @returns {Componente}
     */
    this.generarEncabezados=function() {
        var filas=this.buscarFilas(),
            fila=null;
        
        //Solo se considera la primer fila que no sea autogenerada en los encabezados
        if(filas.length) fila=filas[0];
        if(!fila) return this;

        var columnas=fila.obtenerHijos(); 
        if(!columnas.length) return this;
        
        var thead=document.crear("thead"),
            tr=document.crear("tr");
        thead.agregarClase("autogenerado")
            .anexar(tr);
        
        columnas.forEach(function(columna) {
            tr.anexar(columna.generarTh());
        });

        //this.contenedor es el tbody
        this.elemento.querySelector("table").anexar(thead);

        return this;
    };

    /**
     * Genera las filas de la tabla
     * @returns {Componente}
     */
    this.generarFilas=function() {
        var filas=this.buscarFilas();

        this.datos.forEach(function(obj,indice) {
            //Puede existir más de una fila como plantilla
            filas.forEach(function(fila) {
                fila.generarFila(t,obj,indice);
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
     * Devuelve el origen de datos actualizado con las propiedades que hayan cambiado por tratarse de componentes de ingreso de datos (campos, etc.)
     * @returns {Object[]}
     */
    this.obtenerDatosActualizados=function() {
        var listado=this.obtenerHijos().filter(function(hijo) {
            return hijo.autogenerado;
        });
        return this.clasePadre.obtenerDatosActualizados.call(this,listado);
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
     * Agrega una nueva fila.
     * @param {*} obj - Elemento a insertar.
     * @returns {componente}
     */
    this.agregarFila=function(obj) {
        if(!util.esArray(this.datos)) this.datos=[];

        //Preservar estado actual
        this.datos=this.obtenerDatosActualizados();
        
        this.datos.push(obj);
        this.actualizar();
        return this;
    };

    /**
     * Remueve una fila dado su índice.
     * @param {number} indice - Número de fila (basado en 0).
     * @returns {componente}
     */
    this.removerFila=function(indice) {
        //Preservar estado actual
        this.datos=this.obtenerDatosActualizados();

        this.datos.splice(indice,1);
        this.actualizar();
        return this;
    };
};

ui.registrarComponente("tabla",componenteTabla,configComponente.clonar({
    descripcion:"Tabla",
    etiqueta:"Tabla",
    grupo:"Tablas de datos",
    icono:"tabla.png",
    aceptaHijos:["tabla-fila"]
}));