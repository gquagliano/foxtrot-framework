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
        eventosPausados=false;

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
        for(var nombre in componentes) {
            if(!componentes.hasOwnProperty(nombre)) continue;

            var icono=document.crear("<img>")
                .atributo("src",componentes[nombre].config.icono)
                .atributo("title",componentes[nombre].config.descripcion);
            iconosComponentes[nombre]=icono;

            barra.anexar(
                document.crear("<button class='"+claseBotonesBarrasHerramientas+"'>")
                    .anexar(
                        icono.clonar()  //Clonamos el ícono para que no afecte la instancia almacenada en iconosComponentes
                                        //(al arrastrar, toma los estilos que pueda tener al momento de iniciar la operación de arraastre)
                    )
                    .metadato("componente",nombre)
                );
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
            editor.insertarComponente(this,datos.componente);
            return;
        }

        if(datos.hasOwnProperty("idcomponente")) {
            editor.moverComponente(this,datos.idcomponente);
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

    this.establecerSeleccion=function(obj) {
        var elem,comp;
        
        if(obj instanceof window.componente) {
            comp=obj;
            elem=comp.obtenerElemento();
        } else {
            comp=ui.obtenerInstanciaComponente(obj);
            elem=obj;
        }

        elem.agregarClase("seleccionado");
        this.componenteSeleccionado=comp;

        return this;
    };

    this.limpiarSeleccion=function() {
        ui.obtenerCuerpo().querySelectorAll(".componente").removerClase("seleccionado");
        this.componenteSeleccionado=null;

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
            datos=obj.obtenerElemento();

        destino.anexar(datos.elemento);

        if(datos.contenedor) {
            datos.contenedor.crearDestino({
                drop:componenteSoltado
            });
        }
        
        datos.elemento.arrastrable({
            icono:iconosComponentes[nombre], //Al arrastrar, que presente el ícono del tipo de componente
            datos:JSON.stringify({
                idcomponente:id
            })
        });

        return this;
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
     * Guarda la vista actual (actualmente en modo de pruebas, guarda a /salida.html).
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
