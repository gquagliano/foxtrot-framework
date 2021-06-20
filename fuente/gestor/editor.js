/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @typedef Editor
 */

/**
 * @class Editor de vistas.
 */
var editor=new function() {
    "use strict";

    ////Configuración

    var claseBotonesBarrasHerramientas="btn btn-sm";

    ////Almacenes y parámetros

    var self=this,
        iconosComponentes={},
        eventosPausados=false,
        bordesVisibles=true,
        invisiblesVisibles=true,
        claseMovil=false,
        tamanoActual="g",
        cambiosSinGuardar=false,
        limiteHistorial=20,
        editandoTexto=0;

    this.listo=false;
    this.aplicacionArchivoAbierto=null
    this.rutaArchivoAbierto=null;
    this.modoArchivoAbierto=null;
    this.clienteArchivoAbierto=null;
    this.urlBase=null;

    this.componentesSeleccionados=[];
    this.historial=[];

    ////Elementos del dom
    
    var barraComponentes=document.querySelector("#foxtrot-barra-componentes"),
        cuerpoBarraComponentes=barraComponentes.querySelector(".foxtrot-contenidos-barra-herramientas"),
        barraPropiedades=document.querySelector("#foxtrot-barra-propiedades"),
        cuerpoBarraPropiedades=barraPropiedades.querySelector(".foxtrot-contenidos-barra-herramientas"),
        botonDeshacer=document.querySelector("#foxtrot-btn-deshacer"),
        botonRehacer=document.querySelector("#foxtrot-btn-rehacer");

    ////Construcción de la interfaz

    function guardarConfigInterfaz() {
        window.localStorage.setItem("configEditor",JSON.stringify({
            posicionBarraComponentes:barraComponentes.posicionAbsoluta(),
            posicionBarraPropiedades:barraPropiedades.posicionAbsoluta()
        }));
    }

    function obtenerConfigInterfaz() {
        var obj=window.localStorage.getItem("configEditor");
        if(!obj) return {
            posicionBarraComponentes:null,
            posicionBarraPropiedades:null
        };
        return JSON.parse(obj);
    }

    function configurarBarrasHerramientas() {
        barraComponentes.arrastrable({
            asa:barraComponentes.querySelector(".foxtrot-asa-arrastre"),
            mover:true,
            drag:function() {
                removerZonas();
            },
            dragend:function() {
                removerZonas();
                guardarConfigInterfaz();
            }
        });
        barraPropiedades.arrastrable({
            asa:barraPropiedades.querySelector(".foxtrot-asa-arrastre"),
            mover:true,
            drag:function() {
                removerZonas();
            },
            dragend:function() {
                removerZonas();
                guardarConfigInterfaz();
            }
        });

        //Restaurar posicionamiento
        var config=obtenerConfigInterfaz();
        if(config.posicionBarraComponentes) barraComponentes.estilos({
                left:config.posicionBarraComponentes.x,
                top:config.posicionBarraComponentes.y,
                right:"auto"
            });
        if(config.posicionBarraPropiedades) barraPropiedades.estilos({
                left:config.posicionBarraPropiedades.x,
                top:config.posicionBarraPropiedades.y,
                right:"auto"
            });
        
        //Reposicionar si el tamaño de ventana actual es inferior al tamaño cuando se almacenó la config
        reposicionarBarrasHerramientas();

        window.evento("resize",reposicionarBarrasHerramientas);
    }

    function contruirBarrasHerramientas() {
        var componentes=ui.obtenerComponentes();

        var grupos={
            0:[]
        };
        
        for(var nombre in componentes) {
            if(!componentes.hasOwnProperty(nombre)) continue;

            var comp=componentes[nombre],
                gr=comp.config.grupo;

            if(!gr) gr=0;
            if(!grupos.hasOwnProperty(gr)) grupos[gr]=[];
            grupos[gr].push(comp);
        }

        for(var grupo in grupos) {
            if(!grupos.hasOwnProperty(grupo)) continue;

            var barraGrupo=document.crear("<div class='foxtrot-grupo-herramientas'>");
            if(grupo!=0) document.crear("<label>").establecerHtml(grupo).anexarA(barraGrupo);
            barraGrupo.anexarA(cuerpoBarraComponentes);

            for(var i=0;i<grupos[grupo].length;i++) {
                var comp=grupos[grupo][i];
                if(!comp.config.icono) continue;

                var icono=document.crear("<img>")
                    .atributo("src",editor.urlBase+"recursos/componentes/iconos/"+comp.config.icono)
                    .atributo("title",comp.config.descripcion);
                iconosComponentes[comp.config.nombre]=icono;

                barraGrupo.anexar(
                    document.crear("<button class='"+claseBotonesBarrasHerramientas+"'>")
                        .anexar(
                            icono.clonar()  //Clonamos el ícono para que no afecte la instancia almacenada en iconosComponentes
                                            //(al arrastrar, toma los estilos que pueda tener al momento de iniciar la operación de arraastre)
                        )
                        .metadato("componente",comp.config.nombre)
                        .propiedad("disabled",comp.config.hasOwnProperty("ocultar"))
                    );
            }
        }

        configurarBarrasHerramientas();
    }  

    function reposicionarBarrasHerramientas() {
        function fn(elem) {
            var posicion=elem.posicion(),
                alto=elem.alto(),
                ancho=elem.ancho(),
                altoVentana=window.alto(),
                anchoVentana=window.ancho();

            if(posicion.x+ancho+20>anchoVentana) elem.estilo("left",anchoVentana-ancho-20);
            if(posicion.x<20) elem.estilo("left",20);
            if(posicion.y+alto+20>=altoVentana) elem.estilo("top",altoVentana-alto-20);
            if(posicion.y<75) elem.estilo("top",75);
        };

        fn(barraComponentes);
        fn(barraPropiedades);
        guardarConfigInterfaz();
    }

    this.construirPropiedades=function() {
        if(!self.componentesSeleccionados.length) {
            barraPropiedades.agregarClase("foxtrot-barra-propiedades-vacia");
            cuerpoBarraPropiedades.establecerHtml("Ningún componente seleccionado");
            return;
        }

        var seleccionMultiple=self.componentesSeleccionados.length>1;
        
        barraPropiedades.removerClase("foxtrot-barra-propiedades-vacia");
        cuerpoBarraPropiedades.establecerHtml("");

        var agregarPropiedad=function(barra,nombre,prop) {
            var fila=document.crear("<div class='foxtrot-propiedad'>"),
                label=document.crear("<label>").establecerHtml(prop.etiqueta).anexarA(fila);

            var tipo=prop.hasOwnProperty("tipo")?prop.tipo:"texto",
                fn=prop.hasOwnProperty("funcion")?prop.funcion:null,
                placeholder=prop.hasOwnProperty("placeholder")?prop.placeholder:null,
                ayuda=prop.hasOwnProperty("ayuda")?prop.ayuda:null,
                evento=prop.hasOwnProperty("evento")?prop.evento:null,
                evaluable=prop.hasOwnProperty("evaluable")?prop.evaluable:false,
                timeout=0;

            //Si es tipo opciones o lógico y el valor no se corresponde con una de las opciones disponibles, convertir en campo de texto libre
            if(!seleccionMultiple&&
                (tipo=="opciones"&&prop.valor&&!prop.opciones.hasOwnProperty(prop.valor))||
                ((tipo=="bool"||tipo=="logico")&&prop.valor&&typeof prop.valor!=="boolean"))
                    tipo="texto";

            if(ayuda) {
                document.crear("<img src='"+editor.urlBase+"../gestor/img/ayuda.png'>")
                    .atributo("title",ayuda)
                    .anexarA(label);
            }

            var reemplazarDesplegable=function(valor,campo,fn) {
                if(valor=="foxtrot-ingresar-expresion") {
                    //Reemplazar el desplegable por un campo de texto
                    var nuevoCampo=document.crear("<input type='text' class='form-control'>")
                        .atributo("placeholder","Ingresar expresión...")
                        .valor(prop.valor)
                        .evento("input",function(ev) {
                            var valor=this.valor();
                            clearTimeout(timeout);
                            timeout=setTimeout(function() {
                                fn(valor);
                            },200);
                        }).evento("blur",function(ev) {
                            fn(this.valor());
                        });

                    campo.insertarDespues(nuevoCampo)
                        .remover();

                    nuevoCampo.focus();

                    return true;
                }
                return false;
            };

            if(tipo=="bool"||tipo=="logico") { //TODO Reemplazar 'bool'
                //Para las propiedades booleanas utilizaremos un desplegable en lugar de un checkbox
                //TODO ¿Reemplazar por un switch?
                var campo=document.crear("<select class='custom-select'>");
                fila.anexar(campo);

                campo.anexar("<option value=''></option>");
                
                //Opción de convertir en un campo de texto
                if(evaluable) campo.anexar("<option value='foxtrot-ingresar-expresion'>Expresión...</option>");

                campo.anexar("<option value='s'>Si</option>");
                campo.anexar("<option value='n'>No</option>");

                if(!seleccionMultiple&&(prop.valor===true||prop.valor===false)) campo.valor(prop.valor?"s":"n");

                var fn2=function(v) {                    
                    if(fn) {
                        self.componentesSeleccionados.forEach(function(componente) {
                            fn.call(editor,componente,tamanoActual,nombre,v);
                        });
                    }
                    cambiosSinGuardar=true;
                };

                campo.evento("change",function(ev) {
                    var v=this.valor();

                    if(reemplazarDesplegable(v,campo,fn2)) return;
                    
                    if(v=="s") v=true;
                    else if(v=="n") v=false;
                    else v=null;
                    fn2(v);
                });
            } else if(tipo=="opciones") {
                var campo=document.crear("<select class='custom-select'>");
                fila.anexar(campo);
                
                //Opción en blanco para revertir al valor predeterminado
                campo.anexar("<option value=''></option>");

                //Opción de convertir en un campo de texto
                if(evaluable) campo.anexar("<option value='foxtrot-ingresar-expresion'>Expresión...</option>");

                //Costruir opciones
                prop.opciones.porCada(function(clave,etiqueta) {
                    campo.anexar(
                        document.crear("<option>")
                            .valor(clave)
                            .establecerTexto(etiqueta)
                    );
                });

                if(!seleccionMultiple) campo.valor(prop.valor);

                var timeout,
                    fn2=function(v) {
                        if(fn)  {
                            self.componentesSeleccionados.forEach(function(componente) {
                                fn.call(editor,componente,tamanoActual,nombre,v);
                            });
                        }
                        cambiosSinGuardar=true;
                    };

                campo.evento("change",function(ev) {
                    var v=this.valor();

                    if(reemplazarDesplegable(v,campo,fn2)) return;

                    fn2(v);
                });
            } else if(tipo=="archivo") {
                //TODO Por el momento, simplemente mostramos un campo de archivo, eventualmente debe ser un gestor de archivos incluyendo subida y recorte de imagenes

                var campo=document.crear("<input type='file' class='form-control'>");
                fila.anexar(campo);

                campo.evento("change",function(ev) {
                    self.componentesSeleccionados.forEach(function(componente) {
                        if(fn) fn.call(editor,componente,tamanoActual,nombre,campo.files);
                    });
                    cambiosSinGuardar=true;
                });
            } else if(tipo=="comando") {
                //Botón (no es realmene una propiedad)

                var campo=document.crear("<a href='#' class='btn btn-propiedad'>");
                campo.establecerHtml(prop.hasOwnProperty("boton")?prop.boton:prop.etiqueta);
                fila.anexar(campo);

                campo.evento("click",function(ev) {
                    self.componentesSeleccionados.forEach(function(componente) {
                        if(fn) fn.call(editor,componente,tamanoActual,nombre);
                    });
                    cambiosSinGuardar=true;
                });
            } else {
                //Campo de texto como predeterminado

                var campo,
                    campoComandos=null,
                    valor=prop.valor;                

                var fn2=function() {
                    if(!fn) return;

                    var nuevoValor="";
                    if(campoComandos) nuevoValor=campoComandos.valor();
                    nuevoValor+=campo.valor();

                    self.componentesSeleccionados.forEach(function(componente) {
                        fn.call(editor,componente,tamanoActual,nombre,nuevoValor);
                    });
                    
                    cambiosSinGuardar=true;
                };

                if(evento) {
                    //Para los eventos mostraremos un desplegable con los comandos además del campo de texto
                    campoComandos=document.crear("<select class='custom-select mr-2'>\
                        <option></option>\
                        <option>servidor:</option>\
                        <option>enviar:</option>\
                        <option>servidor-apl:</option>\
                        <option>enviar-apl:</option>\
                        <option>ir:</option>\
                        <option>no-ir:</option>\
                        <option>abrir:</option>\
                        <option>apl:</option>\
                        </select>");
                    fila.anexar(campoComandos);

                    fila.agregarClase("foxtrot-evento");
                    
                    campoComandos.evento("change",function(ev) {
                        fn2();
                    });
                    
                    if(!seleccionMultiple&&prop.valor) {
                        var comando="",
                            p=prop.valor.indexOf(":");                        
                        if(p>0) {
                            comando=prop.valor.substring(0,p+1);
                            valor=prop.valor.substring(p+1);
                        }                        
                        campoComandos.valor(comando);
                    }
                }
                
                var campo=document.crear("<input type='text' class='form-control'>");
                if(!seleccionMultiple) campo.valor(valor);
                if(placeholder) campo.atributo("placeholder",placeholder);
                fila.anexar(campo);

                campo.evento("input",function(ev) {
                    clearTimeout(timeout);
                    timeout=setTimeout(function() {
                        fn2();
                    },200);
                }).evento("blur",function(ev) {
                    fn2();
                });
            }

            fila.anexarA(barra);
        };

        var propiedades,
            nombreTipoComponente=null,
            fn=function(grupo) {
                var props=propiedades[grupo];
                if(props.vacio()) return;

                var barra=document.crear("<div class='foxtrot-grupo-herramientas'>");

                document.crear("<label>").establecerHtml(grupo).anexarA(barra);

                barra.anexarA(cuerpoBarraPropiedades);

                var orden=Object.keys(props).sort();

                //Caso especial: Primero el nombre
                var i=orden.indexOf("nombre");
                if(i>=0) {
                    orden.splice(i,1);
                    orden=["nombre"].concat(orden);
                }

                orden.forEach(function(nombre) {
                    var prop=props[nombre];
                    agregarPropiedad(barra,nombre,prop);
                });
            };

        if(self.componentesSeleccionados.length==1) {
            var componente=self.componentesSeleccionados[0];
            propiedades=componente.obtenerListadoPropiedades(tamanoActual);
        
            //Propiedades especiales

            //Crear un grupo con el nombre del tipo de componente para que cada componente concreto pueda agregar más propiedades allí, este grupo siempre
            //se mostrará primero.
            var nombreTipoComponente=ui.obtenerConfigComponente(componente.componente).etiqueta;
            if(!propiedades.hasOwnProperty(nombreTipoComponente)) propiedades[nombreTipoComponente]={};
            propiedades[nombreTipoComponente].nombre={
                etiqueta:"Nombre",
                funcion:function(componentes,t,prop,valor) {
                    componentes.establecerNombre(valor);
                },
                valor:componente.nombre
            };

            //Agregar primer grupo
            fn(nombreTipoComponente);
        } else {
            //Selección múltiple

            //Buscar propiedades comunes a todos

            var tipos={};
            propiedades={};
            self.componentesSeleccionados.forEach(function(componente) {
                var tipo=ui.obtenerConfigComponente(componente.componente).etiqueta;
                if(tipos.hasOwnProperty(tipo)) tipos[tipo]++; else tipos[tipo]=1;
            
                var propiedadesComponente=componente.obtenerListadoPropiedades(tamanoActual);
                propiedadesComponente.porCada(function(grupo,props) {
                    if(!propiedades.hasOwnProperty(grupo)) propiedades[grupo]={};
                    Object.assign(propiedades[grupo],props);
                });
            });

            //Título
            var titulo="";
            tipos.porCada(function(tipo,cantidad) {
                if(titulo!="") titulo+=", ";
                titulo+=tipo;
                if(cantidad>1) titulo+="("+cantidad+")";
            });
            document.crear("<div class='foxtrot-grupo-herramientas'>")
                .anexar(document.crear("<label>").establecerHtml(titulo))
                .anexarA(cuerpoBarraPropiedades);
        }

        //Ordenar por nombre de propiedad (nombre de grupo)
        var claves=Object.keys(propiedades).sort();

        //Agregar el resto de los grupos en orden
        claves.forEach(function(grupo) {
            if(grupo!=nombreTipoComponente) fn(grupo);            
        });

        return this;
    };

    ////Eventos

    /**
     * Inserta (crea o mueve) el componente soltado.
     * @param {Object} e - Evento.
     */
    function componenteSoltado(ev) {
        ev.preventDefault();
        ev.stopPropagation(); //Detener la propagación permitirá destinos anidados
        
        cambiosSinGuardar=true;

        var destino,
            ubicacion="dentro";       

        if(ev.target.es({clase:"foxtrot-zona"})) {
            ubicacion=this.es({clase:"foxtrot-zona-anterior"})?"antes":"despues";
            destino=this.metadato("destino");
        } else {
            //Buscar el contenedor (el destino era el elemento principal del componente)
            var componente=ui.obtenerInstanciaComponente(this),
                destino=componente.contenedor;        
            if(!destino||!destino.es({clase:"contenedor"})) return;
        }

        var datos=ev.dataTransfer.getData("text/plain");
        try {
            datos=JSON.parse(datos);
        } catch {
            return;
        }

        if(!datos) return;

        if(datos.hasOwnProperty("insertarComponente")) {
            var obj=self.insertarComponente(destino,datos.insertarComponente,ubicacion);
            self.limpiarSeleccion()
                .establecerSeleccion(obj);
            return;
        }

        if(datos.hasOwnProperty("idComponente")) {
            self.moverComponente(destino,datos.idComponente,ubicacion);
            return;
        }
    }    

    function prepararArrastrarYSoltar() {
        var componentes=cuerpoBarraComponentes.querySelectorAll("button");
        for(var i=0;i<componentes.length;i++) {
            var comp=componentes[i],
                nombre=comp.metadato("componente");
            comp.arrastrable({
                icono:iconosComponentes[nombre],
                datos:JSON.stringify({
                    insertarComponente:nombre
                }),
                dragend:function() {
                    removerZonas();
                }
            });
        }
    }    

    function establecerEventos() {
        ui.obtenerDocumento()
            .removerEventos() //Limpiar eventos
            .eventoFiltrado("click",{
                clase:"componente"
            },function(ev) {
                ev.preventDefault();
                //ev.stopPropagation();

                if(ev.target.es({clase:"foxtrot-editor-ignorar"})) return;
                
                self.alternarSeleccion(this,ev);
            })
            .eventoFiltrado("contextmenu",{
                clase:"componente"
            },function(ev) {
                ev.preventDefault();
                ev.stopPropagation();

                var arbol=[],
                    seleccionMultiple=ev.shiftKey,
                    posMarco=ui.obtenerMarco().posicion();

                //Construir árbol de herencia
                var comp=ui.obtenerInstanciaComponente(this);
                do {
                    arbol.push({
                        etiqueta:comp.obtenerConfigComponente().etiqueta,
                        accion:function(comp) {
                            return function() {
                                if(!seleccionMultiple) self.limpiarSeleccion();
                                self.alternarSeleccion(comp,true);
                            };
                        }(comp)
                    });
                    comp=comp.obtenerPadre();
                } while(comp!=null);
                arbol.reverse();

                ui.cerrarMenu()
                    .abrirMenu(
                        [
                            {
                                etiqueta:"Eliminar",
                                accion:function() {
                                    ui.confirmar("¿Estás seguro de querer eliminar "+(self.componentesSeleccionados.length==1?"el componente":"los componentes")+"?",function(r) {
                                        if(r) self.eliminarComponentes(self.componentesSeleccionados);
                                    });
                                },
                                habilitado:function() {
                                    if(!self.componentesSeleccionados.length) return false;

                                    //Deshabilitar si la selección contiene el componente vista
                                    for(var i=0;i<self.componentesSeleccionados.length;i++)
                                        if(self.esCuerpo(self.componentesSeleccionados[i].elemento)) return false;

                                    return true;
                                },
                                separador:true
                            },
                            {
                                etiqueta:"Seleccionar",
                                submenu:arbol
                            }
                        ],
                        {
                            x:ev.clientX+posMarco.x,
                            y:ev.clientY+posMarco.y
                        },
                        "foxtrot-menu-editor"
                    );
            })
            .evento("click",function() {
                //self.limpiarSeleccion();
            })
            .evento("keydown",function(ev) {
                if(eventosPausados) return;

                if(ev.which==27) {
                    //ESC

                    //Ignorar si está en modo de edición de texto (el componente procesará la tecla ESC)
                    if(ui.obtenerDocumento().querySelector("[contenteditable=true]")) return;

                    self.limpiarSeleccion();
                    
                    //Al deseleccionar todo, mostrar las propiedades de la vista
                    //editor.establecerSeleccion(ui.obtenerInstanciaVistaPrincipal().obtenerElemento());
                } else if(ev.which==46) {
                    //DEL
                    ev.preventDefault();

                    if(!self.componentesSeleccionados.length) return;

                    for(var i=0;i<self.componentesSeleccionados.length;i++)
                        if(self.esCuerpo(self.componentesSeleccionados[i].elemento)) return;

                    ui.confirmar("¿Estás seguro de querer eliminar "+(self.componentesSeleccionados.length==1?"el componente":"los componentes")+"?",function(r) {
                        if(r) self.eliminarComponentes(self.componentesSeleccionados);
                    });
                } else if(ev.ctrlKey&&ev.which==67) {
                    //Ctrl+C
                    ev.preventDefault();

                    self.copiar();
                } else if(ev.ctrlKey&&ev.which==88) {
                    //Ctrl+X
                    ev.preventDefault();

                    self.cortar();
                } else if(ev.which==113) {
                    //F2
                    //Iniciar edición si hay solo un componente seleccionado
                    if(self.componentesSeleccionados.length==1) {
                        ev.preventDefault();
                        self.componentesSeleccionados[0].iniciarEdicion(false);
                    }
                } else if(ev.ctrlKey&&ev.which==90) {
                    //Ctrl+Z
                    ev.preventDefault();
                    self.deshacer();
                } else if(ev.ctrlKey&&ev.which==89) {
                    //Ctrl+Y
                    ev.preventDefault();
                    self.rehacer();
                }
            }).evento("mouseup",function(ev) {
                removerZonas();
            }).evento("paste",function(ev) {
                self.pegar(ev);
            });

        window.onbeforeunload=function(ev) {
            if(!cambiosSinGuardar) return;
            var mensaje="¡Hay cambios sin guardar!";
            (ev||event).returnValue=mensaje;
            return mensaje;
        };
    }    

    ////Gestión de componentes

    this.eliminarComponentes=function(lista) {
        //Se debe trabajar con una copia, ya que eliminarComponente() modificará el listado
        lista.clonar().forEach(function(elem) {
            self.eliminarComponente(elem.obtenerId());
        });
        return this;
    };

    this.eliminarComponente=function(id) {
        this.limpiarSeleccion();
        var obj=ui.obtenerInstanciaComponente(id),
            padre=obj.obtenerPadre();
        obj.eliminar();
        //Actualizar padre
        if(padre) padre.actualizar();
        cambiosSinGuardar=true;
        return this;
    };

    /**
     * Mueve un componente hacia otro elemento.
     * @param {Node|Element} destino - Elemento de destino.
     * @param {string} id - ID del componente a mover.
     * @param {string} [ubicacion="dentro"] - Ubicación donde insertar el componente: "dentro", "antes" o "despues".
     */
    this.moverComponente=function(destino,id,ubicacion) {
        if(typeof ubicacion==="undefined") ubicacion="dentro";

        var obj=ui.obtenerInstanciaComponente(id),
            padreAnterior=obj.obtenerPadre();
        if(!obj||destino===obj.elemento) return this;

        if(ubicacion=="dentro") {
            destino.anexar(obj.elemento);
        } else if(ubicacion=="antes") {
            destino.insertarAntes(obj.elemento);
        } else if(ubicacion=="despues") {
            destino.insertarDespues(obj.elemento);            
        }

        //Actualizar origen y destino
        var padre=obj.obtenerPadre();
        if(padre) padre.actualizar();
        if(padreAnterior) padreAnterior.actualizar();

        cambiosSinGuardar=true;

        return this;
    };

    var temporizadorZonas,
    /**
     * Muestra las zonas para soltar componentes alrededor del componente donde se produce el evento, transcurridos 3 segundos.
     */
    mostrarZonas=function(ev) {
        clearTimeout(temporizadorZonas);

        if(ev.target==ui.obtenerCuerpo()) return;

        temporizadorZonas=setTimeout(function() {
            removerZonas();

            //Buscar el elemento del componente (ev.target puede ser cualquier hijo)
            var elem=ev.target;
            if(!ev.target.es({clase:"componente"})) elem=elem.padre({clase:"componente"});
            if(!elem) return;

            var posicion=elem.posicionAbsoluta(),
                ancho=elem.ancho(),
                alto=elem.alto(),
                doc=ui.obtenerDocumento(),
                zona1=doc.crear("<div class='foxtrot-zona foxtrot-zona-anterior foxtrot-zona-1'>"),
                zona2=doc.crear("<div class='foxtrot-zona foxtrot-zona-anterior foxtrot-zona-2'>"),
                zona3=doc.crear("<div class='foxtrot-zona foxtrot-zona-siguiente foxtrot-zona-3'>"),
                zona4=doc.crear("<div class='foxtrot-zona foxtrot-zona-siguiente foxtrot-zona-4'>");

            zona1.metadato("destino",elem)
                .anexarA(doc.body);

            zona2.metadato("destino",elem)
                .anexarA(doc.body);

            zona3.metadato("destino",elem)
                .anexarA(doc.body);

            zona4.metadato("destino",elem)
                .anexarA(doc.body);

            var anchoZona=14;

            zona1.estilos({
                left:posicion.x,
                top:posicion.y-anchoZona,
                width:ancho,
                height:anchoZona
            });

            zona2.estilos({
                left:posicion.x-anchoZona,
                top:posicion.y,
                width:anchoZona,
                height:alto
            });

            zona3.estilos({
                left:posicion.x,
                top:posicion.y+alto,
                width:ancho,
                height:anchoZona
            });

            zona4.estilos({
                left:posicion.x+ancho,
                top:posicion.y,
                width:anchoZona,
                height:alto
            });

            var params={
                drop:componenteSoltado,
                dragenter:function(ev) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    clearTimeout(temporizadorZonas);
                }
            };

            zona1.crearDestino(params);
            zona2.crearDestino(params);
            zona3.crearDestino(params);
            zona4.crearDestino(params);

            //Agregar zona antes/despues del padre
            var padre=elem.parentNode;
            if(padre!=ui.obtenerCuerpo()&&padre.nodeName!="BODY") {
                var posicion=padre.posicionAbsoluta(),
                    ancho=padre.ancho(),
                    alto=padre.alto(),
                    zona5=doc.crear("<div class='foxtrot-zona foxtrot-zona-anterior foxtrot-zona-5'>"),
                    zona6=doc.crear("<div class='foxtrot-zona foxtrot-zona-siguiente foxtrot-zona-6'>");

                zona5.metadato("destino",padre)
                    .anexarA(doc.body);

                zona6.metadato("destino",padre)
                    .anexarA(doc.body);

                anchoZona+=10;
                    
                zona5.estilos({
                    left:posicion.x,
                    top:posicion.y-anchoZona,
                    width:ancho,
                    height:anchoZona
                });

                zona6.estilos({
                    left:posicion.x,
                    top:posicion.y+alto,
                    width:ancho,
                    height:anchoZona
                });

                var params={
                    drop:componenteSoltado,
                    dragenter:function(ev) {
                        ev.stopPropagation();
                        ev.preventDefault();
                        clearTimeout(temporizadorZonas);
                    }
                };

                zona5.crearDestino(params);
                zona6.crearDestino(params);     
                            
                //Agregar clase a la ascendencia
                while(padre&&padre!=ui.obtenerCuerpo()&&padre.nodeName!="BODY") {
                    padre.agregarClase("foxtrot-arrastrable-arrastrando-sobre-hijo");
                    padre=padre.parentNode;
                }
            }
        },700);
    },
    /**
     * Remueve las zonas de soltado alrededor del componente.
     */
    removerZonas=function() {
        clearTimeout(temporizadorZonas);
        var doc=ui.obtenerDocumento();
        doc.querySelectorAll(".foxtrot-zona").remover();
        doc.querySelectorAll(".foxtrot-arrastrable-arrastrando-sobre-hijo").removerClase("foxtrot-arrastrable-arrastrando-sobre-hijo");
    };

    this.prepararComponenteInsertado=function(obj,actualizar) {
        var elem=obj.obtenerElemento(),
            cont=obj.obtenerContenedor(),
            nombre=obj.componente,
            id=obj.obtenerId(),
            arrastrable=obj.esArrastrable(),
            padre=obj.obtenerPadre();
       
        obj.insertado();
        obj.editor();

        //Creamos el destino en todos los elementos (no solo los contenedores) para poder mostrar las zonas de
        //soltado alrededor del componente (componenteSoltado validará si puede recibir hijos.)
        if(cont) {
            elem.crearDestino({
                drop:componenteSoltado,
                dragenter:function(ev) {
                    //Detener la propagación permitirá destinos anidados
                    ev.stopPropagation();
                    ev.preventDefault();
                    mostrarZonas(ev);
                },
                dragover:function(ev) {
                    //Detener la propagación permitirá destinos anidados
                    ev.stopPropagation();
                    ev.preventDefault();
                },
                dragleave:function(ev) {
                    //Detener la propagación permitirá destinos anidados
                    ev.stopPropagation();
                    ev.preventDefault();
                }
            });
        }
        
        if(arrastrable) {
            elem.arrastrable({
                icono:iconosComponentes[nombre], //Al arrastrar, que presente el ícono del tipo de componente
                datos:JSON.stringify({
                    idComponente:id
                }),
                dragend:function() {
                    removerZonas();
                }
            });
        }

        //Actualizar destino
        if(typeof actualizar!=="undefined"&&actualizar&&padre) padre.actualizar();

        return this;
    };

    /**
     * Asigna los eventos y prepara todos los componentes existentes (putil luego de reemplazar todo el html de la vista).
     */
    function prepararComponentesInsertados() {
        var vista=self.vistaArchivoAbierto,
            componentes=ui.obtenerInstanciasComponentes(vista);
        componentes.forEach(function(comp) {
            if(comp.editando()) return;
            editor.prepararComponenteInsertado(comp);
        });
    }

    /**
     * Crea e inserta un componente.
     * @param {Element|Node} destino - Elemento de destino.
     * @param {string} nombre - Nombre del tipo de componente a crear.
     * @param {string} [ubicacion="dentro"] - Ubicación donde insertar el componente: "dentro", "antes" o "despues".
     */
    this.insertarComponente=function(destino,nombre,ubicacion) {
        if(typeof ubicacion==="undefined") ubicacion="dentro";

        var obj=ui.crearComponente(nombre),
            elem=obj.obtenerElemento();

        if(ubicacion=="dentro") {
            destino.anexar(elem);
        } else if(ubicacion=="antes") {
            destino.insertarAntes(elem);
        } else if(ubicacion=="despues") {
            destino.insertarDespues(elem);            
        }

        this.prepararComponenteInsertado(obj,true);
        
        cambiosSinGuardar=true;

        return obj;
    };

    /**
     * Selecciona el componente, o lo deselecciona si ya se encuentra seleccionado.
     * @param {(Componente|Node|Element)} obj - Objeto a seleccionar.
     * @param {(MouseEvent|boolean|undefined)} ev - Evento o `true` si el evento ya fue procesado.
     * @returns {editor}
     */
    this.alternarSeleccion=function(obj,ev) {
        var comp=obj,
            elem;
        if(!util.esComponente(obj)) comp=ui.obtenerInstanciaComponente(obj);

        //Seleccionar ascendencia con Ctrl
        if(typeof ev==="object"&&ev.ctrlKey) {
            //Cada vez que se ejecuta, seleccionar un nivel más arriba en la ascendencia
            //Buscar el primer componente seleccionado en el árbol (hacia arriba)
            var padre=comp;
            while(!padre.obtenerElemento().es({clase:"foxtrot-seleccionado"})) {
                padre=padre.obtenerPadre();
                if(!padre) break;
            }
            if(!padre) {
                //Llegamos hasta el comienzo del árbol sin ninguna selección, seleccionar el padre del componente clickeado
                padre=comp.obtenerPadre();
            } else {
                //Seleccionar el padre del actualmente seleccionado
                padre=padre.obtenerPadre();
            }
            if(padre) comp=padre;
        }
        if(typeof ev==="undefined"||typeof ev!=="boolean"&&!ev.shiftKey) {
            self.limpiarSeleccion();
        }
        
        var elem=comp.obtenerElemento();
        
        if(elem.es({clase:"foxtrot-seleccionado"})) {
            this.removerSeleccion(elem);
        } else {
            this.establecerSeleccion(elem);
        }

        return this;
    };
    
    /**
     * Selecciona el componente.
     * @param {(Componente|Node|Element)} obj - Objeto a seleccionar.
     * @returns {editor}
     */
    this.establecerSeleccion=function(obj) {
        var elem,comp;
        
        if(util.esComponente(obj)) {
            comp=obj;
            elem=comp.obtenerElemento();
        } else {
            comp=ui.obtenerInstanciaComponente(obj);
            elem=obj;
        }

        elem.agregarClase("foxtrot-seleccionado");

        //Evento
        comp.seleccionado(true);

        //Agregar clase a toda la ascendencia
        var padre=comp;
        while(1) {
            padre=padre.obtenerPadre();
            if(!padre) break;
            padre.obtenerElemento().agregarClase("foxtrot-hijo-seleccionado");
        }

        this.componentesSeleccionados.push(comp);
        
        if(!this.esCuerpo(elem)&&!elem.hijos({clase:"foxtrot-etiqueta-componente"}).length) {
            var config=ui.obtenerComponentes()[comp.componente].config;
            document.crear("<span contenteditable='false' class='foxtrot-etiqueta-componente'><img src='"+this.urlBase+"recursos/componentes/iconos/"+config.icono+"'></span>")
                .atributo("title",config.etiqueta)
                .anexarA(elem);
        }

        this.construirPropiedades();

        //Activar portapapeles
        document.querySelectorAll("#foxtrot-btn-pegar").propiedad("disabled",false);
        if(this.componentesSeleccionados.length>1||!this.esCuerpo(this.componentesSeleccionados[0].obtenerElemento()))
            document.querySelectorAll("#foxtrot-btn-copiar,#foxtrot-btn-cortar").propiedad("disabled",false);

        return this;
    };

    this.esCuerpo=function(obj) {
        var c=ui.obtenerCuerpo();
        return obj==c||(ui.esComponente(obj)&&obj.obtenerElemento()==c);
    };

    /**
     * Deselecciona el componente.
     * @param {(Componente|Node|Element)} obj - Objeto a seleccionar.
     * @returns {editor}
     */
    this.removerSeleccion=function(obj) {
        var elem,comp;
        
        if(util.esComponente(obj)) {
            comp=obj;
            elem=comp.obtenerElemento();
        } else {
            comp=ui.obtenerInstanciaComponente(obj);
            elem=obj;
        }

        if(!elem.es({clase:"foxtrot-seleccionado"})) return this;

        //Evento
        comp.seleccionado(false);

        //Remover estilos
        elem.removerClase("foxtrot-seleccionado");

        //Reconstruir clase .hijo-seleccionado
        var cuerpo=ui.obtenerCuerpo();
        cuerpo.querySelectorAll(".foxtrot-hijo-seleccionado").removerClase("foxtrot-hijo-seleccionado");
        cuerpo.querySelectorAll(".foxtrot-seleccionado").forEach(function(sel) {
            var padre=ui.obtenerInstanciaComponente(sel);
            if(!padre) return;
            while(1) {
                padre=padre.obtenerPadre();
                if(!padre) break;
                padre.obtenerElemento().agregarClase("foxtrot-hijo-seleccionado");
            }
        });

        //Remover de componentesSeleccionados
        for(var i=0;i<this.componentesSeleccionados.length;i++) {
            if(this.componentesSeleccionados[i]==comp) {
                delete this.componentesSeleccionados[i];
                break;
            }
        }

        this.construirPropiedades();

        //Desactivar portapapeles si no quedan elementos seleccionados
        if(this.componentesSeleccionados.length==0) document.querySelectorAll("#foxtrot-btn-copiar,#foxtrot-btn-cortar,#foxtrot-btn-pegar").propiedad("disabled",true);

        return this;
    };

    /**
     * Deselecciona todo.
     * @returns {editor}
     */
    this.limpiarSeleccion=function() {
        //Evento
        this.componentesSeleccionados.forEach(function(comp) {
            comp.seleccionado(false);
        });
        
        removerZonas();
        ui.obtenerCuerpo().removerClase("foxtrot-seleccionado");
        ui.obtenerCuerpo().querySelectorAll(".foxtrot-seleccionado").removerClase("foxtrot-seleccionado");
        ui.obtenerCuerpo().querySelectorAll(".foxtrot-hijo-seleccionado").removerClase("foxtrot-hijo-seleccionado");
        this.componentesSeleccionados=[];
        this.construirPropiedades();        

        //Desactivar portapapeles
        document.querySelectorAll("#foxtrot-btn-copiar,#foxtrot-btn-cortar,#foxtrot-btn-pegar").propiedad("disabled",true);

        return this;
    };

    ////Portapapeles

    /**
     * Copia la selección al portapapeles.
     * @returns {editor}
     */
    this.copiar=function() {
        if(!this.componentesSeleccionados.length) return this;

        var datos={
            "editor-foxtrot-7":true,
            componentes:[],
            html:"",
            css:[]
        },
        agregarComponente=function(comp) {
            var obj=ui.obtenerJsonComponente(comp);
            if(obj) datos.componentes.push(obj);
            
            //Agregar estilos
            var sel=comp.obtenerSelector();
            if(sel) {
                ui.obtenerEstilos(sel).forEach(function(estilo) {
                    if(estilo.hasOwnProperty("tamano")) {
                        estilo.reglas.forEach(function(regla) {
                            datos.css.push({
                                tamano:estilo.tamano,
                                texto:regla.estilos.cssText,
                                selector:regla.selector
                            });                        
                        });
                    } else {
                        datos.css.push({
                            texto:estilo.estilos.cssText,
                            selector:estilo.selector
                        });
                    }
                });
            }
            
            comp.obtenerHijos().forEach(function(hijo) {
                agregarComponente(hijo);
            });            
        };

        this.componentesSeleccionados.forEach(function(comp) {
            //El cuerpo no se copia
            if(self.esCuerpo(comp)) return;

            //Agregar componente y descendencia en forma recursiva
            agregarComponente(comp);

            //Clonar los elementos y remover clases del editor
            var clon=comp.obtenerElemento().clonar();
            self.limpiarElemento(clon);
            datos.html+=clon.outerHTML;
        });
        
        navigator.clipboard.writeText(JSON.stringify(datos));        

        return this;
    };

    /**
     * Copia la selección al portapapeles y elimina los componentes seleccionados.
     * @returns {editor}
     */
    this.cortar=function() {
        if(!this.componentesSeleccionados.length) return this;
        this.copiar();
        this.eliminarComponentes(this.componentesSeleccionados);
        this.limpiarSeleccion();
        
        cambiosSinGuardar=true;
        
        return this;
    };

    /**
     * Interpreta el contenido pegado e intenta insertar los componentes dentro de la selección actual.
     * @param {Object} ev - Datos del evento 'paste'.
     * @returns {editor}
     */
    this.pegar=function(ev) {
        if(!this.componentesSeleccionados.length) return this;

        var datos=(ev.clipboardData||window.clipboardData).getData("text");
        
        cambiosSinGuardar=true;
        
        //Intentar convertir a objeto
        try {
            datos=JSON.parse(datos);
        } catch {
            return this;
        }
        if(!datos.hasOwnProperty("editor-foxtrot-7")) return;
        
        ev.preventDefault();
        ev.stopPropagation();

        var fn=function(comp) {
            var elem=comp.obtenerContenedor(),
                nuevoSelector={},
                vista=ui.vista(),
                nombreVista=ui.obtenerNombreVistaPrincipal();    
            nombreVista=nombreVista.replace(/[^a-z0-9]/g,"-");

            var tempElem=document.createElement("template");
            tempElem.innerHTML=datos.html;

            //Para que no se superpongan los nombres nuevos con los viejos (puede pasar si la vista es la misma o tiene el mismo nombre), vamos a reemplazar todos
            //los IDs por valores provisorios
            var prefijo=util.cadenaAzar()+"-";
            tempElem.content.querySelectorAll(".componente").forEach(function(elem) {
                elem.dato("fxid",prefijo+elem.dato("fxid"));
                //El ID del elemento directamente se descarta
                elem.removerAtributo("id");
            });

            //Preparar componentes
            datos.componentes.forEach(function(obj) {
                //Asignar nuevo ID
                var idAnterior=obj.id;
                obj.id=nombreVista+"-"+ui.generarId();

                //Reemplazar en el HTML
                var elem=tempElem.content.querySelector("[data-fxid='"+prefijo+idAnterior+"']");
                elem.dato("fxid",obj.id);

                //Generar un nuevo selector
                var nuevo=ui.generarSelector(obj.componente,obj.nombre);
                if(obj.selector&&obj.selector.substring(0,1)==".") {
                    //Remover clase (si el selector era un ID, ya lo hemos removido)
                    var e=tempElem.content.querySelector(obj.selector);
                    if(e) e.removerClase(obj.selector.substring(1)); 
                }
                nuevoSelector[obj.selector]=nuevo;
                obj.selector=nuevo;
                elem.agregarClase(nuevo.substring(1));
    
                //Modificar nombres repetidos
                if(obj.nombre) {
                    var i=0;
                    while(componentes.hasOwnProperty(obj.nombre+(i>0?"-"+i:""))) i++;
                    if(i>0) obj.nombre+="-"+i;
                }
            });
            
            //Agregar HTML
            elem.anexar(tempElem.content);

            //Crear componentes
            datos.componentes.forEach(function(obj) {
                var comp=ui.crearComponente(obj,vista);
                self.prepararComponenteInsertado(comp,true);
            });

            //Actualizar destino
            comp.actualizar();

            //Agregar estilos
            datos.css.forEach(function(estilo) {
                var tamano=null;
                if(estilo.hasOwnProperty("tamano")) tamano=estilo.tamano;
                ui.establecerEstilosSelector(nuevoSelector[estilo.selector],estilo.texto,tamano);
            });
        };

        this.componentesSeleccionados.forEach(function(comp) {
            fn(comp);
        });

        prepararComponentesInsertados();
    };

    /**
     * Comando Deshacer.
     * @returns {editor}
     */
    this.deshacer=function() {
        //Si se está editando texto, pasar el evento al navegador
        if(editandoTexto>0) {
            ui.obtenerDocumento().execCommand("undo");
            return this;
        }
        
        return this;
    };

    /**
     * Comando Rehacer.
     * @returns {editor}
     */
    this.rehacer=function() {
        //Si se está editando texto, pasar el evento al navegador
        if(editandoTexto>0) {
            ui.obtenerDocumento().execCommand("redo");
            return this;
        }
        
        return this;
    };

    ////Gestión de la vista

    this.obtenerTamano=function() {
        return tamanoActual;
    };

    this.tamanoMarco=function(t) {
        var ancho={
            "g":"100%",
            "xl":"100%",
            "lg":1000,
            "md":780,
            "sm":580,
            "xs":500
        }[t];
        ui.obtenerMarco().estilo("maxWidth",ancho);
        tamanoActual=t;
        this.construirPropiedades();
    };

    ////Cargar/guardar

    /**
     * Guarda la vista actual (actualmente en modo de pruebas, guarda a /salida/salida.html).
     */
    this.guardar=function(cbk) {
        var apl=this.aplicacionArchivoAbierto,
            vista=this.vistaArchivoAbierto,
            modo=this.modoArchivoAbierto,
            cliente=this.clienteArchivoAbierto,
            previsualizar=false;
        if(util.esIndefinido(cbk)) cbk=null;
        
        document.body.agregarClase("foxtrot-trabajando");

        //Aguardar la transición CSS (no es necesario que sea exacto, es solo un efecto visual)
        var t=this;
        setTimeout(function() {
            //Desactivar el editor para que al obtener el HTML no tenga los elementos y las propiedades de la estructura del editor
            t.desactivar();

            //Cuando la vista es embebible, solo necesitamos el HTML del cuerpo de la vista (obtenerHtml(false))
            var html=ui.obtenerHtml(modo!="embebible");

            new ajax({
                url:t.urlBase+"../gestor/operaciones/guardar.php",
                parametros:{
                    previsualizar:previsualizar?"1":"0",
                    aplicacion:apl,
                    vista:vista,
                    modo:modo,
                    cliente:cliente,
                    html:html,
                    css:ui.obtenerCss(),
                    json:ui.obtenerJson()
                },
                listo:function(resp) {
                    if(!resp) {
                        alert("No fue posible guardar la vista.");
                    } else {
                        if(cbk) cbk.call(self,resp);
                    }

                    //Volver a activar el editor
                    self.activar();

                    cambiosSinGuardar=false;
                }
            });
        },200);

        return this;
    };

    /**
     * Abre una vista (actualmente en modo de pruebas, abre /salida/salida.html).
     */
    this.abrir=function(opciones) {
        //Valores predeterminados
        opciones=Object.assign({
            aplicacion:null,
            vista:null,
            moodo:"independiente",
            cliente:"web",
            cbk:null
        },opciones);

        document.title=opciones.vista+" - "+document.title;
        
        this.aplicacionArchivoAbierto=opciones.aplicacion;
        this.vistaArchivoAbierto=opciones.vista;
        this.modoArchivoAbierto=opciones.modo;
        this.clienteArchivoAbierto=opciones.cliente;
        
        document.body.agregarClase("foxtrot-trabajando");

        new ajax({
            url:this.urlBase+"../gestor/operaciones/abrir.php",
            parametros:{
                aplicacion:opciones.aplicacion,
                vista:opciones.vista,
                modo:opciones.modo,
                cliente:opciones.cliente
            },
            listo:function(resp) {
                if(!resp) {
                    alert("No fue posible abrir la vista.");
                } else {
                    if(opciones.cbk) {
                        opciones.cbk.call(self,resp);
                    } else {
                        ui.limpiar();
                        ui.obtenerMarco().atributo("src",resp.url);                     
                    }
                    //Si acabamos de crear une vista nueva, refrescar el gestor
                    if(window.opener&&window.opener.gestor) window.opener.gestor.actualizar();
                }
            }
        });

        return this;
    };

    this.previsualizar=function() {
        //this.guardar(true,function(resp) {
        //    window.open(resp.url,"previsualizacion");
        //});

        return this;
    };

    /**
     * Cambia el tipo de vista que se está editando.
     * @param {string} modo 
     */
    this.establecerModo=function(modo) {
        this.modoArchivoAbierto=modo;
        return this;
    };

    ////Gestión del editor

    this.alternarBordes=function() {
        bordesVisibles=!bordesVisibles;
        var b=ui.obtenerDocumento().body,
            btn=document.querySelector("#foxtrot-btn-alternar-bordes");
        if(bordesVisibles) {
            b.agregarClase("foxtrot-bordes");
            btn.agregarClase("activo");
        } else {
            b.removerClase("foxtrot-bordes");
            btn.removerClase("activo");
        }
        return this;
    };

    this.alternarInvisibles=function() {
        invisiblesVisibles=!invisiblesVisibles;
        var b=ui.obtenerDocumento().body,
            btn=document.querySelector("#foxtrot-btn-alternar-invisibles");
        if(!invisiblesVisibles) {
            b.removerClase("foxtrot-mostrar-invisibles");
            btn.agregarClase("activo");
        } else {
            b.agregarClase("foxtrot-mostrar-invisibles");
            btn.removerClase("activo");
        }
        return this;
    };

    this.alternarMovil=function() {
        claseMovil=!claseMovil;
        var b=ui.obtenerDocumento().body,
            btn=document.querySelector("#foxtrot-btn-alternar-movil");
        if(!claseMovil) {
            b.removerClase("movil")
                .agregarClase("escritorio");
            btn.removerClase("activo");
        } else {
            b.removerClase("escritorio")
                .agregarClase("movil");
            btn.agregarClase("activo");
        }
        return this;
    };

    this.pausarEventos=function(valor) {
        if(util.esIndefinido(valor)) valor=true;
        eventosPausados=valor;
        return this;
    };

    /**
     * Inicia la detección de nodos insertados, para intentar determinar si se insertan nodos basura, por ejemplo agregados por un plugin del
     * navegador (Adblock, etc.) que tenemos que remover al guardar.
     * @param {Document} doc
     */
    this.detectarNodosInsertados=function(doc) {
        var obs=new MutationObserver(function(mutaciones) {
            mutaciones.forEach(function(mutacion) {
                if(typeof mutacion.addedNodes!=="undefined") {
                    mutacion.addedNodes.forEach(function(nodo) {
                        //En ninguna parte del editor se inserta un tag <style> (los estilos se trabajan directamente sobre la hoja de estilos enlazada),
                        //por lo tanto podemos descartar los tags <style> insertados. Esto interceptará (al menos) el bloqueador de publicidad de Opera.
                        //TODO Probar otros plugins populares como Adblock
                        if(nodo.nodeName=="STYLE") nodo.remover();
                    });
                }
            });
        });
        obs.observe(doc,{childList:true,subtree:true});
    };

    /**
     * Activa el editor y construye su interfaz (fuera del marco).
     */
    this.activar=function(opciones) {
        if(ui.enModoEdicion()) {
            this.ejecutar();
            //Cuando se está reactivando (segunda vez que se llama a activar()), no es necesario volver a construir toda la interfaz
            return this;
        }
        
        if(typeof opciones!=="undefined") {
            //Valores predeterminados
            opciones=Object.assign({
                urlBase:""
            },opciones);
            
            this.urlBase=opciones.urlBase;
        }

        ui.establecerModoEdicion();

        contruirBarrasHerramientas();
        prepararArrastrarYSoltar();

        return this;
    };

    /**
     * Remueve del elemento y sus descendencias todos los elementos y atributos del editor.
     * @param {*} elem - Elemento a limpiar.
     * @returns {editor}
     */
    this.limpiarElemento=function(elem) {
        var fn=function(elem) {
            //Desactivar arrastrables
            elem.removerArrastre()
                .removerDestino()
            //Remover clases y otras propiedades
                .removerClase("foxtrot-seleccionado foxtrot-hijo-seleccionado foxtrot-editor-ignorar foxtrot-editando-texto \
                    foxtrot-arrastrable-destino foxtrot-arrastrable-arrastrable foxtrot-arrastrable-arrastrando foxtrot-modo-edicion \
                    foxtrot-bordes foxtrot-mostrar-invisibles foxtrot-arrastrable-arrastrando-sobre foxtrot-arrastrable-arrastrando-sobre-hijo \
                    movil escritorio")
            //Remover atributos y propiedades innecesarias
                .removerAtributo("contentEditable")
                .removerAtributo("draggable");

            //Remover atributos y propiedades vacias
            var c=elem.atributo("class");
            if(!c||c.trim()=="") elem.removerAtributo("class");            
        };

        //Remover auxiliares
        elem.querySelectorAll(".foxtrot-etiqueta-componente,.foxtrot-editor-temporal,.foxtrot-menu-editor").remover();

        //Ejecutar el resto de la limpieza sobre el elemento en sí y sobre su descendencia
        if(elem!=ui.obtenerDocumento()&&elem!=document) fn(elem);
        elem.querySelectorAll("*").forEach(function(elem) {
            fn(elem);
        });

        return this;
    };

    /**
     * Desactiva el editor (solo afecta el marco).
     * @returns {editor}
     */
    this.desactivar=function() {
        var doc=ui.obtenerDocumento();

        this.limpiarSeleccion();
        
        this.limpiarElemento(doc);

        //Remover clases y otras propiedades
        doc.body.removerClase("foxtrot-modo-edicion foxtrot-bordes foxtrot-mostrar-invisibles");
        
        //Remover hoja de estilos del editor

        var remover=[];
        doc.styleSheets.porCada(function(i,hoja) {
            if(/\/gestor\/gestor\.css$/.test(hoja.href)) remover.push(hoja.ownerNode);
        });
        //Remover en un segundo bucle ya que remover las hojas hace mutar a styleSheets
        remover.forEach(function(elem) {
            elem.remover();
        });
        
        //Notificar a los componentes que el editor ha sido desactivado mediante el evento `editorDesactivado`
        ui.eventoComponentes(null,"editorDesactivado");

        return this;
    };

    /**
     * Ejecuta el editor una vez que la UI haya cargado la página a editar.
     */
    this.ejecutar=function() {
        var doc=ui.obtenerDocumento();

        //Inicializar la instancia de la vista principal
        ui.obtenerInstanciaVistaPrincipal()
            .establecerElemento(ui.obtenerCuerpo())
            .inicializar();

        this.detectarNodosInsertados(doc);
        
        //Establecer _urlBase para poder ejecutar las vistas Cordova dentro del marco
        localStorage.setItem("_urlBase",this.urlBase);
        
        doc.body.agregarClase("foxtrot-modo-edicion");
        doc.head.anexar("<link rel='stylesheet' href='"+this.urlBase+"../gestor/gestor.css'>");

        prepararComponentesInsertados();

        establecerEventos();

        if(bordesVisibles) doc.body.agregarClase("foxtrot-bordes");
        if(invisiblesVisibles) doc.body.agregarClase("foxtrot-mostrar-invisibles");

        this.listo=true;

        document.body.removerClase("foxtrot-trabajando");
        
        //Notificar a los componentes que el editor ha sido activado mediante el evento `editor`
        ui.eventoComponentes(null,"editor");
        
        return this;
    };

    /**
     * Recibe notificaciones sobre el editor de texto desde `editable`.
     * @param {boolean} estado - Estado (activado o desactivado).
     * @returns {editor}
     */
    this.editandoTexto=function(estado) {
        if(typeof estado=="undefined") estado=true;
        editandoTexto+=estado?1:-1;
        cambiosSinGuardar=true;
        return this;
    };
}();

window["editor"]=editor;
