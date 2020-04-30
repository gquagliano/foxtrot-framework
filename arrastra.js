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

    var opcionesArrastre={},
        opcionesColocacion={};

    Node.prototype.removerArrastre=function(elem) {

    };

    Node.prototype.removerDestino=function(elem) {

    };

    function dragStart(e) {
        var $t=$(this),
            opciones=opcionesArrastre[$t.id()],
            $elem=$t.metadatos("arrastra");

        $elem.agregarClase("foxtrot-arrastrando");
        
        if(opciones.icono) {
            var ic=opciones.icono;
            if(dom.esInstancia(ic)) {
                ic=ic.obtener(0);
            } else if(!(ic instanceof Element)) {
                ic=$("<img>").atributo("src",ic).obtener(0);
            }               
            e.dataTransfer.setDragImage(ic,-5,-5);
        }
        
        if(opciones.datos) {
            e.dataTransfer.setData("text/plain",opciones.datos);
        }
    }
    
    function dragEnd(e) {
        var $t=$(this),
            opciones=opcionesArrastre[$t.id()];

        $t.removerClase("foxtrot-arrastrando");
    }

    function dragEnter(e) {
        var $t=$(this),
            opciones=opcionesColocacion[$t.id()];
        
        $t.agregarClase("foxtrot-arrastrando-sobre");
    }

    function dragOver(e) {
        var $t=$(this),
            opciones=opcionesColocacion[$t.id()];

        e.preventDefault();
        e.stopPropagation();

        e.dataTransfer.dropEffect="move";     
    }

    function dragLeave(e) {
        var $t=$(this),
            opciones=opcionesColocacion[$t.id()];
        
        $t.removerClase("foxtrot-arrastrando-sobre");        
    }

    function drop(e) {
        var $t=$(this),
            opciones=opcionesColocacion[$t.id()];
        
        $t.removerClase("foxtrot-arrastrando-sobre");  

        e.preventDefault();
        e.stopPropagation();           
    }

    /**
     * Hace a los elementos arrastrables. Establecer opciones=false para deshabilitar.
     */
    dom.agregarMetodo("arrastrable",function(opciones) {
        if(dom.esIndefinido(opciones)) opciones={};
        var predeterminados={
            //Mantenemos los nombres de eventos en inglés
            dragstart:null,
            drag:null,
            dragend:null,
            asa:null,
            icono:null,
            mover:false,
            limite:null,
            datos:null
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
            var $elem=$(elems[i]);

            removerArrastre($elem);
            
            opcionesArrastre[$elem.id()]=opciones;

            var $arrastrable=$elem;
            if(typeof opciones.asa==="string") {
                $arrastrable=$elem.buscar(opciones.asa);
            } else if(dom.esInstancia(opciones.asa)) {
                $arrastrable=opciones.asa;
            } else if(dom.esElemento(opciones.asa)) {
                $arrastrable=$(opciones.asa);
            }

            $arrastrable.propiedad("draggable",true)
                .agregarClase("foxtrot-arrastrable");

            $arrastrable.metadatos("arrastra",$elem);

            if(opciones.dragstart) $arrastrable.evento("dragstart",opciones.dragstart);
            if(opciones.drag) $arrastrable.evento("drag",opciones.drag);
            if(opciones.dragend) $arrastrable.evento("dragend",opciones.dragend);

            $arrastrable.evento("dragstart",dragStart)
                .evento("dragend",dragEnd);
        }

        return this;
    });

    /**
     * Hace que los elementos admitan que se suelte otro elemento dentro de sí. Establecer opciones=false para deshabilitar. 
     */
    dom.agregarMetodo("aceptarColocacion",function(opciones) {
        if(dom.esIndefinido(opciones)) opciones={};
        var predeterminados={
            //Mantenemos los nombres de eventos en inglés
            dragenter:null,
            dragover:null,
            dragleave:null,
            drop:null
        };
        opciones=Object.assign(predeterminados,opciones);

        var elems=this.obtener();
        for(var i=0;i<elems.length;i++) {
            var $elem=$(elems[i]);

            removerColocacion($elem);
            
            opcionesColocacion[$elem.id()]=opciones;
            
            $elem.agregarClase("foxtrot-receptor-arrastrable");

            if(opciones.dragenter) $elem.evento("dragenter",opciones.dragenter);
            if(opciones.dragover) $elem.evento("dragover",opciones.dragover);
            if(opciones.dragleave) $elem.evento("dragleave",opciones.dragleave);
            if(opciones.drop) $elem.evento("drop",opciones.drop);

            $elem.evento("dragenter",dragEnter)
                .evento("dragover",dragOver)
                .evento("dragleave",dragLeave)
                .evento("drop",drop);
        }

        return this;
    });

    /**
     * Hace que los elementos acepten arrastrar y soltar archivos desde el escritorio del cliente sobre ellos. Establecer opciones=false para deshabilitar.
     */
    dom.agregarMetodo("aceptarArchivoColocado",function(opciones) {


        return this;
    });

    //Implementación automática de arrastre
    
    var moverX,moverY;

    function moverDragover(e) {
        e=(e||event);
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect="move";
    }

    function moverDragstart(e) {
        e=e||event;
        moverX=e.clientX;
        moverY=e.clientY;

        //Remover el elemento "fantasma"
        e.dataTransfer.setDragImage(new Image,0,0);
        //Implementar dragover en el documento para controlar el cursor
        $doc.evento("dragover",moverDragover);
    }

    function moverDrag(e) {
        e=e||event;
        if(e.clientX==0&&e.clientY==0) return;
        
        var $elem=$(this).metadatos("arrastra"),
            dx=e.clientX-moverX,
            dy=e.clientY-moverY;
        moverX=e.clientX;
        moverY=e.clientY;

        var pos=$elem.posicionAbsoluta(),
            ancho=$elem.ancho(),
            alto=$elem.alto(),
            anchoVentana=$ventana.ancho(),
            altoVentana=$ventana.alto();

        if(pos.x+dx<=0||pos.y+dy<=0||pos.x+dx+ancho>=anchoVentana||pos.y+dy+alto>=altoVentana) {
            //Fuera de los límites
            return;
        }

        $elem.estilo({
            left:pos.x+dx,
            top:pos.y+dy
        });
    }

    function moverDragend(e) {
        $doc.removerEvento("dragover",moverDragover);
    }
})();

