/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @typedef Dialogo
 */

/**
 * @typedef Desplegable
 */

/**
 * Métodos anexados a la gestión de la interfaz.
 */
(function() {
    
    //// Precarga

    var temporizadorPrecarga,
        temporizadorBarra,
        temporizadorBarraCompleta,
        precargas=0,
        precargasBarra=0,
        precargaVisible=false,
        barraVisible=false,
        elementoPrecarga=null,
        elementoBarra=null;

    /**
     * Muestra una animación de precarga.
     * @param {string} [tipo] - Tipo de precarga. "barra" mostrará una barra de progreso superior que no bloquee la vista; cualquier otro valor mostrará la precarga normal a pantalla completa.
     * @returns {ui}
     */
    ui.mostrarPrecarga=function(tipo) {
        if(typeof tipo!=="string"||tipo!="barra") tipo="normal";
        
        var doc=ui.obtenerDocumento();

        if(tipo=="normal") {
            precargas++;

            //Detener si se había solicitado ocultar la precarga hace menos de 200ms
            clearTimeout(temporizadorPrecarga);
        
            if(precargaVisible) return ui;

            if(!elementoPrecarga) {
                //Buscar elemento (es posible que ya exista)
                elementoPrecarga=doc.querySelector("#foxtrot-precarga");
            }
            if(!elementoPrecarga) {
                //Construir
                elementoPrecarga=doc.crear("<div id='foxtrot-precarga' class='oculto'>")   
                    .anexarA(doc.body);
            }

            ui.animarAparecer(elementoPrecarga);

            precargaVisible=true;
        } else if(tipo=="barra") {
            precargasBarra++;

            //Detener si se había solicitado ocultar la precarga hace menos de 200ms
            clearTimeout(temporizadorBarra);
        
            if(barraVisible) return ui;

            if(!elementoBarra) {
                //Buscar elemento (es posible que ya exista)
                elementoBarra=doc.querySelector("#foxtrot-barra-precarga");
            }
            if(!elementoBarra) {
                //Construir
                elementoBarra=doc.crear("<div id='foxtrot-barra-precarga' class='oculto'>")   
                    .anexarA(doc.body);
            }

            elementoBarra.agregarClase("visible")
                .removerClase("completa");
            ui.animarAparecer(elementoBarra);

            barraVisible=true;
        }

        return ui;
    };

    /**
     * Oculta la animación de precarga.
     * @param {string} [tipo] - Tipo de precarga. "barra" mostrará una barra de progreso superior que no bloquee la vista; cualquier otro valor mostrará la precarga normal a pantalla completa.
     * @returns {ui}
     */
    ui.ocultarPrecarga=function(tipo) {
        if(typeof tipo!=="string"||tipo!="barra") tipo="normal";

        if(tipo=="normal") {
            if(!elementoPrecarga||!precargaVisible) return ui;

            clearTimeout(temporizadorPrecarga);

            precargas--;

            //Ignorar hasta que se hayan cancelado todas las solicitudes de mostrarPrecarga().
            if(precargas>0) return;
            precargas=0;
            
            //Utilizamos un temporizador para que llamados sucesivos no provoquen que aparezca y desaparezca reiteradas veces
            temporizadorPrecarga=setTimeout(function() {
                ui.animarDesaparecer(elementoPrecarga);
                precargaVisible=false;
            },200);
        } else if(tipo=="barra") {
            if(!elementoBarra||!barraVisible) return ui;

            clearTimeout(temporizadorBarra);
            clearTimeout(temporizadorBarraCompleta);
            ui.detenerAnimacion(elementoBarra);

            precargasBarra--;

            //Ignorar hasta que se hayan cancelado todas las solicitudes de mostrarPrecarga().
            if(precargasBarra>0) return;
            precargasBarra=0;
            
            //Utilizamos un temporizador para que llamados sucesivos no provoquen que aparezca y desaparezca reiteradas veces
            temporizadorBarra=setTimeout(function() {
                //Llevar la barra al 100% antes de ocultar
                elementoBarra.agregarClase("completa");
                temporizadorBarraCompleta=setTimeout(function() {
                    ui.animarDesaparecer(elementoBarra,function() {
                        elementoBarra.removerClase("visible");
                    });
                    barraVisible=false;
                },500);
            },200);
        }

        return ui;
    };

    //// Diálogos

    var dialogoAbierto=null;

    var docKeyDn=function(ev) {
        if(ev.which==27) {
            //ESC

            //Ignorar si es modal
            if(dialogoAbierto.param.modal) return;

            ui.cerrarDialogo(dialogoAbierto);
            ev.preventDefault();
            ev.stopPropagation();
        }
    };

    var removerEventos=function() {
        document.removerEvento("keydown",docKeyDn);
    };

    /**
     * Construye un cuadro de diálogo.
     * @param {Object} parametros - Parámetros.
     * @param {(string|Node|Element)} [parametros[].cuerpo] - Elemento o HTML a incluir en el cuerpo.
     * @param {Object[]} [parametros[].opciones] - Botones de acción a generar.
     * @param {string} [parametros[].opciones[].etiqueta] - Etiqueta del botón.
     * @param {string} [parametros[].opciones[].clase] - Clase CSS del botón.
     * @param {boolean} [parametros[].opciones[].predeterminado] - Determina si es la acción predeterminada.
     * @param {function} [parametros[].retorno] - Función de retorno. Recibirá como parámetro el índice del botón, o NULL si fue cancelado.
     * @param {boolean} [parametros[].mostrarCerrar=false] - Determina si se debe mostrar la X para cancelar el diálogo.
     * @param {boolean} [parametros[].eliminar=false] - Determina si el diálogo se debe eliminar luego de cerrado.
     * @param {boolean} [parametros[].modal=false] - Si es true, deshabilitará las posibilidades de cancelar el diálogo.
     * @returns {Dialogo}
     */
    ui.construirDialogo=function(parametros) {
        //Anexar al documento principal (ui.obtenerDocumento() devolverá el marco cuando esté en modo de edición)
        var elem=document.crear("<div class='dialogo oculto'><div class='dialogo-cuerpo'><div class='dialogo-contenido'></div><div class='dialogo-opciones'></div></div></div>")
            .anexarA(document.body);

        parametros=Object.assign({
            cuerpo:null,
            opciones:null,
            retorno:null,
            mostrarCerrar:false,
            eliminar:false,
            padreAnterior:null,
            abierto:false,
            modal:false
        },parametros);

        if(!parametros.modal&&parametros.mostrarCerrar) {
            var cerrar=document.crear("<a href='#' class='dialogo-x'></a>");
            elem.querySelector(".dialogo-cuerpo").anexar(cerrar);
            cerrar.evento("click",function(ev) {
                ev.preventDefault();
                ui.cerrarDialogo(dialogoAbierto,null);
            });
        }

        var cuerpo=elem.querySelector(".dialogo-contenido");
        if(typeof parametros.cuerpo==="string") {
            cuerpo.establecerHtml(parametros.cuerpo);
        } else {
            //Almacenar la ubicación anterior del contenido para poder restaurarlo
            parametros.padreAnterior=parametros.cuerpo.parentNode;
            cuerpo.anexar(parametros.cuerpo);
        }

        if(parametros.opciones) {
            var contenedor=elem.querySelector(".dialogo-opciones");

            parametros.opciones.forEach(function(boton,i) {
                var btn=document.crear("<a href='#' class='btn'>")
                    .establecerHtml(boton.etiqueta)
                    .dato("indice",i)
                    .evento("click",function(ev) {
                        ev.preventDefault();
                        ui.cerrarDialogo(dialogoAbierto,parseInt(this.dato("indice")));
                    })
                    .evento("keydown",function(ev) {
                        if(ev.which==13) {
                            //Enter
                            ev.preventDefault();
                            ev.stopPropagation();
                            ui.cerrarDialogo(dialogoAbierto,parseInt(this.dato("indice")));
                        }
                    })
                    .anexarA(contenedor);

                if(typeof boton.predeterminado!=="undefined"&&boton.predeterminado) btn.agregarClase("predeterminado");

                if(typeof boton.clase==="string") btn.agregarClase(boton.clase);
            });
        }

        return {
            elem:elem,
            param:parametros,
            obtenerElemento:function() {
                return this.elem;
            },
            obtenerCuerpo:function() {
                return this.elem.querySelector(".dialogo-cuerpo");
            }
        };
    };

    /**
     * Abre un diálogo construido con construirDialogo().
     * @param {Dialogo} dialogo 
     */
    ui.abrirDialogo=function(dialogo) {
        if(dialogoAbierto) this.cerrarDialogo(dialogoAbierto,null,true);
        dialogoAbierto=dialogo;

        ui.animarAparecer(dialogo.elem);

        dialogo.abierto=true;

        var btn=dialogo.elem.querySelector(".predeterminado");
        if(btn) btn.focus();

        //Eventos
        document.evento("keydown",docKeyDn);
        dialogo.elem
            .removerEventos()
            .evento("click",function(ev) {
                //Click en la sombra (ignorar si es modal)
                var c=dialogo.obtenerCuerpo();
                if(dialogo.param.modal||ev.target.es({elemento:c})||ev.target.padre({elemento:c})) return;
                ui.cerrarDialogo(dialogo);
                ev.preventDefault();
            });

        return ui;
    };

    /**
     * Devuelve el diálogo actualmente abierto.
     * @returns {Dialogo}
     */
    ui.obtenerDialogoAbierto=function() {
        return dialogoAbierto;
    };

    /**
     * Cierra un diálogo construido con construirDialogo().
     * @param {Dialogo} [dialogo] - Diálogo.
     * @param {number} [opcion=null] - Número de opción que cierra el diálogo, o NULL.
     * @param {boolean} [omitirAnimacion=false] - Si es true, ierra el diálogo inmediatamente.
     * @param {boolean} [eliminar] - Eliminar el diálogo luego de cerrar. Si se omite, se tomará de la configuración del diálogo.
     * @returns {ui}
     */
    ui.cerrarDialogo=function(dialogo,opcion,omitirAnimacion,eliminar) {
        if(typeof dialogo==="undefined") dialogo=dialogoAbierto;
        if(typeof opcion==="undefined") opcion=null;
        if(typeof omitirAnimacion==="undefined") omitirAnimacion=false;
        if(typeof eliminar==="undefined") eliminar=dialogo.param.eliminar;

        if(!dialogo) return ui;

        removerEventos();

        if(dialogo.abierto&&dialogo.param.retorno) dialogo.param.retorno(opcion);

        var fn=function(dialogo,eliminar) {
            return function() {
                if(eliminar) ui.eliminarDialogo(dialogo);
            };
        }(dialogo,eliminar);

        if(omitirAnimacion) {
            fn();
        } else {
            ui.animarDesaparecer(dialogo.elem,fn);
        }

        dialogo.abierto=false;
        dialogoAbierto=null;

        return ui;
    };

    /**
     * Elimina o destruye un diálogo construido con construirDialogo().
     * @param {Dialogo} dialogo 
     */
    ui.eliminarDialogo=function(dialogo) {
        //Restaurar contenido a su ubicación original
        if(dialogo.padreAnterior) dialogo.padreAnterior.anexar(dialogo.elem.querySelectorAll(".dialogo-contenido>*"));

        dialogo.elem.remover();
        dialogo.abierto=false;

        return ui;
    };

    //// Desplegables

    var desplegableAbierto=null;

    var eventosVentanaDesplegable=function() {
        if(!desplegableAbierto) return;
        if(desplegableAbierto.opciones.retornoCierre) desplegableAbierto.opciones.retornoCierre();
        ui.cerrarDesplegable(desplegableAbierto,false);
    },
    removerEventosDesplegable=function() {
        window.removerEvento("resize scroll mousewheel blur",eventosVentanaDesplegable);
    },
    establecerEventosDesplegable=function() {
        window.evento("resize scroll mousewheel blur",eventosVentanaDesplegable);
    };

    /**
     * Crea un desplegable debajo de un componente.
     * @param {Componente} componente - Componente relativo al cual se posicionará el desplegable.
     * @param {Object} [opciones] - Configuración del desplegable.
     * @param {string} [opciones.desplegar="abajo"] - Dirección hacia la cual se desplegará, relativo al componente (actualmente "abajo" es el único valor disponible).
     * @param {boolean} [opciones.reposicionar=true] - Reposicionar el desplegable si no hay espacio suficiente hasta el borde de la ventana. Si es false, será redimensionado.
     * @param {boolean} [opciones.adaptativo=true] - Si es true, tendrá una presentación diferente en pantallas pequeñas para mejor usabilidad.
     * @param {string} [opciones.clase] - Clase CSS.
     * @param {function} [opciones.retornoCierre] - Función de retorno al cerrarse el desplegable en forma automática.
     * @param {boolean} [opciones.destruir=true] - Si es true, será destruido tras cerrarse.
     * @returns {Desplegable}
     *//**
     * Crea un desplegable debajo de un componente.
     * @param {Componente} componente - Componente relativo al cual se posicionará el desplegable.
     * @param {(Element|Node)} elemento - Elemento a desplegar. Puede omitirse para crear un desplegable vacío.
     * @param {Object} [opciones] - Configuración del desplegable.
     * @param {string} [opciones.desplegar="abajo"] - Dirección hacia la cual se desplegará, relativo al componente (actualmente "abajo" es el único valor disponible).
     * @param {boolean} [opciones.reposicionar=true] - Reposicionar el desplegable si no hay espacio suficiente hasta el borde de la ventana. Si es false, será redimensionado.
     * @param {boolean} [opciones.adaptativo=true] - Si es true, tendrá una presentación diferente en pantallas pequeñas para mejor usabilidad.
     * @param {string} [opciones.clase] - Clase CSS.
     * @param {function} [opciones.retornoCierre] - Función de retorno al cerrarse el desplegable en forma automática.
     * @param {boolean} [opciones.destruir=true] - Si es true, será destruido tras cerrarse.
     * @returns {Desplegable}
     */
    ui.crearDesplegable=function(componente,b,c) {
        var elemento=null,
            opciones={};

        //Argumentos
        if(typeof b!=="undefined") {
            if(util.esElemento(b)) {
                //componente,elemento
                elemento=b;
                //componente,elemento,opciones
                if(typeof c!=="undefined") opciones=c;
            } else {
                //componente,opciones
                opciones=b;
            }
        }

        opciones=Object.assign({
            desplegar:"abajo",
            reposicionar:true,
            adaptativo:true,
            clase:null,
            retornoCierre:null,
            destruir:true
        },opciones);

        var elem=ui.obtenerDocumento()
            .crear("<div class='desplegable"+(opciones.clase?" "+opciones.clase:"")+(opciones.adaptativo?" desplegable-adaptativo":"")+"'>")
            .anexarA(ui.obtenerCuerpo());
        if(elemento) elem.anexar(elemento);

        return {
            opciones:opciones,
            elem:elem,
            componente:componente,
            obtenerElemento:function() {
                return this.elem;
            }
        };
    };

    /**
     * Posiciona y muestra un desplegable.
     * @param {Desplegable} desplegable - Objeto generado con ui.crearDesplegable().
     * @returns {ui}
     */
    ui.abrirDesplegable=function(desplegable) {
        var elem=desplegable.elem,
            elemComponente=desplegable.componente.obtenerElemento();

        ui.detenerAnimacion(elem)
            .animarAparecer(elem);

        //Posicionamiento
        var posicionComponente=elemComponente.posicionAbsoluta(),
            altoComponente=elemComponente.alto(),
            anchoComponente=elemComponente.ancho();

        elem.estilos({
            left:posicionComponente.x,
            top:posicionComponente.y+altoComponente,
            width:anchoComponente
        });

        //TODO Desplegar hacia arriba / hacia los costados
        
        //Verificar si entra en pantalla
        var posicionDesplegable=elem.posicionAbsoluta(),
            altoDesplegable=elem.alto(),
            altoVentana=window.alto(),
            margen=15;

        if(posicionDesplegable.y+altoDesplegable+margen>altoVentana) {
            if(desplegable.opciones.reposicionar) {
                //Abrir hacia arriba
                elem.estilos({
                    top:posicionComponente.y-altoDesplegable
                });
            } else {
                //Redimensionar
                elem.estilos({
                    height:altoVentana-margen-posicionComponente.y-altoComponente
                });
            }
        }

        //Eventos
        establecerEventosDesplegable();

        desplegableAbierto=desplegable;

        return ui;
    };

    /**
     * Cierra un desplegable.
     * @param {Desplegable} desplegable - Objeto generado con ui.crearDesplegable().
     * @param {boolean} [animar=true] - Cerrar con animación.
     * @returns {ui}
     */
    ui.cerrarDesplegable=function(desplegable,animar) {
        var elem=desplegable.elem,
            fn=function() {
                if(desplegable.opciones.destruir) elem.remover();
            };

        if(typeof animar==="undefined"||animar) {
            ui.detenerAnimacion(elem)
                .animarDesaparecer(elem,fn);
        } else {
            fn();
        }

        removerEventosDesplegable();

        desplegableAbierto=null;

        return ui;
    };

    //// Implementaciones

    /**
     * Muestra un diálogo de alerta o información (equivalente a alert()).
     * @param {string} mensaje - Mensaje. Admite HTML.
     * @param {function} [funcion] - Función de retorno.
     * @param {string} [etiquetaBoton="Aceptar"] - Etiqueta del botón.
     */
    ui.alerta=function(mensaje,funcion,etiquetaBoton) {
        if(typeof funcion==="undefined") funcion=null;
        if(typeof etiquetaBoton==="undefined") etiquetaBoton="Aceptar";

        //TODO Integración con el plugin de Cordova de Foxtrot
        //TODO Integración con el cliente de escritorio

        ui.abrirDialogo(ui.construirDialogo({
            cuerpo:mensaje,
            retorno:function(resultado) {
                if(funcion) funcion();
            },
            opciones:[{
                etiqueta:etiquetaBoton,
                clase:"btn-primary",
                predeterminado:true
            }],
            eliminar:true
        }));

        return ui;
    };
    
    /**
     * Muestra un diálogo de confirmación.
     * @param {string} mensaje - Mensaje. Admite HTML.
     * @param {function} [funcion] - Función de retorno. Recibirá un parámetro con la respuesta (true, false o null si fue cancelado).
     * @param {boolean} [cancelar=false] - Mostrar opción "Cancelar".
     * @param {string} [etiquetaSi="Si"] - Etiqueta del botón afirmativo.
     * @param {string} [etiquetaNo="No"] - Etiqueta del botón negativo.
     * @param {string} [etiquetaCancelar="Cancelar"] - Etiqueta del botón de cancelar.
     */
    ui.confirmar=function(mensaje,funcion,cancelar,etiquetaSi,etiquetaNo,etiquetaCancelar) {
        if(typeof funcion==="undefined") funcion=null;
        if(typeof cancelar==="undefined") cancelar=false;
        if(typeof etiquetaSi==="undefined") etiquetaSi="Si";
        if(typeof etiquetaNo==="undefined") etiquetaNo="No";
        if(typeof etiquetaCancelar==="undefined") etiquetaCancelar="Cancelar";

        //TODO Integración con el plugin de Cordova de Foxtrot
        //TODO Integración con el cliente de escritorio

        var botones=[
            {
                etiqueta:etiquetaSi,
                clase:"btn-primary",
                predeterminado:true
            },
            {
                etiqueta:etiquetaNo,
                clase:"btn-secondary"
            }
        ];
        
        if(cancelar) botones.push({
                etiqueta:etiquetaCancelar,
                clase:"btn-secondary"
            });

        ui.abrirDialogo(ui.construirDialogo({
            cuerpo:mensaje,
            retorno:function(btn) {
                var resultado=null;
                if(btn===0) resultado=true;
                if(btn===1) resultado=false;
                //cancelado (ESC o botón 2) => null
                if(funcion) funcion(resultado);
            },
            opciones:botones,
            eliminar:true
        }));

        return ui;
    };
})();
