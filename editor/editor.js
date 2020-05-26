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
        tamanoActual="g";

    this.listo=false;
    this.rutaArchivoAbierto=null;

    this.componenteSeleccionado=null;

    ////Elementos del dom
    
    var barraComponentes=document.querySelector("#foxtrot-barra-componentes"),
        cuerpoBarraComponentes=barraComponentes.querySelector(".foxtrot-contenidos-barra-herramientas"),
        barraPropiedades=document.querySelector("#foxtrot-barra-propiedades"),
        cuerpoBarraPropiedades=barraPropiedades.querySelector(".foxtrot-contenidos-barra-herramientas");

    ////Construcción de la interfaz

    function configurarBarrasHerramientas() {
        barraComponentes.arrastrable({
            asa:barraComponentes.querySelector(".foxtrot-asa-arrastre"),
            mover:true
        });
        barraPropiedades.arrastrable({
            asa:barraPropiedades.querySelector(".foxtrot-asa-arrastre"),
            mover:true
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
                    .atributo("src","iconos/"+comp.config.icono)
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
        if(!self.componenteSeleccionado) {
            barraPropiedades.agregarClase("foxtrot-barra-propiedades-vacia");
            cuerpoBarraPropiedades.html("Ningún componente seleccionado");
            return;
        }
        
        barraPropiedades.removerClase("foxtrot-barra-propiedades-vacia");
        cuerpoBarraPropiedades.html("");

        var agregarPropiedad=function(barra,nombre,prop) {
            var fila=document.crear("<div class='foxtrot-propiedad'>"),
                label=document.crear("<label>").html(prop.etiqueta).anexarA(fila);

            var tipo=prop.hasOwnProperty("tipo")?prop.tipo:"texto",
                fn=prop.hasOwnProperty("funcion")?prop.funcion:null,
                placeholder=prop.hasOwnProperty("placeholder")?prop.placeholder:null,
                ayuda=prop.hasOwnProperty("ayuda")?prop.ayuda:null,
                timeout=0,
                componente=editor.componenteSeleccionado;

            if(ayuda) {
                document.crear("<img src='img/ayuda.png'>")
                    .atributo("title",ayuda)
                    .anexarA(label);
            }

            if(tipo=="?") {
                //TODO
            } else {
                //Campo de texto como predeterminado
                
                var campo=document.crear("<input type='text' class='form-control'>").valor(prop.valor);
                if(placeholder) campo.atributo("placeholder",placeholder);
                fila.anexar(campo);

                campo.evento("input",function(ev) {
                    var t=this;
                    clearTimeout(timeout);
                    timeout=setTimeout(function() {
                        if(fn) fn.call(editor,componente,tamanoActual,nombre,t.valor());
                    },200);
                }).evento("blur",function(ev) {
                    if(fn) fn.call(editor,componente,tamanoActual,nombre,this.valor());
                });
            }

            fila.anexarA(barra);
        };

        var propiedades=editor.componenteSeleccionado.obtenerListadoPropiedades(tamanoActual);

        //Propiedades especiales
        propiedades[-1]={
            nombre: {
                etiqueta:"Nombre",
                funcion:function(componentes,t,prop,valor) {
                    componentes.establecerNombre(valor);
                },
                //TODO Selección múltiple: No mostrar los valores
                valor:editor.componenteSeleccionado.nombre
            }
        };

        //Ordenar por propiedad del objeto propiedades
        var claves=Object.keys(propiedades).sort();

        claves.forEach(function(grupo) {
            var props=propiedades[grupo];
            if(props.vacio()) return;

            var barra=document.crear("<div class='foxtrot-grupo-herramientas'>");

            if(grupo==-1) {
                document.crear("<label>").html(
                        ui.obtenerConfigComponente(editor.componenteSeleccionado.componente).nombre
                    ).anexarA(barra);
            } else if(grupo!=0) {
                document.crear("<label>").html(grupo).anexarA(barra);
            }

            barra.anexarA(cuerpoBarraPropiedades);

            var orden=Object.keys(props).sort();
            orden.forEach(function(nombre) {
                var prop=props[nombre];
                agregarPropiedad(barra,nombre,prop);
            });
        });

        //TODO Selección múltiple: Solo mostrar propiedades comunes a todos los elementos seleccionados
    }

    ////Eventos

    function stopPropagation(e) {
        //Detener la propagación permitirá destinos anidados
        e.stopPropagation();
        e.preventDefault();
    }

    function componenteSoltado(e) {
        e.preventDefault();
        //Detener la propagación permitirá destinos anidados
        e.stopPropagation();

        var datos=e.dataTransfer.getData("text/plain");
        try {
            datos=JSON.parse(datos);
        } catch {
            return;
        }

        if(!datos) return;

        if(datos.hasOwnProperty("componente")) {
            var obj=self.insertarComponente(this,datos.componente);
            self.establecerSeleccion(obj);
            return;
        }

        if(datos.hasOwnProperty("idcomponente")) {
            self.moverComponente(this,datos.idcomponente);
            return;
        }
    }    

    function prepararArrastrarYSoltar() {
        var componentes=cuerpoBarraComponentes.querySelectorAll("button");
        for(var i=0;i<componentes.length;i++) {
            var comp=componentes[i];
            comp.arrastrable({
                icono:iconosComponentes[comp.metadato("componente")],
                datos:JSON.stringify({
                    componente:comp.metadato("componente")
                })
            });
        }

        /*
        Ahora que la vista es un componente, los demás componentes deben soltarse dentro de la misma, en lugar de en el cuerpo de la página.
        ui.obtenerCuerpo().crearDestino({
            drop:componenteSoltado,
            dragenter:stopPropagation,
            dragover:stopPropagation,
            dragleave:stopPropagation
        });*/
    }    

    function establecerEventos() {
        ui.obtenerDocumento().eventoFiltrado("click",{
            clase:"componente"
        },function(ev) {
            ev.stopPropagation();

            //TODO Mostrar el menú contextual con click derecho
            //TODO Selección de componentes anidados

            //TODO Selección múltiple

            self.establecerSeleccion(this);
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
                editor.establecerSeleccion(ui.obtenerInstanciaControladorPrincipal().obtenerComponente());
            } else if(ev.which==46) {
                //DEL
                ev.preventDefault();
                if(self.componenteSeleccionado) self.eliminarComponente(self.componenteSeleccionado.obtenerId());                
            }
        });
    }    

    ////Gestión de componentes

    this.eliminarComponente=function(id) {
        var obj=ui.obtenerInstanciaComponente(id);
        obj.eliminar();
        this.limpiarSeleccion();
        return this;
    };

    this.moverComponente=function(destino,id) {
        var obj=ui.obtenerInstanciaComponente(id);
        if(!obj||destino===obj.elemento) return this;
        destino.anexar(obj.elemento);

        return this;
    };

    this.prepararComponenteInsertado=function(obj) {        
        var elem=obj.obtenerElemento(),
            nombre=obj.componente,
            id=obj.obtenerId(),
            conte=obj.obtenerContenedor(),
            arrastrable=obj.esArrastrable();

        if(conte) {
            conte.crearDestino({
                drop:componenteSoltado,
                dragenter:stopPropagation,
                dragover:stopPropagation,
                dragleave:stopPropagation
            });
        }
        
        if(arrastrable) {
            elem.arrastrable({
                icono:iconosComponentes[nombre], //Al arrastrar, que presente el ícono del tipo de componente
                datos:JSON.stringify({
                    idcomponente:id
                })
            });
        }

        return this;
    };

    /**
     * Asigna los eventos y prepara todos los componentes existentes (putil luego de reemplazar todo el html de la vista).
     */
    function prepararComponentesInsertados() {
        ui.obtenerInstanciasComponentes().forEach(function(comp) {
            editor.prepararComponenteInsertado(comp);
        });
    }

    this.insertarComponente=function(destino,nombre) {
        var obj=ui.crearComponente(nombre),
            elem=obj.obtenerElemento();

        destino.anexar(elem);
        
        obj.inicializar();

        this.prepararComponenteInsertado(obj);

        return obj;
    };

    this.establecerSeleccion=function(obj) {
        var elem,comp;

        //TODO Selección múltiple

        this.limpiarSeleccion();
        
        if(obj instanceof componente.cttr()) {
            comp=obj;
            elem=comp.obtenerElemento();
        } else {
            comp=ui.obtenerInstanciaComponente(obj);
            elem=obj;
        }

        elem.agregarClase("seleccionado");
        this.componenteSeleccionado=comp;

        construirPropiedades();

        return this;
    };

    this.limpiarSeleccion=function() {
        ui.obtenerCuerpo().querySelectorAll(".componente").removerClase("seleccionado");
        this.componenteSeleccionado=null;
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
            .removerClase(/^foxtrot-arrastrable-.+/)
            .propiedad("contentEditable",null);
        return temp.innerHTML;
    };

    /**
     * Guarda la vista actual (actualmente en modo de pruebas, guarda a /salida/salida.html).
     */
    this.guardar=function(cbk) {
        var ruta=this.rutaArchivoAbierto,
            modo=this.modoArchivoAbierto,
            cordova=this.archivoCordova,
            previsualizar=false;
        if(util.esIndefinido(cbk)) cbk=null;
        
        document.body.agregarClase("trabajando");

        new ajax({
            url:"guardar.php",
            parametros:{
                previsualizar:previsualizar?"1":"0",
                ruta:ruta,
                modo:modo,
                cordova:cordova?"1":"0",
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
            cordova:false,
            cbk:null
        },opciones);
        
        this.rutaArchivoAbierto=opciones.ruta;
        this.modoArchivoAbierto=opciones.modo;
        this.archivoCordova=opciones.cordova;
        
        document.body.agregarClase("trabajando");

        new ajax({
            url:"abrir.php",
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
                        ui.limpiar();
                        ui.reemplazarHtml(resp.html);
                        ui.establecerEstilos(resp.css);
                        ui.establecerJson(resp.json);

                        if(typeof resp.json==="string") resp.json=JSON.parse(resp.json);

                        ui.cargarJs("../"+opciones.ruta+".js",function() {
                            var obj=ui.crearControlador(resp.json.vista.nombre,resp.json.vista.propiedades);
                            editor.prepararComponenteInsertado(obj.obtenerComponente());
                        });

                        ui.ejecutar();
                        prepararComponentesInsertados();
                    }
                }
                document.body.removerClase("trabajando");
            }
        });

        return this;
    };

    this.previsualizar=function() {
        this.guardar(true,function(resp) {
            window.open(resp.url,"previsualizacion");
        });

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
