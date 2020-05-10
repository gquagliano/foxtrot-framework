/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Objeto base (prototipo) de los componentes.
 */
function componente() {
    this.base=this;
    this.id=null;
    this.selector=null;
    this.componente=null;
    this.nombre=null;
    this.elemento=null;
    this.contenedor=null;
    this.datosElemento=util.clonar(elementoComponente); //TODO ¿Remover?
    this.hijos=[];
    this.padre=null;
    this.propiedades={};

    this.propiedadesComunes={
        "Estilo":{
            //nombre:{
            //    etiqueta
            //    tipo (predeterminado texto|multilinea|opciones|color)
            //    opciones (array {valor,etiqueta} cuando tipo=opciones)
            //    grupo
            //}
            color:{
                etiqueta:"Color",
                tipo:"color"
            }
        }
    };

    this.propiedadesConcretas={};

    var propiedadesCombinadas=null;

    /**
     * Inicializa la instancia.
     */
    this.inicializar=function() {

    };

    /**
     * Establece el ID de la instancia. Si se omite id, intentará configurar el DOM de la instancia con un id previamente asignado.
     */
    this.establecerId=function(id) {
        if(!util.esIndefinido(id)) this.id=id;
        if(this.elemento) this.elemento.dato(ui._nombreDatoId,this.id);
        return this;
    };

    /**
     * Establece el nombre de la instancia.
     */
    this.establecerNombre=function(nombre) {
        //Eliminar de componentes si cambia el nombre
        if(this.nombre!=nombre) delete window["componentes"][this.nombre];
        this.nombre=nombre;
        //Registrar en window.componentes para acceso rápido (debe accederse de esta forma para que quede exportado al compilar con Closure)
        if(nombre) window["componentes"][nombre]=this;
        return this;
    };

    /**
     * Establece o devuelve el valor de una propiedad.
     */
    this.propiedad=function(nombre,valor) {
        if(util.esIndefinido(valor)) return this.propiedades.hasOwnProperty(nombre)?this.propiedades[nombre]:null;
        this.propiedades[nombre]=valor;
        this.actualizar(nombre);
        return this;
    };

    /**
     * Devuelve el listado de propiedades ordenadas por grupo.
     */
    this.obtenerPropiedades=function() {
        var t=this;

        if(!propiedadesCombinadas) {
            propiedadesCombinadas={};

            ["propiedadesComunes","propiedadesConcretas"].forEach(function(v) {
                t[v].forEach(function(grupo,propiedades) {
                    propiedades.forEach(function(nombre,propiedad) {
                        if(!propiedadesCombinadas.hasOwnProperty(grupo)) propiedadesCombinadas[grupo]={};
                                            
                        propiedad.funcion=function(componentes,prop,valor) {
                            //TODO Selección múltiple
                            componentes.propiedad.call(componentes,prop,valor);
                        };
                        
                        propiedadesCombinadas[grupo][nombre]=propiedad;
                    });
                });
            });
        }

        propiedadesCombinadas.forEach(function(grupo,propiedades) {
            propiedades.forEach(function(nombre,propiedad) {
                propiedad.valor=t.propiedad(nombre);
            });
        });

        return propiedadesCombinadas;
    };
    
    /**
     * Actualiza el componente. propiedad puede estar definido tras la modificación de una propiedad.
     */
    this.actualizar=function(propiedad) {
        var estilos=ui.obtenerEstilos(this.selector);

        if(propiedad=="color") {
            ui.establecerEstilosSelector(this.selector,"color:"+this.propiedades.color);
        }

        return this;
    };

    /**
     * Devuelve el ID de la instancia.
     */
    this.obtenerId=function() {
        return this.id;
    };

    this.obtenerDatosElemento=function() {
        return this.datosElemento;
    };

    /**
     * Devuelve el elemento correspondiente a esta instancia, o uno nuevo si es una nueva instancia.
     */
    this.obtenerElemento=function() {
        if(!this.elemento) this.crear();
        return this.elemento;
    };

    /**
     * Devuelve el elemento correspondiente al contenedor de los hijos de esta instancia.
     */
    this.obtenerContenedor=function() {
        return this.contenedor;
    };

    /**
     * Devuelve un objeto con todos los parámetros de configuración.
     */
    this.obtenerParametros=function() {
        return {};
    };

    /**
     * Reestablece la configuración a partir de un objeto previamente generado con obtenerParametros().
     */
    this.establecerParametros=function(obj) {
        return this;
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        this.selector="#fox"+this.id;
        this.elemento.atributo("id","fox"+this.id);

        //Las clases css que se mantengan al salir del modo de edición deben ser breves
        this.elemento.agregarClase("componente");

        if(this.contenedor) {
            this.contenedor.agregarClase("contenedor"); //.contenedor hace referencia al elemento que contiene los hijos, a diferencia de
                                                        //.container que es la clase de Bootstrap.
            if(!this.hijos.length) this.contenedor.agregarClase("vacio");
        }        

        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        return this;
    };

    /**
     * Inicializa la instancia en base a su ID y sus parámetros.
     */
    this.restaurar=function() {
        this.elemento=document.querySelector("[data-"+ui._nombreDatoId+"='"+this.id+"']");



        this.inicializar();
        return this;
    };
    
    this.iniciarEdicion=function() {        
        this.elemento.editable(true).focus();
        //Deshabilitar arrastre en todo el árbol para que se pueda arrastrar el texto seleccionado dentro del editor
        this.elemento.pausarArrastreArbol();
        //Deshabilitar otros eventos del editor (para evitar interferencias con la redacción de texto, por ejemplo, SUPR)
        editor.pausarEventos();                
        return this;
    };
    
    this.finalizarEdicion=function() {
        this.elemento.editable(false);
        //Reestablecer eventos
        this.elemento.pausarArrastreArbol(false);
        editor.pausarEventos(false);                
        return this;
    };
}

window["componente"]=componente;
