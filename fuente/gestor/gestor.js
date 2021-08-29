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

    var t=this,
        urlOperaciones="operaciones/gestor.php",
        dialogo=null;

    /**
     * Devuelve la configuración del gestor.
     * @returns {Object}
     */
    function obtenerConfig() {
        var obj=window.localStorage.getItem("configGestor");
        if(!obj) return {
            vistasDesplegadas:[]
        };
        return JSON.parse(obj);
    }

    /**
     * Establece la configuración del gestor.
     * @param {Object} obj - Configuración a establecer (objeto completo).
     */
    function establecerConfig(obj) {
        window.localStorage.setItem("configGestor",JSON.stringify(obj));
    }

    /**
     * Ejecuta una operación.
     * @param {*} parametros - Parámetros.
     * @param {function} retorno - Función de retorno.
     * @param {function} [error] - Función de retorno en caso de error.
     * @returns {Gestor}
     */
    this.operacion=function(parametros,retorno,error) {
        this.trabajando();
        new ajax({
            url:urlOperaciones,
            parametros:parametros,
            tiempo:0,
            listo:function(respuesta) {
                try {
                    respuesta=JSON.parse(respuesta);
                } catch { }

                if(respuesta&&respuesta.r=="ok") {
                    retorno(respuesta.d);
                } else {
                    if(typeof error==="function") {
                        error(respuesta.d);
                    } else {
                        ui.alerta("No fue posible completar la operación.");
                    }
                }
            },
            error:function() {
                ui.alerta("No fue posible completar la operación.");
            },
            siempre:function() {
                gestor.trabajando(false);
            }
        });
        return this;
    };

    /**
     * Procesa el cambio del desplegable de aplicaciones.
     * @param {HTMLSelectElement} elem 
     */
    this.aplicacionSeleccionada=function(elem) {
        this.operacion({
            seleccionarAplicacion:elem.valor()
        },function() {
            gestor.actualizar();
        });
    };

    /**
     * Despliega un subdirectorio de vistas (procesa el evento `onclick` de la etiqueta del subdirectorio).
     * @param {Element} etiqueta 
     */
    this.desplegarVistas=function(etiqueta) {
        var elem=etiqueta.padre();
        elem.alternarClase("expandido");

        var abierto=elem.es({clase:"expandido"});

        //Almacenar en la configuración
        var obj=obtenerConfig(),
            arr=obj.vistasDesplegadas,
            ruta=etiqueta.dato("ruta"),
            i=arr.indexOf(ruta);
        if(!abierto) {
            //Cerrado, remover
            if(i>=0) arr.splice(i,1);
        } else {
            //Abierto, agregar
            if(i<0) arr.push(ruta);
        }
        establecerConfig(obj);
    };

    /**
     * Abre el editor de vistas.
     * @param {string} nombreVista 
     */
    this.abrirEditor=function(nombreVista) {
        window.open("editor.php?apl="+nombreAplicacion+"&vista="+nombreVista);
    };

    /**
     * Abre la vista en una nueva pestaña.
     * @param {string} url 
     */
    this.ejecutarVista=function(url) {
        window.open(url);
    };

    /**
     * Duplica una vista.
     * @param {string} nombreVista 
     */
    this.duplicarVista=function(nombreVista) {
        this.operacion({
            duplicarVista:nombreVista
        },function() {
            gestor.actualizar();
        })
    };

    /**
     * Inicia la operación de renombrar vista.
     * @param {string} nombreVista 
     */
    this.renombrarVista=function(nombreVista) {
        this.abrirDialogo("dialogo-renombrar");
        document.querySelector("#dialogo-renombrar .nombre-vista").establecerHtml(nombreVista);
        document.querySelector("#dialogo-renombrar [name='nombre']").valor(nombreVista);
        document.querySelector("#dialogo-renombrar [name='nuevo_nombre']").valor(nombreVista).select();
    };

    /**
     * Acepta el diálogo de renombrar vista.
     * @param {string} nombreVista 
     */
    this.aceptarRenombrarVista=function() {
        var valores=this.obtenerValoresFormulario("dialogo-renombrar");
        this.operacion({
            renombrarVista:valores.nombre,
            nuevoNombre:valores.nuevo_nombre
        },function() {
            gestor.actualizar();
        })
    };

    /**
     * Muestra un diálogo.
     * @param {string} id - ID del elemento del diálogo.
     * @returns {Gestor}
     */
    this.abrirDialogo=function(id) {
        dialogo=ui.construirDialogo({
            cuerpo:document.querySelector("#"+id)
        });
        ui.abrirDialogo(dialogo);

        var campo=dialogo.obtenerElemento().querySelector("input,select,textarea");
        if(campo) campo.focus();

        return this;
    };

    /**
     * Cierra el diálogo abirto.
     * @returns {Gestor}
     */
    this.cerrarDialogo=function() {
        ui.cerrarDialogo(dialogo);
        return this;
    };

    /**
     * Devuelve un objeto con los valores de los campos de un formulario.
     * @param {(HTMLElement|string)} elem - Elemento que contiene los campos.
     */
    this.obtenerValoresFormulario=function(elem) {
        if(typeof elem==="string") elem=document.querySelector("#"+elem);
        var valores={};

        elem.querySelectorAll("input,textarea,select").forEach(function(campo) {
            valores[campo.atributo("name")]=campo.valor();
        });

        return valores;
    };

    /**
     * Envía el formulario de un asistente.
     * @param {string} nombre - Nombre del asistente.
     * @param {(HTMLElement|string)} elem - Elemento que contiene los campos (no necesariamente <form>).
     * @param {function} [retorno] - Función de retorno (por defecto, recargará la página).
     * @param {function} [retornoError] - Función de retorno en caso de error (por defecto, mostrará un alerta con el texto recibido).
     */
    this.procesarAsistente=function(nombre,elem,retorno,retornoError) {
        this.operacion({
            asistente:nombre,
            parametros:JSON.stringify(this.obtenerValoresFormulario(elem))
        },function(resultado) {
            if(typeof retorno==="function") {
                retorno(resultado);
            } else {
                gestor.actualizar();
            }
        },function(error) {
            if(typeof retornoError==="function") {
                retornoError(error);
            } else {
                ui.alerta(error);
            }
        });
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
        var dialogo=document.querySelector("#dialogo-nueva-vista"),
            parametros=this.obtenerValoresFormulario(dialogo);

        if(!parametros.nombre) {
            ui.alerta("Ingresá el nombre de la vista.");
            return;
        }

        window.open("editor.php?apl="+nombreAplicacion+"&vista="+parametros.nombre+"&modo="+parametros.modo+"&cliente="+parametros.cliente);

        this.cerrarDialogo(dialogo);
    };

    /**
     * Abre el diálogo de nueva aplicación.
     */
    this.nuevaAplicacion=function() {
        this.abrirDialogo("dialogo-nueva-aplicacion");
    };

    /**
     * Acepta el diálogo de nueva aplicación.
     */
    this.aceptarNuevaAplicacion=function() {
        this.procesarAsistente("crear-aplicacion","dialogo-nueva-aplicacion");
    };

    /**
     * Abre el diálogo de nuevo controlador.
     */
    this.nuevoControlador=function() {
        this.abrirDialogo("dialogo-nuevo-controlador");
    };

    /**
     * Acepta el diálogo de nuevo controlador.
     */
    this.aceptarNuevoControlador=function() {
        this.procesarAsistente("crear-controlador","dialogo-nuevo-controlador");
    };

    /**
     * Abre el diálogo de nuevo modelo.
     */
    this.nuevoModelo=function() {
        this.abrirDialogo("dialogo-nuevo-modelo");
    };

    /**
     * Acepta el diálogo de nuevo modelo.
     */
    this.aceptarNuevoModelo=function() {
        this.procesarAsistente("crear-modelo","dialogo-nuevo-modelo");
    };

    /**
     * Abre el diálogo de sincronización.
     */
    this.sincronizar=function() {
        this.abrirDialogo("dialogo-sincronizacion");
    };

    /**
     * Acepta el diálogo de sincronización.
     */
    this.aceptarSincronizacion=function() {
        this.procesarAsistente("sincronizar-bd","dialogo-sincronizacion",function(sql) {
            document.querySelector("#sincronizacion-sql").valor(sql);
        },function(mensaje) {
            ui.alerta(mensaje.error);
            document.querySelector("#sincronizacion-sql").valor(mensaje.sql);
        });
    };

    /**
     * Abre el diálogo de asistentes.
     */
    this.asistentes=function() {       
        document.querySelector("#asistentes-seleccion select").valor(""); 
        document.querySelector("#asistentes-seleccion").removerClase("d-none");
        document.querySelectorAll(".formulario-asistente").agregarClase("d-none");

        this.abrirDialogo("dialogo-asistentes");
    }; 

    /**
     * Procesa el cambio del desplegable de selección de asistente.
     * @param {HTMLSelectElement} elem 
     */
    this.seleccionarAsistente=function(elem) {
        document.querySelector("#asistentes-seleccion").agregarClase("d-none");
        var formulario=document.querySelector("#asistente-"+elem.valor());
        formulario.removerClase("d-none");
        
        var campo=formulario.querySelector("input,select,textarea");
        if(campo) campo.focus();
    };

    /**
     * Abre el diálogo de construir embebible.
     */
    this.construirEmbebible=function() {
        this.abrirDialogo("dialogo-construir-embebible");
        this.plataformaSeleccionada(document.querySelector("#dialogo-construir-embebible [name='plataforma']"));
    };

    /**
     * Acepta el diálogo de construir embebible.
     */
    this.aceptarConstruirEmbebible=function() {
        this.procesarAsistente("construir-cordova","dialogo-construir-embebible");
    };

    /**
     * Procesa la selección del desplegable "Plataforma" del diálogo de construir embebible.
     * @param {Node} elem - Elemento desplegable.
     */
    this.plataformaSeleccionada=function(elem) {
        var valor=elem.valor();
        if(valor=="electron") {
            var radioNormal=document.querySelector("#dialogo-construir-embebible #accion-normal"),
                radioEjecutar=document.querySelector("#dialogo-construir-embebible #accion-ejecutar"),
                radioConstruir=document.querySelector("#dialogo-construir-embebible #accion-construir");

            document.querySelector("#dialogo-construir-embebible [name='destino']").propiedad("disabled",true);
            document.querySelector("#dialogo-construir-embebible #ce-ejecutar").propiedad("disabled",true).propiedad("checked",false);
            if(radioNormal.checked||radioEjecutar.checked) radioConstruir.propiedad("checked",true);
            radioEjecutar.propiedad("disabled",true).propiedad("checked",false);
            radioNormal.propiedad("disabled",true).propiedad("checked",false);            
        } else {
            document.querySelector("#dialogo-construir-embebible [name='destino']").propiedad("disabled",false);
            document.querySelector("#dialogo-construir-embebible #ce-ejecutar").propiedad("disabled",false);
            document.querySelector("#dialogo-construir-embebible #accion-normal").propiedad("disabled",false);
            document.querySelector("#dialogo-construir-embebible #accion-ejecutar").propiedad("disabled",false);
        }
    };

    /**
     * Abre el diálogo de construir producción.
     */
    this.construirProduccion=function() {
        this.abrirDialogo("dialogo-construir-produccion");
    };

    /**
     * Acepta el diálogo de sincronización.
     */
    this.aceptarConstruirProduccion=function() {
        this.procesarAsistente("construir-produccion","dialogo-construir-produccion");
    };

    /**
     * Procesa el click en Eliminar vista.
     * @param {string} nombre - Nombre de la vista.
     */
    this.eliminarVista=function(nombre) {
        ui.confirmar("¿Estás seguro de querer eliminar la vista?",function(r) {
            if(!r) return;
            gestor.operacion({
                eliminarVista:nombre
            }, function() {
                gestor.actualizar();
            });
        });
    };   

    /**
     * Recarga el gestor.
     */
    this.actualizar=function() {
        window.location.reload();
    };

    /**
     * Activa o desactiva la precarga.
     * @param {boolean} [v=true] - Activar o desactivar.
     * @returns {Gestor}
     */
    this.trabajando=function(v) {
        if(typeof v==="undefined"||v) {
            document.body.agregarClase("foxtrot-trabajando");
        } else {
            document.body.removerClase("foxtrot-trabajando");
        }
        return this;
    };

    /**
     * Constructor.
     */
    (function() {
        //Volver a desplegar subdirectorios
        obtenerConfig().vistasDesplegadas.forEach(function(ruta) {    
            document.querySelectorAll(".directorio-etiqueta[data-ruta='"+ruta+"']").forEach(function(elem) {
                t.desplegarVistas(elem);
            });
        });
    })();
}();

window["gestor"]=gestor;
