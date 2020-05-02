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
            barra.anexar(
                document.crear("<button class='"+claseBotonesBarrasHerramientas+"'>")
                    .anexar(
                        document.crear("<img>")
                            .atributo("src",componentes[nombre].config.icono)
                            .atributo("title",componentes[nombre].config.descripcion)
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
            if(!datos||!datos.hasOwnProperty("componente")) return;
        } catch {
            return;
        }

        editor.insertarComponente(this,datos.componente);
    }

    function prepararArrastrarYSoltar() {
        var componentes=document.querySelectorAll("#foxtrot-barra-componentes .foxtrot-contenidos-barra-herramientas button");
        for(var i=0;i<componentes.length;i++) {
            var comp=componentes[i];
            comp.arrastrable({
                icono:comp.buscar("img").obtener(0),
                datos:JSON.stringify({componente:comp.metadato("componente")})
            });
        }

        ui.obtenerCuerpo().crearDestino({
            drop:componenteSoltado
        });
    };

    this.activar=function() {
        contruirBarrasHerramientas();
        prepararArrastrarYSoltar();
        ui.establecerModoEdicion(true);
    };

    this.insertarComponente=function(destino,nombre) {
        var obj=ui.crearComponente(nombre),
            datos=obj.obtenerElemento();

        destino.anexar(datos.elemento);

        if(datos.contenedor) {
            datos.contenedor.crearDestino({
                drop:componenteSoltado
            });
        }
    };

    /**
     * Remueve todas las clases y propiedades del modo de edición del código html dado.
     */
    this.limpiarHtml=function(html) {
        var temp=document.crear("<div>");
        temp.anexar(html);
        temp.querySelectorAll("*").removerClase(/^foxtrot-arrastrable-.+/).propiedad("contentEditable",null);
        return temp.innerHTML;
    };

    this.guardar=function() {
        //Método de prueba para guardar a un archivo salida.html
        
        document.body.agregarClase("trabajando");

        new ajax({
            url:"guardar.php",
            parametros:{
                nombre:"salida",
                html:ui.obtenerHtml(),
                json:ui.obtenerJson()
            },
            listo:function() {
                document.body.removerClase("trabajando");
            }
        });
    };
}();

window["editor"]=editor;
