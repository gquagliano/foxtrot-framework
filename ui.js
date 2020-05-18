/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Métodos de gestión de la interfaz.
 */
var ui=new function() {
    "use strict";

    ////Almacenes y parámetros

    var componentesRegistrados={},
        instanciasComponentes=[],
        instanciasComponentesId={},
        controladores={},
        instanciasControladores={},
        modoEdicion=false,
        id=1,
        tamanos={ //TODO Configurable
            xl:1200,
            lg:992,
            md:768,
            sm:576,
            xs:0
        };

    ////Elementos del dom

    var doc=document,
        body=doc.body,
        cuerpo=body,
        estilos,
        marco;

    ////Acceso a variables

    this.obtenerMarco=function() {
        return marco;
    };

    this.obtenerDocumento=function() {
        return doc;
    };

    this.obtenerCuerpo=function() {
        return cuerpo;
    };

    this.obtenerElementoEstilos=function() {
        return estilos;
    };

    ////Estilos

    this.obtenerEstilos=function(selector,origen) {        
        if(util.esIndefinido(selector)) selector=null;
        if(util.esIndefinido(origen)) origen=estilos.sheet.cssRules;

        var reglas=[];
        for(var i=0;i<origen.length;i++) {
            var regla=origen[i],
                obj=null;

            if(regla.type==CSSRule.MEDIA_RULE) {
                var arr=this.obtenerEstilos(selector,regla.cssRules);
                //Ignorar media queries vacíos o sin coincidencias
                if(arr.length) {
                    obj={
                        tipo:"media",
                        media:regla.conditionText,
                        reglas:arr,
                        texto:regla.cssText,
                        indice:i
                    };
                }
            } else if(regla.type==CSSRule.STYLE_RULE) {
                obj={
                    selector:regla.selectorText,
                    estilos:regla.style,
                    texto:regla.cssText,
                    indice:i
                };
            }
            //Por el momento vamos a ignorar otros tipos. No deberían existir (no se supone que el usuario deba modificar los estilos generados por el editor,
            //sus estilos adicionales deben ir en un archivo distinto.)

            if(obj&&selector&&regla.selectorText==selector) return obj;
            
            reglas.push(obj);
        }

        return selector?null:reglas;
    };

    this.establecerEstilos=function(css) {
        estilos.innerText=css;
        return this;
    };

    this.establecerEstilosSelector=function(selector,css,tamano) {
        if(util.esIndefinido(tamano)||!tamano) tamano="g";

        var tamanoPx=tamanos[tamano],
            hoja=estilos.sheet,
            reglas=hoja.cssRules,
            indicesMedia=[],
            indicePrimerMedia=0;
  
        if(tamano!="xs"&&tamano!="g") {
            //Los tamaños xs y g (global) son sinónimos
            //Buscar o crear mediaquery en caso contrario
            var media=null;
            for(var i=0;i<reglas.length;i++) {
                var regla=reglas[i];
                //regla instanceof CSSMediaRule falla por algún motivo que estoy investigando
                //Por el momento verificamos tipo por propiedad type
                //TODO Verificar compatibilidad de este método (probado solo en Opera)
                if(regla.type==CSSRule.MEDIA_RULE) {
                    if(indicePrimerMedia==0) indicePrimerMedia=i;
                    
                    var coincidencia=regla.conditionText.match(/min-width:.*?([0-9]+)/i);
                    if(!coincidencia) continue;
                    var minWidth=coincidencia[1];

                    //Almacenamos la posición de cada media query en la hoja para poder insertar nuevas en el orden correcto
                    indicesMedia.push([ minWidth, i ]);

                    if(minWidth==tamanoPx) media=regla;
                }
            }
            if(media!==null) {
                //Insertar/reemplazar dentro del media existente
                hoja=media;
            } else {
                //Buscar el orden correcto para el nuevo media (primero las reglas globales, luego los media de menor a mayor)
                //Si no hay ninguno, agregar al final del archivo
                var i=hoja.cssRules.length;
                if(indicesMedia.length) {
                    for(var j=0;j<indicesMedia.length;j++) {
                        if(indicesMedia[j][0]>tamanoPx) {
                            i=indicesMedia[j][1];
                            break;
                        }
                    }
                }

                hoja.insertRule("@media (min-width: "+tamanoPx+"px) { }",i);

                //Insertar/reemplazar dentro del media nuevo
                hoja=hoja.cssRules[i];
            }
        }

        reglas=hoja.cssRules;
        
        for(var i=0;i<reglas.length;i++) {
            var regla=reglas[i];

            if(regla.type==CSSRule.STYLE_RULE&&selector==regla.selectorText) {
                hoja.deleteRule(i);
                break;
            }
        };
        hoja.insertRule(
                selector+"{"+css+"}",
                //Insertar las reglas globales antes del primer mediaquery
                tamano=="xs"||tamano=="g"?indicePrimerMedia:reglas.length
            );
        return this;
    };

    ////Gestión de componentes

    this.generarId=function() {
        return id++;
    };

    this.registrarComponente=function(nombre,funcion,configuracion) {
        configuracion.nombre=nombre;
        componentesRegistrados[nombre]={
            fn:funcion,
            config:configuracion
        };
        return this;
    };

    this.obtenerConfigComponente=function(nombre) {
        return componentesRegistrados[nombre].config;
    };

    this.obtenerComponentes=function() {
        return componentesRegistrados;
    };

    /**
     * Crea una instancia de un componente dado su nombre.
     */
    this.crearComponente=function(nombre) {
        var obj=componente.fabricarComponente(componentesRegistrados[nombre].fn),
            id=this.generarId();
        obj.establecerId(id);
        
        var i=instanciasComponentes.push(obj);
        //Índices
        instanciasComponentesId[id]=i-1;

        return obj;
    };

    /**
     * Devuelve las instancias de los componentes existentes.
     */
    this.obtenerInstanciasComponentes=function() {
        return instanciasComponentes;
    };

    /**
     * Devuelve el ID de un componente dado su ID, instancia, nombre o elemento del DOM.
     */
    function identificarComponente(param) {
        if(typeof param==="number"||!isNaN(parseInt(param))) return parseInt(param);
        if(typeof param=="string"&&componentes.hasOwnProperty(param)) return componentes[param];
        if(typeof param=="object"&&param.esComponente()) return param.obtenerId();
        if(param instanceof Node) return param.dato("fxid");
        return null;
    }

    /**
     * Devuelve la instancia de un componente dado su ID, instancia, nombre o elemento del DOM.
     */
    this.obtenerInstanciaComponente=function(param) {
        var id=identificarComponente(param);
        if(!id||!instanciasComponentesId.hasOwnProperty(id)) return null;
        return instanciasComponentes[instanciasComponentesId[id]];
    };

    /**
     * Elimina la instancia de un componente dado su ID, instancia, nombre o elemento del DOM.
     */
    this.eliminarInstanciaComponente=function(param) {
        var id=identificarComponente(param);
        if(!id||!instanciasComponentesId.hasOwnProperty(id)) return null;
        delete instanciasComponentes[instanciasComponentesId[id]];
        delete instanciasComponentesId[id];
        return this;
    }


    ////Cargar/guardar

    /**
     * Devuelve el HTML de la vista.
     */
    this.obtenerHtml=function() {
        return editor.limpiarHtml(cuerpo.innerHTML);
    };

    /**
     * Devuelve el CSS de la vista.
     */
    this.obtenerCss=function() {
        var css="";
        this.obtenerEstilos().forEach(function(regla) {
            css+=regla.texto;
        });
        //Comprimir
        css=css.replace(["\r","\n"],"")
            .replace(/([\):;\}\{])[\s]+/g,"$1")
            .replace(/[\s]+([\{\(#])/g,"$1")
            .replace(";}","}");
        return css;        
    };

    /**
     * Genera y devuelve un JSON con las relaciones entre el DOM y los componentes.
     */
    this.obtenerJson=function() {
        var resultado={
            ver:1,
            componentes:[],
            vista:{
                nombre:null,
                propiedades:{}
            }
        };

        instanciasComponentes.forEach(function(obj) {
            resultado.componentes.push({
                id:obj.id,
                nombre:obj.nombre,
                componente:obj.componente,
                propiedades:obj.obtenerPropiedades()
            });
        });

        return JSON.stringify(resultado);
    };

    /**
     * Inserta el código html en el cuerpo del editor. Este método solo debería utilizarse en modo edición.
     */
    this.reemplazarHtml=function(html) {
        cuerpo.innerHTML=html;
        return this;        
    };

    /**
     * Establece e inicializa la vista y sus componentes dado su json.
     */
    this.establecerJson=function(json) {
        if(typeof json==="string") json=JSON.parse(json);
        
        json.componentes.forEach(function(componente) {
            ui.crearComponente(componente.componente)
                .establecerId(componente.id)
                .establecerNombre(componente.nombre)
                .establecerPropiedades(componente.propiedades)
                .restaurar();
        });

        return this;  
    };

    ////Controladores (¡Protitopo!)

    this.registrarControlador=function(nombre,funcion) {
        controladores[nombre]=funcion;
        return this;
    };

    this.obtenerInstanciaControlador=function(nombre) {
        //TODO Esto debería migrarse a una fábrica de controladores
        if(instanciasControladores.hasOwnProperty(nombre)) return instanciasControladores[nombre];
        var obj=new controladores[nombre];
        instanciasControladores[nombre]=obj;
        //TODO Preparar obj (prototipo, inicializacion)
        return obj;
    };

    ////Gestión de la UI

    this.establecerModoEdicion=function(valor) {
        modoEdicion=valor;
        body.alternarClase("foxtrot-modo-edicion");
        
        //En modo de ejecución, trabajamos con el body entero, pero en modo edición trabajamos con #foxtrot-cuerpo
        cuerpo=valor?doc.querySelector("#foxtrot-cuerpo"):body;

        return this;
    };

    this.enModoEdicion=function() {
        return modoEdicion;
    };

    /**
     * Devuelve el tamaño de pantalla como string: xs|sm|md|lg|xl.
     */
    this.obtenerTamano=function() {
        //TODO Configurable
        var ancho=(modoEdicion?marco:window).ancho();
        //TODO Cuando esto sea configurable se debe des-harcodear
        if(ancho>=tamanos.xl) return "xl";
        if(ancho>=tamanos.lg) return "lg";
        if(ancho>=tamanos.md) return "md";
        if(ancho>=tamanos.sm) return "sm";
        return "xs";
    };

    /**
     * Devuelve todos los posibles tamaños con formato {nombre:ancho máximo}.
     */
    this.obtenerTamanos=function() {
        return tamanos;
    };

    /**
     * Devuelve los nombres de los posibles tamaños como array ordenado de menor a mayor.
     */
    this.obtenerArrayTamanos=function() {
        //TODO Cuando esto sea configurable se debe des-harcodear
        return ["xs","sm","md","lg","xl"];
    };

    this.ejecutar=function(nuevoDoc) {
        if(!util.esIndefinido(nuevoDoc)) {
            //Si se activa para un documento diferente, reemplazar las referencias al dom
            doc=nuevoDoc;
            body=doc.body;
            cuerpo=body;
            estilos=doc.querySelector("#foxtrot-estilos");
            marco=document.querySelector("#foxtrot-marco");
        }
    };
}();

/**
 * Plantilla para los objetos de configuración a utilizar en ui.registrarComponente().
 */
var configComponente={
    nombre: null,
    descripcion: null,
    icono: null,
    /**
     * aceptaHijos:
     * - true               Cualquiera
     * - false              Ninguno
     * - [ nombre, ... ]    Nombre de componentes de los cualqes puede ser hijo, o que acepta como hijos
     */
    aceptaHijos: true,
    grupo:null
};

var componentes={};

window["ui"]=ui;
window["componentes"]=componentes;