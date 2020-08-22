/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Importar.
 */
var componenteImportar=function() {    
    this.componente="importar";

    this.propiedadesConcretas={
        "Importar":{
            vista:{
                etiqueta:"Vista",
                adaptativa:false
            },
            escucharNavegacion:{
                etiqueta:"Escuchar navegación",
                ayuda:"Determina si debe cambiar la vista cuando cambie la URL.",
                tipo:"bool",
                adaptativa:false
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div>"); 
        this.crearComponente();
        return this;
    };

    /**
     * Recepción de eventos externos.
     * @param {*} valor 
     * @param {Object} evento 
     */
    this.eventoExterno=function(valor,evento) {
        ui.alerta(valor);
    };

    /**
     * Evento 'navegación'.
     * @param {string} nombreNuevaVista 
     */
    this.navegacion=function(nombreNuevaVista) {
        ui.alerta(nombreNuevaVista);
    };
};

ui.registrarComponente("importar",componenteImportar,configComponente.clonar({
    descripcion:"Importar vista o archivo HTML",
    etiqueta:"Importar",
    grupo:"Control",
    icono:"importar.png",
    aceptaHijos:false
}));