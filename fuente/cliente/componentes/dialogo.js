/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Componente concreto Diálogo (pop-up).
 */
var componenteDialogo=function() {    
    this.componente="dialogo";

    var dialogo=null;

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.contenedor=this.elemento;

        this.inicializarComponente();
        return this;
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
        if(typeof retorno==="undefined") retorno =null;
        
        if(!dialogo) dialogo=ui.construirDialogo({
            cuerpo:this.elemento,
            mostrarCerrar:true,
            retorno:function() {
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