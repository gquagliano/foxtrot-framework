/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Editor de vistas.
 */
var editor=new function() {
    "use strict";

    ////Configuración

    var claseBotonesBarrasHerramientas="btn btn-sm";

    ////Almacenes y parámetros

    var self=this,
        iconosComponentes={},
        eventosPausados=false,
        bordesVisibles=false,
        invisiblesVisibles=true,
        tamanoActual="g";

    this.listo=false;
    this.rutaArchivoAbierto=null;
    this.modoArchivoAbierto=null;
    this.clienteArchivoAbierto=null;

    this.componentesSeleccionados=[];

    ////Elementos del dom
    
    var barraComponentes=document.querySelector("#foxtrot-barra-componentes"),
        cuerpoBarraComponentes=barraComponentes.querySelector(".foxtrot-contenidos-barra-herramientas"),
        barraPropiedades=document.querySelector("#foxtrot-barra-propiedades"),
        cuerpoBarraPropiedades=barraPropiedades.querySelector(".foxtrot-contenidos-barra-herramientas");

    ////Construcción de la interfaz

    function configurarBarrasHerramientas() {
        barraComponentes.arrastrable({
            asa:barraComponentes.querySelector(".foxtrot-asa-arrastre"),
            mover:true,
            dragend:function() {
                removerZonas();
            }
        });
        barraPropiedades.arrastrable({
            asa:barraPropiedades.querySelector(".foxtrot-asa-arrastre"),
            mover:true,
            dragend:function() {
                removerZonas();
            }
        });
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
            if(grupo!=0) document.crear("<label>").html(grupo).anexarA(barraGrupo);
            barraGrupo.anexarA(cuerpoBarraComponentes);

            for(var i=0;i<grupos[grupo].length;i++) {
                var comp=grupos[grupo][i];
                if(!comp.config.icono) continue;

                var icono=document.crear("<img>")
                    .atributo("src","../recursos/componentes/iconos/"+comp.config.icono)
                    .atributo("title",comp.config.descripcion);
                iconosComponentes[comp.config.nombre]=icono;

                barraGrupo.anexar(
                    document.crear("<button class='"+claseBotonesBarrasHerramientas+"'>")
                        .anexar(
                            icono.clonar()  //Clonamos el ícono para que no afecte la instancia almacenada en iconosComponentes
                                            //(al arrastrar, toma los estilos que pueda tener al momento de iniciar la operación de arraastre)
                        )
                        .metadato("componente",comp.config.nombre)
                    );
            }
        }

        configurarBarrasHerramientas();
    }  

    function construirPropiedades() {
        if(!self.componentesSeleccionados.length) {
            barraPropiedades.agregarClase("foxtrot-barra-propiedades-vacia");
            cuerpoBarraPropiedades.html("Ningún componente seleccionado");
            return;
        }

        var seleccionMultiple=self.componentesSeleccionados.length>1;
        
        barraPropiedades.removerClase("foxtrot-barra-propiedades-vacia");
        cuerpoBarraPropiedades.html("");

        var agregarPropiedad=function(barra,nombre,prop) {
            var fila=document.crear("<div class='foxtrot-propiedad'>"),
                label=document.crear("<label>").html(prop.etiqueta).anexarA(fila);

            var tipo=prop.hasOwnProperty("tipo")?prop.tipo:"texto",
                fn=prop.hasOwnProperty("funcion")?prop.funcion:null,
                placeholder=prop.hasOwnProperty("placeholder")?prop.placeholder:null,
                ayuda=prop.hasOwnProperty("ayuda")?prop.ayuda:null,
                timeout=0;

            if(ayuda) {
                document.crear("<img src='img/ayuda.png'>")
                    .atributo("title",ayuda)
                    .anexarA(label);
            }

            if(tipo=="bool") {
                //Para las propiedades booleanas utilizaremos un desplegable en lugar de un checkbox
                var campo=document.crear("<select class='custom-select'>");
                fila.anexar(campo);

                campo.anexar("<option value=''></option>");
                campo.anexar("<option value='s'>Si</option>");
                campo.anexar("<option value='n'>No</option>");

                if(!seleccionMultiple&&(prop.valor===true||prop.valor===false)) campo.valor(prop.valor?"s":"n");

                campo.evento("change",function(ev) {
                    var v=this.valor();
                    if(v=="s") v=true;
                    else if(v=="n") v=false;
                    else v=null;
                    if(fn) {
                        self.componentesSeleccionados.forEach(function(componente) {
                            fn.call(editor,componente,tamanoActual,nombre,v);
                        });
                    }
                });
            } else if(tipo=="opciones") {
                var campo=document.crear("<select class='custom-select'>");
                fila.anexar(campo);
                
                //Opción en blanco para revertir al valor predeterminado
                campo.anexar("<option value=''></option>");

                //Costruir opciones
                prop.opciones.forEach(function(clave,etiqueta) {
                    campo.anexar(
                        document.crear("<option>")
                            .valor(clave)
                            .texto(etiqueta)
                    );
                });

                if(!seleccionMultiple) campo.valor(prop.valor);

                campo.evento("change",function(ev) {
                    if(fn)  {
                        var v=this.valor();
                        self.componentesSeleccionados.forEach(function(componente) {
                            fn.call(editor,componente,tamanoActual,nombre,v);
                        });
                    }
                });
            } else {
                //Campo de texto como predeterminado
                
                var campo=document.crear("<input type='text' class='form-control'>");
                if(!seleccionMultiple) campo.valor(prop.valor);
                if(placeholder) campo.atributo("placeholder",placeholder);
                fila.anexar(campo);

                campo.evento("input",function(ev) {
                    var t=this;
                    clearTimeout(timeout);
                    timeout=setTimeout(function() {
                        if(fn) {
                            self.componentesSeleccionados.forEach(function(componente) {
                                fn.call(editor,componente,tamanoActual,nombre,t.valor());
                            });
                        }
                    },200);
                }).evento("blur",function(ev) {
                    if(fn)  {
                        var v=this.valor();
                        self.componentesSeleccionados.forEach(function(componente) {
                            fn.call(editor,componente,tamanoActual,nombre,v);
                        });
                    }
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

                document.crear("<label>").html(grupo).anexarA(barra);

                barra.anexarA(cuerpoBarraPropiedades);

                var orden=Object.keys(props).sort();
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
                propiedadesComponente.forEach(function(grupo,props) {
                    if(!propiedades.hasOwnProperty(grupo)) propiedades[grupo]={};
                    Object.assign(propiedades[grupo],props);
                });
            });

            //Título
            var titulo="";
            tipos.forEach(function(tipo,cantidad) {
                if(titulo!="") titulo+=", ";
                titulo+=tipo;
                if(cantidad>1) titulo+="("+cantidad+")";
            });
            document.crear("<div class='foxtrot-grupo-herramientas'>")
                .anexar(document.crear("<label>").html(titulo))
                .anexarA(cuerpoBarraPropiedades);
        }

        //Ordenar por nombre de propiedad (nombre de grupo)
        var claves=Object.keys(propiedades).sort();

        //Agregar el resto de los grupos en orden
        claves.forEach(function(grupo) {
            if(grupo!=nombreTipoComponente) fn(grupo);            
        });
    }

    ////Eventos

    function stopPropagation(e) {
        //Detener la propagación permitirá destinos anidados
        e.stopPropagation();
        e.preventDefault();
    }

    /**
     * Inserta (crea o mueve) el componente soltado.
     * @param {Object} e - Evento.
     */
    function componenteSoltado(e) {
        e.preventDefault();
        //Detener la propagación permitirá destinos anidados
        e.stopPropagation();

        var destino=this,
            ubicacion="dentro";

        if(e.target.es({clase:"foxtrot-zona"})) {
            ubicacion=this.es({clase:"foxtrot-zona-anterior"})?"antes":"despues";
            destino=this.metadato("destino");
        } else if(!destino.es({clase:"contenedor"})) {
            return;
        }

        var datos=e.dataTransfer.getData("text/plain");
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
        ui.obtenerDocumento().eventoFiltrado("click",{
            clase:"componente"
        },function(ev) {
            ev.preventDefault();
            ev.stopPropagation();

            if(!ev.shiftKey) self.limpiarSeleccion();

            self.establecerSeleccion(this);
        })
        .eventoFiltrado("contextmenu",{
            clase:"componente"
        },function(ev) {
            ev.preventDefault();
            ev.stopPropagation();

            var arbol=[];

            if(!ev.shiftKey) self.limpiarSeleccion();

            //Construir árbol de herencia
            var comp=ui.obtenerInstanciaComponente(this);
            do {
                arbol.push({
                    etiqueta:comp.obtenerConfigComponente().etiqueta,
                    accion:function(comp) {
                        return function() {
                            self.establecerSeleccion(comp);
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
                        x:ev.clientX,
                        y:ev.clientY
                    },
                    "foxtrot-menu-editor"
                );
        })
        .evento("click",function() {
            self.limpiarSeleccion();
        });

        ui.obtenerDocumento().evento("keydown",function(ev) {
            if(eventosPausados) return;

            if(ev.which==27) {
                //ESC
                self.limpiarSeleccion();
                
                //Al deseleccionar todo, mostrar las propiedades de la vista
                editor.establecerSeleccion(ui.obtenerInstanciaVistaPrincipal().obtenerElemento());
            } else if(ev.which==46) {
                //DEL
                ev.preventDefault();

                if(!self.componentesSeleccionados.length) return;

                for(var i=0;i<self.componentesSeleccionados.length;i++)
                    if(self.esCuerpo(self.componentesSeleccionados[i].elemento)) return;

                ui.confirmar("¿Estás seguro de querer eliminar "+(self.componentesSeleccionados.length==1?"el componente":"los componentes")+"?",function(r) {
                    if(r) self.eliminarComponentes(self.componentesSeleccionados);
                });
            }
        }).evento("mouseup",function(ev) {
            removerZonas();
        });
    }    

    ////Gestión de componentes

    this.eliminarComponentes=function(lista) {
        lista.forEach(function(elem) {
            self.eliminarComponente(elem.obtenerId());
        });
        return this;
    };

    this.eliminarComponente=function(id) {
        var obj=ui.obtenerInstanciaComponente(id);
        obj.eliminar();
        this.limpiarSeleccion();
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

        var obj=ui.obtenerInstanciaComponente(id);
        if(!obj||destino===obj.elemento) return this;

        if(ubicacion=="dentro") {
            destino.anexar(obj.elemento);
        } else if(ubicacion=="antes") {
            destino.insertarAntes(obj.elemento);
        } else if(ubicacion=="despues") {
            destino.insertarDespues(obj.elemento);            
        }

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
        },1500);
    },
    /**
     * Remueve las zonas de soltado alrededor del componente.
     */
    removerZonas=function() {
        clearTimeout(temporizadorZonas);
        ui.obtenerDocumento().querySelectorAll(".foxtrot-zona").remover();
    };

    this.prepararComponenteInsertado=function(obj) {        
        var elem=obj.obtenerElemento(),
            nombre=obj.componente,
            id=obj.obtenerId(),
            arrastrable=obj.esArrastrable();

        //Creamos el destino en todos los elementos (no solo los contenedores) para poder mostrar las zonas de
        //soltado alrededor del componente (componenteSoltado validará si puede recibir hijos.)
        elem.crearDestino({
            drop:componenteSoltado,
            dragenter:function(ev) {
                //Detener la propagación permitirá destinos anidados
                ev.stopPropagation();
                ev.preventDefault();
                mostrarZonas(ev);
            },
            dragover:stopPropagation,
            dragleave:stopPropagation
        });
        
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

        return this;
    };

    /**
     * Asigna los eventos y prepara todos los componentes existentes (putil luego de reemplazar todo el html de la vista).
     */
    function prepararComponentesInsertados(vista) {
        var componentes=ui.obtenerInstanciasComponentes(vista);
        componentes.forEach(function(comp) {
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
        
        obj.inicializar();

        this.prepararComponenteInsertado(obj);

        return obj;
    };

    this.establecerSeleccion=function(obj) {
        var elem,comp;
        
        if(util.esComponente(obj)) {
            comp=obj;
            elem=comp.obtenerElemento();
        } else {
            comp=ui.obtenerInstanciaComponente(obj);
            elem=obj;
        }

        elem.agregarClase("seleccionado");

        //Agregar clase a toda la ascendencia
        var padre=comp;
        while(1) {
            padre=padre.obtenerPadre();
            if(!padre) break;
            padre.obtenerElemento().agregarClase("hijo-seleccionado");
        }

        this.componentesSeleccionados.push(comp);
        
        if(!this.esCuerpo(elem)&&ui.obtenerCuerpo().querySelector(".seleccionado>.foxtrot-etiqueta-componente")===null) {
            var config=ui.obtenerComponentes()[comp.componente].config;
            document.crear("<span contenteditable='false' class='foxtrot-etiqueta-componente'><img src='recursos/componentes/iconos/"+config.icono+"'></span>")
                .atributo("title",config.etiqueta)
                .anexarA(elem);
        }

        construirPropiedades();

        return this;
    };

    this.esCuerpo=function(obj) {
        var c=ui.obtenerCuerpo();
        return obj==c||(ui.esComponente(obj)&&obj.obtenerElemento()==c);
    };

    this.limpiarSeleccion=function() {
        ui.obtenerCuerpo().querySelectorAll(".seleccionado").removerClase("seleccionado");
        ui.obtenerCuerpo().querySelectorAll(".hijo-seleccionado").removerClase("hijo-seleccionado");
        this.componentesSeleccionados=[];
        construirPropiedades();
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
        construirPropiedades();
    };

    ////Cargar/guardar

    /**
     * Remueve todas las clases y propiedades del modo de edición del código html dado.
     */
    this.limpiarHtml=function(html) {
        var temp=document.crear("<div>");
        temp.html(html);
        temp.querySelectorAll("*")  
            .removerClase("seleccionado")
            .removerClase("hijo-seleccionado")
            .removerClase(/^foxtrot-arrastrable-.+/)
            .propiedad("contentEditable",null)
            .propiedad("draggable",null);
        temp.querySelectorAll(".foxtrot-etiqueta-componente").remover();
        return temp.innerHTML;
    };

    /**
     * Guarda la vista actual (actualmente en modo de pruebas, guarda a /salida/salida.html).
     */
    this.guardar=function(cbk) {
        var ruta=this.rutaArchivoAbierto,
            modo=this.modoArchivoAbierto,
            cliente=this.clienteArchivoAbierto,
            previsualizar=false;
        if(util.esIndefinido(cbk)) cbk=null;
        
        document.body.agregarClase("trabajando");

        new ajax({
            url:"operaciones/guardar.php",
            parametros:{
                previsualizar:previsualizar?"1":"0",
                ruta:ruta,
                modo:modo,
                cliente:cliente,
                html:ui.obtenerHtml(),
                css:ui.obtenerCss(),
                json:ui.obtenerJson()
            },
            listo:function(resp) {
                if(!resp) {
                    alert("No fue posible guardar la vista.");
                } else {
                    if(cbk) cbk.call(self,resp);
                }
                document.body.removerClase("trabajando");
            }
        });

        return this;
    };

    /**
     * Abre una vista (actualmente en modo de pruebas, abre /salida/salida.html).
     */
    this.abrir=function(opciones) {
        //Valores predeterminados
        opciones=Object.assign({
            ruta:null,
            moodo:"independiente",
            cliente:"web",
            cbk:null
        },opciones);
        
        this.rutaArchivoAbierto=opciones.ruta;
        this.modoArchivoAbierto=opciones.modo;
        this.clienteArchivoAbierto=opciones.cliente;
        
        document.body.agregarClase("trabajando");

        new ajax({
            url:"operaciones/abrir.php",
            parametros:{
                ruta:opciones.ruta
            },
            listo:function(resp) {
                if(!resp) {
                    alert("No fue posible abrir la vista.");
                } else {
                    if(opciones.cbk) {
                        opciones.cbk.call(self,resp);
                    } else {
                        if(typeof resp.json==="string") resp.json=JSON.parse(resp.json);

                        ui.limpiar();

                        var nombre=resp.json.nombre;

                        //Si la vista está en blanco, se debe crear al menos el componente principal
                        if(!resp.json.componentes.length) resp.json.componentes.push({
                            componente:"vista"
                        });

                        ui.reemplazarHtml(resp.html);
                        ui.establecerEstilos(resp.css);
                        ui.establecerJson(resp.json);
                        
                        //ui.cargarJs("../"+opciones.ruta+".js",function() {
                        //});

                        ui.cargarCss(resp.aplicacion.css)
                            .cargarCss(resp.aplicacion.tema);

                        ui.ejecutar();

                        prepararComponentesInsertados(nombre);

                        document.body.removerClase("trabajando");                        
                    }
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
        if(invisiblesVisibles) {
            b.agregarClase("foxtrot-mostrar-invisibles");
            btn.removerClase("activo");
        } else {
            b.removerClase("foxtrot-mostrar-invisibles");
            btn.agregarClase("activo");
        }
        return this;
    };

    this.pausarEventos=function(valor) {
        if(util.esIndefinido(valor)) valor=true;
        eventosPausados=valor;
        return this;
    };

    this.activar=function() {
        ui.establecerModoEdicion(true);
        this.alternarBordes();

        contruirBarrasHerramientas();
        prepararArrastrarYSoltar();
        establecerEventos();

        this.listo=true;
        if(typeof window.editorListo==="function") window.editorListo();

        return this;
    };
}();

window["editor"]=editor;
