/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Instancia de un diálogo.
 * @typedef {dialogo}
 */

/**
 * Instancia de un desplegable.
 * @typedef {desplegable}
 */

/**
 * Métodos anexados a la gestión de la interfaz.
 */
(function() {
    "use strict";
    
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
     * @memberof ui
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
     * @memberof ui
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
                ui.animarDesaparecer(elementoPrecarga,function() {
                    elementoPrecarga.removerClase("visible");
                });
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

    var dialogosAbiertos=[];

    var cerrarDialogoAbierto=function() {
        var dialogoAbierto=ui.obtenerDialogoAbierto();
        if(!dialogoAbierto) return;
        //Ignorar si es modal
        if(dialogoAbierto.param.modal) return;
        ui.cerrarDialogo(dialogoAbierto);
    },
    actualizarZIndexDialogos=function() {
        if(!dialogosAbiertos.length) return;

        //Traer al frente el último diálogo abierto y ubicar los demás detrás de la sombra

        var dialogo=dialogosAbiertos[dialogosAbiertos.length-1],
            z=9999; //z-index de la sombra, según CSS

        if(dialogo.param.sobreponer) {
            z=999999; //z-index de la sombra al sobreponer, según CSS
            ui.obtenerElementoSombra().agregarClase("sobreponer");
        } else {
            ui.obtenerElementoSombra().removerClase("sobreponer");
        }

        z-=dialogosAbiertos.length-1;

        for(var i=0;i<dialogosAbiertos.length-1;i++) {
            dialogosAbiertos[i].elem.estilo("zIndex",z);
            z++;
        }
        
        dialogo.elem.estilo("zIndex",z+1);
    },
    docDialogoKeyDn=function(ev) {
        if(ev.which==27) {
            //ESC
            cerrarDialogoAbierto();
            ev.stopPropagation();
        }
    },
    docBackbuttonDialogo=function(ev) {
        cerrarDialogoAbierto();
        ev.preventDefault();
        ev.stopPropagation();
    },
    removerEventosDialogo=function() {
        document.removerEvento("backbutton",docBackbuttonDialogo)
            .removerEvento("keydown",docDialogoKeyDn);
    },
    establecerEventosDialogo=function() {
        document.evento("backbutton",docBackbuttonDialogo)
            .evento("keydown",docDialogoKeyDn);

        //Click en la sombra
        ui.obtenerElementoSombra()
            .evento("click",function(ev) {
                cerrarDialogoAbierto();
                ev.preventDefault();
            });
    };

    /**
     * Construye un cuadro de diálogo.
     * @memberof ui
     * @param {Object} parametros - Parámetros.
     * @param {(string|Node|Element)} [parametros.cuerpo] - Elemento o HTML a incluir en el cuerpo.
     * @param {Object[]} [parametros.opciones] - Botones de acción a generar.
     * @param {string} [parametros.opciones.etiqueta] - Etiqueta del botón.
     * @param {string} [parametros.opciones.clase] - Clase CSS del botón.
     * @param {boolean} [parametros.opciones.predeterminado] - Determina si es la acción predeterminada.
     * @param {function} [parametros.retorno] - Función de retorno al cerrar el diálogo (Resultado). Recibirá como parámetro el índice del botón, o NULL si fue cancelado.
     * @param {function} [parametros.retornoAbierto] - Función de retorno al abrir el diálogo.
     * @param {boolean} [parametros.mostrarCerrar=false] - Determina si se debe mostrar la X para cancelar el diálogo.
     * @param {boolean} [parametros.eliminar=false] - Determina si el diálogo se debe eliminar luego de cerrado.
     * @param {boolean} [parametros.modal=false] - Si es true, deshabilitará las posibilidades de cancelar el diálogo.
     * @param {boolean} [parametros.sobreponer=false] - Si es true, se forzará que quede por encima de todo, incluso de la precarga.
     * @param {string} [parametros.icono=null] - Ícono. Admite una ruta relativa al directorio `recursos` de la aplicación actual, una URL absoluta,
     * o uno de los siguientes valores: `pregunta`, `exclamacion`, `alerta`, `error`, `informacion`, `ubicacion`, `audio`, `camara`,
     * `notificacion`, `seguridad`, `ok`.
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
            retornoAbierto:null,
            mostrarCerrar:false,
            eliminar:false,
            padreAnterior:null,
            abierto:false,
            modal:false,
            sobreponer:false,
            icono:null
        },parametros);

        var cuerpo=elem.querySelector(".dialogo-contenido");
        if(typeof parametros.cuerpo==="object"&&(parametros.cuerpo instanceof Node)) {
            //Almacenar la ubicación anterior del contenido para poder restaurarlo
            parametros.padreAnterior=parametros.cuerpo.parentNode;

            cuerpo.anexar(parametros.cuerpo);
        } else {
            cuerpo.establecerHtml(parametros.cuerpo);
        }

        if(parametros.icono) {
            var src="",
                clase="";
            if(/^https?:\/\//.test(parametros.icono)) {
                src=parametros.icono;
            } else if(parametros.icono.substring(0,1)=="/") {
                src=ui.obtenerUrlBase()+parametros.icono.substring(1);
            } else if(["pregunta","exclamacion","alerta","error","seguridad","informacion","ubicacion","audio","camara","notificacion","ok"].indexOf(parametros.icono)>=0) {
                //src="recursos/img/"+parametros.icono+".png";
                clase="icono-"+parametros.icono;
            } else {
                src="aplicacion/recursos/"+parametros.icono;
            }
            elem.querySelector(".dialogo-contenido")
                .agregarClase("con-icono")
                .anexar("<div class='dialogo-icono"+(clase?" "+clase:"")+"'>"+(src?"<img src='"+src+"'>":"")+"</div>");
        }

        var obj={
            elem:elem,
            param:parametros,
            obtenerElemento:function() {
                return this.elem;
            },
            obtenerCuerpo:function() {
                return this.elem.querySelector(".dialogo-cuerpo");
            }
        };

        if(parametros.opciones) {
            var contenedor=elem.querySelector(".dialogo-opciones");

            parametros.opciones.forEach(function(boton,i) {
                var btn=document.crear("<a href='#' class='btn'>")
                    .establecerHtml(boton.etiqueta)
                    .dato("indice",i)
                    .evento("click",function(ev) {
                        ev.preventDefault();
                        ui.cerrarDialogo(obj,parseInt(this.dato("indice")));
                    })
                    .evento("keydown",function(ev) {
                        if(ev.which==13) {
                            //Enter
                            ev.preventDefault();
                            ev.stopPropagation();
                            ui.cerrarDialogo(obj,parseInt(this.dato("indice")));
                        }
                    })
                    .anexarA(contenedor);

                if(typeof boton.predeterminado!=="undefined"&&boton.predeterminado) btn.agregarClase("predeterminado");

                if(typeof boton.clase==="string") btn.agregarClase(boton.clase);
            });
        }

        if(!parametros.modal&&parametros.mostrarCerrar) {
            var cerrar=document.crear("<a href='#' class='dialogo-x'></a>");
            elem.querySelector(".dialogo-cuerpo").anexar(cerrar);
            cerrar.evento("click",function(ev) {
                ev.preventDefault();
                ui.cerrarDialogo(obj,null);
            });
        }

        return obj;
    };

    /**
     * Abre un diálogo construido con construirDialogo().
     * @memberof ui
     * @param {Dialogo} dialogo 
     */
    ui.abrirDialogo=function(dialogo) {
        dialogosAbiertos.push(dialogo);

        actualizarZIndexDialogos();

        ui.animarAparecer(dialogo.elem,function() {
            if(dialogo.abierto&&dialogo.param.retornoAbierto) dialogo.param.retornoAbierto();
        });

        setTimeout(function() {
            dialogo.obtenerCuerpo().scrollTop=0;
        });

        dialogo.abierto=true;

        var btn=dialogo.elem.querySelector(".predeterminado");
        if(btn) btn.focus();

        //Sombra
        ui.mostrarSombra();
        
        establecerEventosDialogo();

        return ui;
    };

    /**
     * Devuelve el diálogo actualmente abierto.
     * @memberof ui
     * @returns {(Dialogo|null)}
     */
    ui.obtenerDialogoAbierto=function() {
        return dialogosAbiertos.length?dialogosAbiertos[dialogosAbiertos.length-1]:null;
    };

    /**
     * Devuelve todos los diálogos abiertos.
     * @memberof ui
     * @returns {Dialogo[]}
     */
    ui.obtenerDialogosAbiertos=function() {
        return dialogosAbiertos;
    };

    /**
     * Cierra un diálogo construido con construirDialogo().
     * @memberof ui
     * @param {Dialogo} [dialogo] - Diálogo.
     * @param {number} [opcion=null] - Número de opción que cierra el diálogo, o NULL.
     * @param {boolean} [omitirAnimacion=false] - Si es true, ierra el diálogo inmediatamente.
     * @param {boolean} [eliminar] - Eliminar el diálogo luego de cerrar. Si se omite, se tomará de la configuración del diálogo.
     * @returns {ui}
     */
    ui.cerrarDialogo=function(dialogo,opcion,omitirAnimacion,eliminar) {
        if(typeof dialogo==="undefined"||!dialogo) dialogo=ui.obtenerDialogoAbierto();
        if(typeof opcion==="undefined") opcion=null;
        if(typeof omitirAnimacion==="undefined") omitirAnimacion=false;
        if(typeof eliminar==="undefined") eliminar=dialogo.param.eliminar;

        if(!dialogo) return ui;

        removerEventosDialogo();

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
        
        //Remover de dialogosAbiertos
        for(var i=0;i<dialogosAbiertos.length;i++) {
            if(dialogosAbiertos[i]===dialogo) {
                dialogosAbiertos.splice(i,1);
                break;
            }
        }

        if(!dialogosAbiertos.length) ui.ocultarSombra();

        actualizarZIndexDialogos();

        return ui;
    };

    /**
     * Elimina o destruye un diálogo construido con construirDialogo().
     * @memberof ui
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

    /**
     * Cierra el desplegable actual.
     * @param {boolean} [forzar=false] - Fuerza el cierre, ignorando la opción mantener.
     */
    var cerrarDesplegableAbierto=function(forzar) {
        if(!desplegableAbierto) return;
        if(typeof forzar==="undefined") forzar=false;
        if(!forzar&&desplegableAbierto.opciones.mantener) {
            posicionarDesplegable(desplegableAbierto);
        } else {
            if(desplegableAbierto.opciones.retornoCierre) desplegableAbierto.opciones.retornoCierre();
            ui.cerrarDesplegable(desplegableAbierto,false);
        }
    },
    elemMousewheel=function(ev) {
        ev.stopPropagation();
    },
    docBackbuttonDesplegable=function(ev) {
        cerrarDesplegableAbierto();
        ev.preventDefault();
        ev.stopPropagation();
    },
    clickElemSombraDesplegable=function(ev) {
        cerrarDesplegableAbierto(true);
        ev.preventDefault();
    },
    /**
     * Remueve los manejadores de eventos relacionados con los desplegables.
     */
    removerEventosDesplegable=function(elem) {
        window.removerEvento("resize scroll wheel blur",cerrarDesplegableAbierto);
        document.removerEvento("backbutton",docBackbuttonDesplegable);
        elem.removerEvento("wheel",elemMousewheel);
        ui.obtenerElementoSombra()
            .removerEvento("click",clickElemSombraDesplegable);
    },
    /**
     * Asigna los manejadores de eventos relacionados con los desplegables.
     */
    establecerEventosDesplegable=function(elem) {
        removerEventosDesplegable(elem);

        window.evento("resize scroll wheel blur",cerrarDesplegableAbierto);
        document.evento("backbutton",docBackbuttonDesplegable);
        elem.evento("wheel",elemMousewheel);
            
        //Click en la sombra
        ui.obtenerElementoSombra()
            .evento("click",clickElemSombraDesplegable);
    };

    /**
     * @memberof ui
     * Posiciona un elemento del DOM relativo a otro elemento o a coordenadas de posición absoluta.
     * @param {Node} elemento - Elemento a posicionar.
     * @param {(Node|null)} elementoRelativo - Elemento relativo al cual se debe posicionar `elemento`. Especificar `null` para trabajar con
     * posición absoluta.
     * @param {Object} [posicion] - Posición absoluta, relativa al marco de la ventana.
     * @param {int} [posicion.izquierda] - Posición lateral izquierda.
     * @param {int} [posicion.derecha] - Posición lateral derecha.
     * @param {int} [posicion.superior] - Posición superior.
     * @param {int} [posicion.inferior] - Posición inferior.
     * @param {Object} [opciones] - Opciones.
     * @param {bool} [opciones.reposicionar=true] - Si admite reposicionar el elemento si es necesario (por ejemplo, abrir hacia arriba en lugar
     * de hacia abajo).
     * @param {bool} [opciones.redimensionar=true] - Si admite redimensionar el elemento si es necesario.
     * @param {bool} [opciones.anchoComponente=true] - Ajustar al ancho del componente relativo.
     * @returns {ui}
     */
    ui.posicionarElemento=function(elemento,elementoRelativo,posicion,opciones) {
        if(typeof opciones==="undefined") opciones={};
        opciones=Object.assign({
            reposicionar:true,
            redimensionar:true,
            anchoComponente:true
        },opciones);

        var altoElemRelativo=0,
            anchoElemRelativo=0;

        if(elementoRelativo) {
            var posicionElemento=elementoRelativo.posicionAbsoluta();
            altoElemRelativo=elementoRelativo.alto();
            anchoElemRelativo=elementoRelativo.ancho();
            elemento.estilos({
                left:posicionElemento.x,
                top:posicionElemento.y+altoElemRelativo,
                right:"auto",
                bottom:"auto"                
            });
            if(opciones.anchoComponente) {
                elemento.estilos({
                    width:anchoElemRelativo
                });
            }
            if(opciones.redimensionar) {
                elemento.estilos({
                    height:"auto"
                });
            }
        } else {
            elemento.estilos({
                left:posicion.hasOwnProperty("izquierda")?posicion.izquierda:"auto",
                top:posicion.hasOwnProperty("arriba")?posicion.arriba:"auto",
                right:posicion.hasOwnProperty("derecha")?posicion.derecha:"auto",
                bottom:posicion.hasOwnProperty("abajo")?posicion.abajo:"auto"
            });
            if(opciones.redimensionar) {
                elemento.estilos({
                    width:"auto",
                    height:"auto"
                });
            }
        }

        //Verificar si entra en pantalla
        var posicion=elemento.posicionAbsoluta(),
            alto=elemento.alto(),
            ancho=elemento.ancho(),
            altoVentana=window.alto(),
            anchoVentana=document.body.ancho(), //Usar el ancho del body, que no incluye el ancho de la barra de desplazamiento
            margen=15;

        if(posicion.y+alto+margen>altoVentana) {
            var bottom=altoVentana-posicion.y;
            if(opciones.reposicionar&&altoVentana-bottom>=alto+margen) {
                //Abrir hacia arriba (si hay más espacio)
                elemento.estilos({
                    top:"auto",
                    bottom:bottom
                });
            } else if(opciones.redimensionar) {
                //Redimensionar
                elemento.estilos({
                    height:altoVentana-margen-posicion.y-altoElemRelativo
                });
            }
        }

        //Posición lateral (si el ancho es superior al ancho del componente, por ejemplo si tiene min-width, puede excederse)
        if(posicion.x+ancho+margen>anchoVentana) {
            var right=anchoVentana-(posicion.x+anchoElemRelativo);
            if(opciones.reposicionar&&anchoVentana-right>=ancho+margen) {
                //Abrir hacia la izquierda (si hay más espacio)
                elemento.estilos({
                    left:"auto",
                    right:right
                });
            } else if(opciones.redimensionar) {
                //Redimensionar
                elemento.estilos({
                    minWidth:"0",
                    width:anchoVentana-margen-posicion.x
                });
            }
        }
    };

    /**
     * Posiciona el desplegable relativo al elemento elemento.
     * @param {Desplegable} desplegable
     */
    var posicionarDesplegable=function(desplegable) {
        ui.posicionarElemento(desplegable.elem,desplegable.componente.obtenerElemento());
    };

    /**
     * Crea un desplegable debajo de un componente.
     * @memberof ui
     * @param {Componente} componente - Componente relativo al cual se posicionará el desplegable.
     * @param {Object} [opciones] - Configuración del desplegable.
     * @param {string} [opciones.desplegar="abajo"] - Dirección hacia la cual se desplegará, relativo al componente (actualmente "abajo" es el único valor disponible).
     * @param {boolean} [opciones.reposicionar=true] - Reposicionar el desplegable si no hay espacio suficiente hasta el borde de la ventana. Si es false, será redimensionado.
     * @param {boolean} [opciones.adaptativo=true] - Si es true, tendrá una presentación diferente en pantallas pequeñas para mejor usabilidad.
     * @param {string} [opciones.clase] - Clase CSS.
     * @param {function} [opciones.retornoCierre] - Función de retorno al cerrarse el desplegable en forma automática.
     * @param {boolean} [opciones.destruir=true] - Si es true, será destruido tras cerrarse.
     * @param {boolean} [opciones.mantener=false] - Si es true, evitará que el desplegable se cierre automáticamente al perderse el foco o desplazarse la página.
     * @returns {Desplegable}
     *//**
     * Crea un desplegable debajo de un componente.
     * @memberof ui
     * @param {Componente} componente - Componente relativo al cual se posicionará el desplegable.
     * @param {(Element|Node)} elemento - Elemento a desplegar. Puede omitirse para crear un desplegable vacío.
     * @param {Object} [opciones] - Configuración del desplegable.
     * @param {string} [opciones.desplegar="abajo"] - Dirección hacia la cual se desplegará, relativo al componente (actualmente "abajo" es el único valor disponible).
     * @param {boolean} [opciones.reposicionar=true] - Reposicionar el desplegable si no hay espacio suficiente hasta el borde de la ventana. Si es false, será redimensionado.
     * @param {boolean} [opciones.adaptativo=true] - Si es true, tendrá una presentación diferente en pantallas pequeñas para mejor usabilidad.
     * @param {string} [opciones.clase] - Clase CSS.
     * @param {function} [opciones.retornoCierre] - Función de retorno al cerrarse el desplegable en forma automática.
     * @param {boolean} [opciones.destruir=true] - Si es true, será destruido tras cerrarse.
     * @param {boolean} [opciones.mantener=false] - Si es true, evitará que el desplegable se cierre automáticamente al perderse el foco o desplazarse la página.
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
            destruir:true,
            mantener:false
        },opciones);

        var doc=ui.obtenerDocumento(),
            elem=doc.crear("<div tabindex='-1' class='foxtrot-desplegable"+(opciones.clase?" "+opciones.clase:"")+(opciones.adaptativo?" foxtrot-desplegable-adaptativo":"")+"'>")
                .anexarA(componente.obtenerElemento());

        doc.crear("<a href='#' class='foxtrot-desplegable-x'>")
            .evento("mousedown",function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
                cerrarDesplegableAbierto(true);
            })
            .anexarA(elem);
        
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
     * @memberof ui
     * @param {Desplegable} desplegable - Objeto generado con ui.crearDesplegable().
     * @returns {ui}
     */
    ui.abrirDesplegable=function(desplegable) {
        var elem=desplegable.elem;
        ui.detenerAnimacion(elem)
            .animarAparecer(elem);
        elem.agregarClase("foxtrot-desplegable-abierto");

        posicionarDesplegable(desplegable);

        //Adaptativo
        var t=ui.obtenerTamano();
        if(desplegable.opciones.adaptativo&&(t=="xs"||t=="sm")) {
            ui.mostrarSombra();
        }

        establecerEventosDesplegable(elem);

        desplegableAbierto=desplegable;

        return ui;
    };

    /**
     * Cierra un desplegable.
     * @memberof ui
     * @param {Desplegable} desplegable - Objeto generado con ui.crearDesplegable().
     * @param {boolean} [animar=true] - Cerrar con animación.
     * @returns {ui}
     */
    ui.cerrarDesplegable=function(desplegable,animar) {
        var elem=desplegable.elem,
            fn=function() {
                elem.removerClase("foxtrot-desplegable-abierto");
                if(desplegable.opciones.destruir) elem.remover();
            };

        if(typeof animar==="undefined"||animar) {
            ui.detenerAnimacion(elem)
                .animarDesaparecer(elem,fn);
        } else {
            fn();
        }

        removerEventosDesplegable(elem);

        desplegableAbierto=null;

        return ui;
    };

    //// Implementaciones

    /**
     * Muestra un diálogo de alerta o información (equivalente a alert()).
     * @memberof ui
     * @param {string} mensaje - Mensaje. Admite HTML.
     * @param {Object} [opciones] - Opciones adicionales.
     * @param {string} [opciones.etiquetaBoton="Aceptar"] - Etiqueta del botón.
     * @param {string} [opciones.icono=null] - Ícono. Admite una ruta relativa al directorio `recursos` de la aplicación actual, una URL absoluta,
     * o uno de los siguientes valores: `pregunta`, `exclamacion`, `alerta`, `error`, `informacion`, `ubicacion`, `audio`, `camara`,
     * `notificacion`, `seguridad`, `ok`.
     *//**
     * Muestra un diálogo de alerta o información (equivalente a alert()).
     * @memberof ui
     * @param {string} mensaje - Mensaje. Admite HTML.
     * @param {function} [funcion] - Función de retorno al cerrar el diálogo.
     * @param {Object} [opciones] - Opciones adicionales.
     * @param {string} [opciones.etiquetaBoton="Aceptar"] - Etiqueta del botón.
     * @param {string} [opciones.icono=null] - Ícono. Admite una ruta relativa al directorio `recursos` de la aplicación actual, una URL absoluta,
     * o uno de los siguientes valores: `pregunta`, `exclamacion`, `alerta`, `error`, `informacion`, `ubicacion`, `audio`, `camara`,
     * `notificacion`, `seguridad`, `ok`.
     */
    ui.alerta=function(mensaje,b,c) {
        var funcion=null,opciones={};
        if(typeof b==="function") {
            //alerta(mensaje,funcion[,opciones])
            funcion=b;
            if(typeof c!=="undefined") opciones=c;
        } else if(typeof b==="object") {
            //alerta(mensaje,opciones)
            opciones=b;
        }

        opciones=Object.assign({
            etiquetaBoton:"Aceptar",
            icono:null
        },opciones);

        //TODO Integración con el plugin de Cordova de Foxtrot
        //TODO Integración con el cliente de escritorio

        ui.abrirDialogo(ui.construirDialogo({
            cuerpo:mensaje,
            retorno:function(resultado) {
                if(funcion) funcion();
            },
            opciones:[{
                etiqueta:opciones.etiquetaBoton,
                clase:"btn-primary",
                predeterminado:true
            }],
            eliminar:true,
            sobreponer:true,
            icono:opciones.icono
        }));

        return ui;
    };
    
    /**
     * Muestra un diálogo de confirmación.
     * @memberof ui
     * @param {string} mensaje - Mensaje. Admite HTML.
     * @param {Object} [opciones] - Opciones adicionales.
     * @param {boolean} [opciones.cancelar=false] - Mostrar opción "Cancelar".
     * @param {string} [opciones.etiquetaSi="Si"] - Etiqueta del botón afirmativo.
     * @param {string} [opciones.etiquetaNo="No"] - Etiqueta del botón negativo.
     * @param {string} [opciones.etiquetaCancelar="Cancelar"] - Etiqueta del botón de cancelar.
     * @param {string} [opciones.icono=null] - Ícono. Admite una ruta relativa al directorio `recursos` de la aplicación actual, una URL absoluta,
     * o uno de los siguientes valores: `pregunta`, `exclamacion`, `alerta`, `error`, `informacion`, `ubicacion`, `audio`, `camara`,
     * `notificacion`, `seguridad`, `ok`.
     * @param {number} [opciones.predeterminado=0] - Índice del botón predeterminado (`0` Si, `1` No, `2` Cancelar).
     *//**
     * Muestra un diálogo de confirmación.
     * @memberof ui
     * @param {string} mensaje - Mensaje. Admite HTML.
     * @param {function} [funcion] - Función de retorno. Recibirá un parámetro con la respuesta (`true`, `false` o `null` si fue cancelado).
     * @param {Object} [opciones] - Opciones adicionales.
     * @param {boolean} [opciones.cancelar=false] - Mostrar opción "Cancelar".
     * @param {string} [opciones.etiquetaSi="Si"] - Etiqueta del botón afirmativo.
     * @param {string} [opciones.etiquetaNo="No"] - Etiqueta del botón negativo.
     * @param {string} [opciones.etiquetaCancelar="Cancelar"] - Etiqueta del botón de cancelar.
     * @param {string} [opciones.icono=null] - Ícono. Admite una ruta relativa al directorio `recursos` de la aplicación actual, una URL absoluta,
     * o uno de los siguientes valores: `pregunta`, `exclamacion`, `alerta`, `error`, `informacion`, `ubicacion`, `audio`, `camara`,
     * `notificacion`, `seguridad`, `ok`.
     * @param {number} [opciones.predeterminado=0] - Índice del botón predeterminado (`0` Si, `1` No, `2` Cancelar).
     */
    ui.confirmar=function(mensaje,b,c) {
        var funcion=null,opciones={};
        if(typeof b==="function") {
            //confirmar(mensaje,funcion[,opciones])
            funcion=b;
            if(typeof c!=="undefined") opciones=c;
        } else if(typeof b==="object") {
            //confirmar(mensaje,opciones)
            opciones=b;
        }

        opciones=Object.assign({
            cancelar:false,
            etiquetaSi:"Si",
            etiquetaNo:"No",
            etiquetaCancelar:"Cancelar",
            icono:null,
            predeterminado:0
        },opciones);

        //TODO Integración con el plugin de Cordova de Foxtrot
        //TODO Integración con el cliente de escritorio

        var botones=[
            {
                etiqueta:opciones.etiquetaSi,
                clase:"btn-primary",
                predeterminado:opciones.predeterminado==0
            },
            {
                etiqueta:opciones.etiquetaNo,
                predeterminado:opciones.predeterminado==1
            }
        ];
        
        if(opciones.cancelar) botones.push({
                etiqueta:opciones.etiquetaCancelar,
                predeterminado:opciones.predeterminado==2
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
            eliminar:true,
            sobreponer:true,
            icono:opciones.icono
        }));

        return ui;
    };

    //// Utilidades

    var elemSombra=null;

    /**
     * Muestra la sombra debajo de los diálogos.
     * @memberof ui
     * @returns {ui}
     */
    ui.mostrarSombra=function() {
        ui.obtenerElementoSombra();
        elemSombra.removerEventos();
        ui.detenerAnimacion(elemSombra).animarAparecer(elemSombra);
        return ui;
    };

    /**
     * Oculta la sombra debajo de los diálogos.
     * @memberof ui
     * @returns {ui}
     */
    ui.ocultarSombra=function() {
        if(elemSombra) ui.detenerAnimacion(elemSombra).animarDesaparecer(elemSombra);
        return ui;
    };

    /**
     * Devuelve el emlemento de la sombra.
     * @memberof ui
     * @returns {Node}
     */
    ui.obtenerElementoSombra=function() {
        var doc=ui.obtenerDocumento();
        if(!elemSombra) elemSombra=doc.querySelector("#foxtrot-sombra");
        if(!elemSombra) elemSombra=doc.crear("<div id='foxtrot-sombra' class='oculto'>").anexarA(doc.body);
        return elemSombra;
    };
})();
