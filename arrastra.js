/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 /**
 * Gestor de eventos de arrastrar y soltar (drag and drop), ideado para abastraer el acceso al mismo para abreviar el código y simplificar
 * la resolución de cualquier incompatibilidad entre navegadores, pero implementando las funciones HTML5 nativas.
 */
(function() {
    "use strict";

    var proto=dom().prototipo(),
        ventana=dom(window),
        doc=dom(document);

    var moverX,moverY,
    moverDragover=function(e) {
        e=(e||event);
        e.preventDefault();
        e.dataTransfer.dropEffect="move";
    },
    moverDragstart=function(e) {
        e=e||event;
        moverX=e.clientX;
        moverY=e.clientY;

        //Remover el elemento "fantasma"
        e.dataTransfer.setDragImage(new Image,0,0);
        //Implementar dragover en el documento para controlar el cursor
        doc.evento("dragover",moverDragover);
    },
    moverDrag=function(e) {
        e=e||event;
        if(e.clientX==0&&e.clientY==0) return;
        
        var elem=dom(this).metadatos("arrastra"),
            dx=e.clientX-moverX,
            dy=e.clientY-moverY;
        moverX=e.clientX;
        moverY=e.clientY;

        var pos=elem.posicionAbsoluta(),
            ancho=elem.ancho(),
            alto=elem.alto(),
            anchoVentana=ventana.ancho(),
            altoVentana=ventana.alto();

        if(pos.x+dx<=0||pos.y+dy<=0||pos.x+dx+ancho>=anchoVentana||pos.y+dy+alto>=altoVentana) {
            //Fuera de los límites
            return;
        }

        elem.estilo({
            left:pos.x+dx,
            top:pos.y+dy
        });
    },
    moverDragend=function(e) {
        doc.removerEvento("dragover",moverDragover);
    };

    /**
     * Hace a los elementos arrastrables. Establecer opciones=false para deshabilitar.
     */
    proto.arrastrable=function(opciones) {
        var predeterminados={
            //Mantenemos los nombres de eventos en inglés
            dragstart:null,
            drag:null,
            dragend:null,
            asa:null,
            icono:null,
            mover:false,
            limite:null
        };
        opciones=Object.assign(predeterminados,opciones);

        if(opciones.mover) {
            //Implementación automática del reposicionamiento del elemento (como una ventana o un diálogo)            
            if(opciones.dragstart) {
                opciones.dragstart=[opciones.dragstart,moverDragstart];
            } else {
                opciones.dragstart=moverDragstart;
            }
            if(opciones.drag) {
                opciones.drag=[opciones.drag,moverDrag];
            } else {
                opciones.drag=moverDrag;
            }
            if(opciones.dragend) {
                opciones.dragend=[opciones.dragend,moverDragend];
            } else {
                opciones.dragend=moverDragend;
            }
            if(!opciones.limite) opciones.limite=window;
        }

        var elems=this.obtener();
        for(var i=0;i<elems.length;i++) {
            var elem=dom(elems[i]);

            var arrastrable=elem;
            if(typeof opciones.asa==="string") {
                arrastrable=elem.buscar(opciones.asa);
            } else if(dom().esInstancia(opciones.asa)) {
                arrastrable=opciones.asa;
            }

            arrastrable.propiedad("draggable",true)
                .agregarClase("foxtrot-arrastrable");

            arrastrable.metadatos("arrastra",elem);

            if(opciones.dragstart) arrastrable.evento("dragstart",opciones.dragstart);
            if(opciones.drag) arrastrable.evento("drag",opciones.drag);
            if(opciones.dragend) arrastrable.evento("dragend",opciones.dragend);
        }
    };

    /**
     * Hace que los elementos admitan que se suelte otro elemento dentro de sí. Establecer opciones=false para deshabilitar. 
     */
    proto.aceptarColocacion=function(opciones) {

    };

    /**
     * Hace que los elementos acepten arrastrar y soltar archivos desde el escritorio del cliente sobre ellos. Establecer opciones=false para deshabilitar.
     */
    proto.aceptarArchivoColocado=function(opciones) {

    };
})();

