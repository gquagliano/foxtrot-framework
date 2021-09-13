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
    this.iterativo=true;

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
                adaptativa:false,
                evaluable:true
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
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     * @returns {componenteArbol}
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this;

        this.contenedor=this.elemento.querySelector("tbody");
        this.contenedorItems=this.contenedor;   

        this.clasesCss.push("ocultar-contenidos");

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     * @returns {componenteArbol}
     */
    this.crear=function() {
        this.elemento=document.crear("<div><div class='table-responsive'><table class='table table-striped table-hover' cellspacing='0'><tbody/></table></div></div>"); 
        this.prototipo.crear.call(this);
        return this;
    };    
    
    /**
     * Actualiza el componente tras la modificación de una propiedad.
     * @returns {componenteArbol}
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(!ui.enModoEdicion()||!expresion.contieneExpresion(valor)) {
	        if(propiedad=="ocultarContenidos") {
	            if(valor===true||valor===1||valor==="1") {
	                this.elemento.agregarClase("ocultar-contenidos");
	            } else {
	                this.elemento.removerClase("ocultar-contenidos");
	            }
	            return this;
	        }
	    }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Actualiza el componente iterativo.
     * @returns {componenteTabla}
     */
    this.actualizarIterativo=function() {
        if(ui.enModoEdicion()) return;
        this.generarEncabezados(true);
        this.prototipo.actualizarIterativo.call(this);
        return this;
    };

    /**
     * Remueve la fila con el mensaje de tabla sin datos, si existe.
     * @returns {componenteTabla}
     */
    this.removerMensajeSinDatos=function() {
        var elem=this.contenedor.querySelector("tr.fila-sin-datos");
        if(elem) elem.remover();
        return this;
    };

    /**
     * Genera la fila con el mensaje de tabla sin datos.
     * @returns {componenteTabla}
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
     * @returns {componente[]}
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
     * @param {boolean} [regenerar=false] - Si es `true` y ya existe la fila de encabezados, será eliminada y regenerada.
     * @returns {componenteTabla}
     */
    this.generarEncabezados=function(regenerar) {
        if(typeof regenerar==="undefined") regenerar=false;

        var filas=this.buscarFilas(),
            fila=null;
        
        var previo=this.elemento.querySelector("thead");
        if(previo&&!regenerar) return this;
        if(previo) previo.remover();
        
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
     * Devuelve el componente correspondiente a una columna dado su nombre de columna (propiedad `columna`; no confundir con el
     * nombre del componente *Columna de tabla*).
     * @param {string} nombre - Nombre de columna a buscar.
     * @returns {(componente|null)}
     */
    this.obtenerColumna=function(nombre) {
        var filas=this.buscarFilas();
        if(!filas.length) return null;
        
        var columnas=filas[0].obtenerHijos();
        for(var i=0;i<columnas.length;i++) {
            var columna=columnas[i];
            if(columna.propiedad("columna")==nombre)
                return columna;
        }
        return null;
    };

    /**
     * Elimina el valor de la propiedad `orden` de todas las columnas.
     * @returns {componenteTabla}
     */
    this.limpiarOrdenamiento=function() {
        var filas=this.buscarFilas();
        if(!filas.length) return this;
        
        var columnas=filas[0].obtenerHijos();
        for(var i=0;i<columnas.length;i++)
            columnas[i].propiedad("orden",null);
        
        return this;
    };

    ////Alias

    /**
     * Genera o actualiza una fila de la tabla.
     * @param {number} indice - Indice del origen de datos (índice del elemento).
     * @returns {componenteTabla}
     */
    this.generarFila=function(obj,indice) {
        this.prototipo.generarItem(this,indice);
        return this;
    };

    /**
     * Genera las filas de la tabla.
     * @param {number} [indice] - Índice del objeto de datos que se desea generar. Si se omite, iterará sobre todo el origen de datos. 
     * @returns {componenteTabla}
     */
    this.generarFilas=function(indice) {
        this.generarEncabezados();
        this.prototipo.generarFilas.call(this,indice);
        return this;
    };

    /**
     * Agrega una nueva fila.
     * @param {*} obj - Elemento a insertar.
     * @returns {componenteTabla}
     */
    this.agregarFila=function(obj) {
        this.prototipo.agregarElemento.call(this,obj);
        return this;
    };
    
    /**
     * Agrega los elementos del listado provisto.
     * @param {*[]} listado - Listado (*array*) de elementos a insertar.
     * @returns {componenteTabla}
     */
    this.agregarFilas=function(listado) {
        this.prototipo.agregarElementos.call(this,listado);
        return this;
    };

    /**
     * Remueve una fila dado su índice.
     * @param {number} indice - Número de fila (basado en 0).
     * @returns {componenteTabla}
     */
    this.removerFila=function(indice) {
        this.prototipo.removerElemento.call(this,indice);
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