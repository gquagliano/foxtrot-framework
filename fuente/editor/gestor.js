/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @typedef Gestor
 */

/**
 * @class Gestor de aplicaciones.
 */
var gestor=new function() {
    "use strict";

    /**
     * Procesa el evento 'change' del desplegable de aplicaciones.
     * @param {HTMLSelectElement} elem 
     */
    this.aplicacionSeleccionada=function(elem) {
        window.location.href="operaciones/seleccionarAplicacion.php?aplicacion="+elem.valor();
    };

    /**
     * Abre el editor de vistas.
     * @param {string} nombreVista 
     */
    this.abrirEditor=function(nombreVista) {
        window.open("editor.php?apl="+nombreAplicacion+"&vista="+nombreVista);
    };

    /**
     * Abre el diálogo de nueva vista.
     */
    this.nuevaVista=function() {
        //TODO Animación
        document.querySelector("#dialogo-nueva-vista").estilo("display","block");
        document.querySelector("#nueva-vista-nombre").focus();
    };

    /**
     * Acepta el diálogo de nueva vista.
     */
    this.aceptarNuevaVista=function() {
        var dialogo=document.querySelector("#dialogo-nueva-vista");

        var nombre=dialogo.querySelector("#nueva-vista-nombre").valor(),
            modo=dialogo.querySelector("#nueva-vista-modo").valor(),
            cliente=dialogo.querySelector("#nueva-vista-cliente").valor();
        window.open("editor.php?apl="+nombreAplicacion+"&vista="+nombre+"&modo="+modo+"&cliente="+cliente);

        this.cerrarDialogo(dialogo);
    };

    /**
     * Cierra un diálogo.
     * @param {Element} elem - Elemento del diálogo o cualquier elemento descendiente.
     */
    this.cerrarDialogo=function(elem) {
        //TODO Animación
        var filtro={ clase:"dialogo" };
        if(!elem.es(filtro)) elem=elem.padre(filtro);
        elem.estilo("display","none");
    };

    //document.body.agregarClase("trabajando");
}();

window["gestor"]=gestor;
