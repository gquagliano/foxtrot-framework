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
        "Configuración":{
            
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.inicializado) return this; 
        this.inicializarComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
     */
    this.crear=function() {
        this.elemento=document.crear(""); 
        this.crearComponente();
        return this;
    };
};

ui.registrarComponente("importar",componenteImportar,configComponente.clonar({
    descripcion:"Importar vista o archivo HTML",
    grupo:"Control",
    icono:"componentes/iconos/importar.png"
}));