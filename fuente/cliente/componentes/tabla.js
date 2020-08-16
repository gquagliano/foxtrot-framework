/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Tabla de datos.
 */
var componenteTabla=function() {    
    this.componente="tabla";

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
        if(this.inicializado) return this;

        this.contenedor=this.elemento.querySelector("table");

        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div><div class='table-responsive'><table class='table table-stripped table-hover'></table></div></div>"); 
        this.crearComponente();
        return this;
    };    
    
    /**
     * Actualiza el componente tras la modificación de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(propiedad=="ocultarContenidos") {
            if(valor) {
                this.elemento.agregarClase("ocultar-contenidos");
            } else {
                this.elemento.removerClase("ocultar-contenidos");
            }
            return this;
        }

        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };
    
    /**
     * Establece el origen de datos. El mismo será aplicado a toda la descendencia en forma recursiva.
     * @param {Object} obj - Objeto a asignar.
     * @param {boolean} [actualizar=true] - Actualizar el componente luego de establecer el origen de datos.
     * @returns Componente
     */
    this.establecerDatos=function(obj,actualizar) {        
        if(typeof actualizar==="undefined") actualizar=true;

        this.datos=obj;

        if(actualizar) this.actualizar();

        //No incovamos establecerDatosComponente ya que no queremos que el objeto se distribuya a la descendencia
        return this;        
    };

    /**
     * Actualiza el componente.
     * @returns {Componente}
     */
    this.actualizar=function() {
        //Limpiar filas autogeneradas
        this.elemento.querySelectorAll("autogenerado").remover();

        if(!this.datos) return this;

        this.generarEncabezados();

        if(!this.datos.length) {
            this.mostrarMensajeSinDatos();
        } else {
            this.generarFilas();
        }

        return this;
    };

    /**
     * Genera la fila con el mensaje de tabla sin datos.
     * @returns {Componente}
     */
    this.mostrarMensajeSinDatos=function() {
        var texto=this.propiedad(null,"vacia"),
            cantidadColumnas=this.contenedor.querySelectorAll("thead th").length,
            tr=document.crear("tr");

        tr.agregarClase("autogenerado fila-sin-datos")
            .establecerHtml("<td colspan='"+cantidadColumnas+"'>"+texto+"</td>");

        this.contenedor.querySelector("tbody").anexar(tr);

        return this;
    };

    /**
     * Genera el encabezado de la tabla
     * @returns {Componente}
     */
    this.generarEncabezados=function() {
        var thead=document.crear("thead"),
            columnasTd=this.contenedor.querySelector("tr.componente").querySelectorAll("td.componente");

        thead.agregarClase("autogenerado");
        
        columnasTd.forEach(function(columnaTd) {
            var componente=ui.obtenerInstanciaComponente(columnaTd);
            if(!componente) return;
            thead.anexar(componente.generarTh());
        });

        this.contenedor.anexar(thead);

        return this;
    };

    /**
     * Genera las filas de la tabla
     * @returns {Componente}
     */
    this.generarFilas=function() {
        var filas=this.contenedor.querySelectorAll("tr.componente"),
            tbody=this.contenedor.querySelector("tbody");

        this.datos.forEach(function(obj,indice) {
            //Puede existir más de una fila como plantilla
            filas.forEach(function(fila) {
                var componente=ui.obtenerInstanciaComponente(fila),
                    elem=componente.generarTr(obj,indice);
                
                elem.agregarClase("autogenerado");

                tbody.anexar(elem);
            });
        });

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