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
     * Muestra un diálogo.
     * @param {string} id - ID del elemento del diálogo.
     */
    this.abrirDialogo=function(id) {
        //TODO Animación
        var elem=document.querySelector("#"+id);
        elem.estilo("display","block");
        elem.querySelector("input,select,textarea").focus();
    };

    /**
     * Cierra un diálogo.
     * @param {HTMLElement} elem - Elemento del diálogo o cualquier elemento descendente.
     */
    this.cerrarDialogo=function(elem) {
        //TODO Animación
        var filtro={ clase:"dialogo" };
        if(!elem.es(filtro)) elem=elem.padre(filtro);
        elem.estilo("display","none");
    };

    /**
     * Abre el diálogo de nueva vista.
     */
    this.nuevaVista=function() {
        this.abrirDialogo("dialogo-nueva-vista");
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
     * Abre el diálogo de nueva aplicación.
     */
    this.nuevaAplicacion=function() {
        this.abrirDialogo("dialogo-nueva-aplicacion");
    };

    /**
     * Abre el diálogo de nuevo controlador.
     */
    this.nuevoControlador=function() {
        this.abrirDialogo("dialogo-nuevo-controlador");
    };

    /**
     * Abre el diálogo de nuevo modelo.
     */
    this.nuevoModelo=function() {
        this.abrirDialogo("dialogo-nuevo-modelo");
    };

    /**
     * Abre el diálogo de sincronización.
     */
    this.sincronizar=function() {
        this.abrirDialogo("dialogo-sincronizacion");
    };

    /**
     * Abre el diálogo de asistentes.
     */
    this.asistentes=function() {
        this.abrirDialogo("dialogo-asistentes");
    };

    /**
     * Abre el diálogo de construir embebible.
     */
    this.construirEmbebible=function() {
        this.abrirDialogo("dialogo-construir-embebible");
    };

    /**
     * Abre el diálogo de construir producción.
     */
    this.construirProduccion=function() {
        this.abrirDialogo("dialogo-construir-produccion");
    };

    /**
     * Recarga el gestor.
     */
    this.actualizar=function() {
        window.location.reload();
    };

    //document.body.agregarClase("trabajando");
}();

window["gestor"]=gestor;
