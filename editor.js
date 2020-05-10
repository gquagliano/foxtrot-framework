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

    //Configuración
    var claseBotonesBarrasHerramientas="btn btn-sm";

    var self=this,
        iconosComponentes={},
        eventosPausados=false,
        barraPropiedades=document.querySelector("#foxtrot-barra-propiedades"),
        cuerpoBarraPropiedades=barraPropiedades.querySelector(".foxtrot-contenidos-barra-herramientas");

    this.componenteSeleccionado=null;

    function configurarBarrasHerramientas() {
        document.querySelector("#foxtrot-barra-componentes").arrastrable({
            asa:document.querySelector("#foxtrot-barra-componentes .foxtrot-asa-arrastre"),
            mover:true
        });
        document.querySelector("#foxtrot-barra-propiedades").arrastrable({
            asa:document.querySelector("#foxtrot-barra-propiedades .foxtrot-asa-arrastre"),
            mover:true
        });
    };

    function contruirBarrasHerramientas() {
        var barra=document.querySelector("#foxtrot-barra-componentes .foxtrot-contenidos-barra-herramientas"),
            componentes=ui.obtenerComponentes();

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
            barraGrupo.anexarA(barra);

            for(var i=0;i<grupos[grupo].length;i++) {
                var comp=grupos[grupo][i];

                var icono=document.crear("<img>")
                    .atributo("src",comp.config.icono)
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
    };

    function componenteSoltado(e) {
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
        var componentes=document.querySelectorAll("#foxtrot-barra-componentes .foxtrot-contenidos-barra-herramientas button");
        for(var i=0;i<componentes.length;i++) {
            var comp=componentes[i];
            comp.arrastrable({
                icono:iconosComponentes[comp.metadato("componente")],
                datos:JSON.stringify({
                    componente:comp.metadato("componente")
                })
            });
        }

        ui.obtenerCuerpo().crearDestino({
            drop:componenteSoltado
        });
    };

    function establecerEventos() {
        ui.obtenerCuerpo().eventoFiltrado("click",{
            clase:"componente"
        },function(ev) {
            ev.stopPropagation();

            //TODO Selección múltiple

            self.limpiarSeleccion();
            self.establecerSeleccion(this);
        })
        .evento("click",function() {
            self.limpiarSeleccion();
        });

        document.evento("keydown",function(ev) {
            if(eventosPausados) return;

            if(ev.which==27) {
                self.limpiarSeleccion();
            } else if(ev.which==46) {
                if(self.componenteSeleccionado) {
                    self.eliminarComponente(self.componenteSeleccionado);
                    self.componenteSeleccionado=null;
                    ev.preventDefault();
                }
            }
        });
    }

    this.eliminarComponente=function(comp) {
        console.log("eliminar",comp);

        return this;
    };

    function construirPropiedades() {
        if(!self.componenteSeleccionado) {
            barraPropiedades.agregarClase("foxtrot-barra-propiedades-vacia");
            cuerpoBarraPropiedades.html("Ningún componente seleccionado");
            return;
        }
        
        barraPropiedades.removerClase("foxtrot-barra-propiedades-vacia");
        cuerpoBarraPropiedades.html("");

        var agregarPropiedad=function(barra,nombre,prop) {
            var fila=document.crear("<div class='foxtrot-propiedad'>");
            
            document.crear("<label>").html(prop.etiqueta).anexarA(fila);

            var tipo=prop.hasOwnProperty("tipo")?prop.tipo:"texto",
                fn=prop.hasOwnProperty("funcion")?prop.funcion:null,
                timeout=0,
                componente=editor.componenteSeleccionado;

            if(tipo=="?") {
                //TODO
            } else {
                //Campo de texto como predeterminado
                
                var campo=document.crear("<input type='text' class='form-control'>").valor(prop.valor);
                fila.anexar(campo);

                campo.evento("input",function(ev) {
                    var t=this;
                    clearTimeout(timeout);
                    timeout=setTimeout(function() {
                        if(fn) fn.call(editor,componente,nombre,t.valor());
                    },200);
                }).evento("blur",function(ev) {
                    if(fn) fn.call(editor,componente,nombre,this.valor());
                });
            }

            fila.anexarA(barra);
        };

        var propiedades=editor.componenteSeleccionado.obtenerPropiedades();

        //Propiedades especiales
        propiedades[-1]={
            nombre: {
                etiqueta:"Nombre",
                funcion:function(componentes,prop,valor) {
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

    this.establecerSeleccion=function(obj) {
        var elem,comp;

        //TODO Selección múltiple

        this.limpiarSeleccion();
        
        if(obj instanceof window.componente) {
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

    this.activar=function() {
        contruirBarrasHerramientas();
        prepararArrastrarYSoltar();
        establecerEventos();
        ui.establecerModoEdicion(true);

        return this;
    };

    this.moverComponente=function(destino,id) {
        var obj=ui.obtenerInstanciaComponente(id);
        if(!obj||destino===obj.elemento) return this;
        destino.anexar(obj.elemento);

        return this;
    };

    this.insertarComponente=function(destino,nombre) {
        var obj=ui.crearComponente(nombre),
            id=obj.obtenerId(),
            elem=obj.obtenerElemento(),
            conte=obj.obtenerContenedor();

        destino.anexar(elem);

        if(conte) {
            conte.crearDestino({
                drop:componenteSoltado
            });
        }
        
        elem.arrastrable({
            icono:iconosComponentes[nombre], //Al arrastrar, que presente el ícono del tipo de componente
            datos:JSON.stringify({
                idcomponente:id
            })
        });

        return obj;
    };

    /**
     * Remueve todas las clases y propiedades del modo de edición del código html dado.
     */
    this.limpiarHtml=function(html) {
        var temp=document.crear("<div>");
        temp.html(html);
        temp.querySelectorAll("*").removerClase(/^foxtrot-arrastrable-.+/).propiedad("contentEditable",null);
        return temp.innerHTML;
    };

    /**
     * Guarda la vista actual (actualmente en modo de pruebas, guarda a /salida/salida.html).
     */
    this.guardar=function(previsualizar,cbk) {
        if(util.esIndefinido(previsualizar)) previsualizar=false;
        if(util.esIndefinido(cbk)) cbk=null;
        
        document.body.agregarClase("trabajando");

        new ajax({
            url:"guardar.php",
            parametros:{
                previsualizar:previsualizar,
                nombre:"salida",
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
    this.abrir=function(cbk) {
        if(util.esIndefinido(cbk)) cbk=null;
        
        document.body.agregarClase("trabajando");

        new ajax({
            url:"abrir.php",
            parametros:{
                nombre:"salida"
            },
            listo:function(resp) {
                if(!resp) {
                    alert("No fue posible abrir la vista.");
                } else {
                    if(cbk) {
                        cbk.call(self,resp);
                    } else {
                        ui.reemplazarHtml(resp.html);
                        ui.establecerEstilos(resp.css);
                        ui.establecerJson(resp.json);
                        ui.ejecutar();
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

    this.pausarEventos=function(valor) {
        if(util.esIndefinido(valor)) valor=true;
        eventosPausados=valor;
        return this;
    };
}();

window["editor"]=editor;
