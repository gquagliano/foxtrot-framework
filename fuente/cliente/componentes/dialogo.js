/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * @class Componente concreto Diálogo (pop-up).
 */
var componenteDialogo=function() { 
    var t=this;
    
    this.componente="dialogo";    

    this.propiedadesConcretas={
        "Diálogo":{
            modal:{
                etiqueta:"Modal",
                tipo:"logico",
                adaptativa:false
            },
            ocultarIconoCerrar:{
                etiqueta:"Ocultar ícono de cierre",
                tipo:"logico",
                adaptativa:false
            }
        }
    };

    var dialogo=null;

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.contenedor=this.elemento;

        this.inicializarComponente();

        //Remover la clase 'dialogo' (agregada por inicializarComponente) ya que es solo el cuerpo; ui.construirDialogo() va a
        //insertar el elemento dentro de un <div class='dialogo'>
        this.elemento.removerClase("dialogo");

        return this;
    };
   
    /**
     * Actualiza el componente tras modificarse el valor de una propiedad.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(propiedad=="modal"||propiedad=="ocultarIconoCerrar") {
            //Destruir para que se reconstruya con los nuevos valores al abrir
            if(dialogo) {
                ui.eliminarDialogo(dialogo);
                dialogo=null;
            }
        }
            
        return this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='contenido-componente-dialogo'>"); 
        this.crearComponente();
        return this;
    };

    /**
     * Abre el diálogo.
     * @param {function} [retorno] - Función de retorno al cerrar el diálogo.
     * @returns Componente
     */
    this.abrir=function(retorno) {
        if(typeof retorno!=="function") retorno=null;
        
        if(!dialogo) dialogo=ui.construirDialogo({
                cuerpo:this.elemento,
                mostrarCerrar:!this.propiedad("ocultarIconoCerrar"),
                modal:this.propiedad("modal"),
                retorno:function() {                         
                    //Buscar componente con autofoco
                    var elem=t.elemento.querySelector(".autofoco");
                    if(elem&&elem.es({visible:true})) {
                        var comp=ui.obtenerInstanciaComponente(elem);
                        if(comp) {
                            //Componente
                            comp.foco();
                        } else {
                            //Cualquier otro elemento del DOM puede usar la clase .autofoco
                            elem.focus();
                        }
                    }

                    if(retorno) retorno();
                }
            });

        ui.abrirDialogo(dialogo);
    };

    /**
     * Cierra el diálogo.
     * @returns Componente
     */
    this.cerrar=function() {
        ui.cerrarDialogo(dialogo);
        return this;
    };
};

ui.registrarComponente("dialogo",componenteDialogo,configComponente.clonar({
    descripcion:"Diálogo",
    etiqueta:"Diálogo",
    grupo:"Estructura",
    icono:"dialogo.png"
}));