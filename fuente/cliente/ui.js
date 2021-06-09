/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

"use strict";

/**
 * @class Gestión de la interfaz.
 */
var ui=new function() {
    "use strict";

    ////Almacenes y parámetros

    var self=this,
        componentesRegistrados={},
        instanciasComponentes=[],
        controladores={},
        instanciasControladores={},
        instanciaControladorPrincipal=null,
        modulos={},
        modoEdicion=false,
        id=1,
        tamanos={ //TODO Configurable
            xl:1200,
            lg:992,
            md:768,
            sm:576,
            xs:0
        },
        tamanosPx=tamanos.intercambiar(),
        tamanoActual=null,
        urlBase=null,
        esCordova=false,
        instanciasVistas={},
        enrutadores={},
        instanciaEnrutador=null,
        instanciaAplicacion=null,
        urlModificada=0,
        instanciaVistaPrincipal=null,
        nombreVistaPrincipal=null,
        jsonVistaPrincipal=null,
        confirmarSalidaActivado=false,
        confirmarSalidaMensaje;

    ////Elementos del dom

    var win=window,
        doc=document,
        body=doc.body,
        cuerpo=doc.querySelector("#foxtrot-cuerpo"),
        estilos=null,
        marco=null;

    ////Acceso a variables generales

    /**
     * 
     */
    this.obtenerMarco=function() {
        return marco;
    };

    /**
     * 
     */
    this.obtenerDocumento=function() {
        return doc;
    };

    /**
     * 
     */
    this.obtenerCuerpo=function(vista) {
        if(typeof vista==="undefined") return cuerpo;

        //Buscar cuerpo de una vista secundaria (embebida)
        if(instanciasVistas.hasOwnProperty(vista)) return instanciasVistas[vista].obtenerElemento();
    };

    /**
     * Busca una hoja de estilos por nombre.
     * @param {string} nombre - Nombre como expresión regular.
     * @returns {(StyleSheet|null)}
     */
    this.buscarHojaEstilos=function(nombre) {
        for(var i=0;i<doc.styleSheets.length;i++) {
            var hoja=doc.styleSheets[i];
            if(new RegExp(nombre).test(hoja.href)) return hoja;
        }
        return null;
    };

    /**
     * 
     */
    this.obtenerElementoEstilos=function() {
        if(!estilos) {
            //Buscar la hoja de estilos correspondiente a los estilos de la vista (por el momento la identificamos por nombre, esto quizás debería mejorar--TODO)
            estilos=this.buscarHojaEstilos("cliente/vistas/"+nombreVistaPrincipal+"(-.+?)?\.css");
            //Si no se encuentra, buscar hoja de estilos combinada (aplicacion.css o cordova.css)
            if(!estilos) estilos=this.buscarHojaEstilos("recursos/css/(cordova|aplicacion)(-.+?)?\.css");
        }
        return estilos;
    };

    /**
     * 
     */
    this.obtenerUrlBase=function() {
        return urlBase?urlBase:document.querySelector("base").atributo("href");
    };

    /**
     * 
     */
    this.esCordova=function() {
        return esCordova;
    };

    ////Estilos

    /**
     * 
     */
    this.obtenerEstilos=function(selector,tamano,origen) {        
        if(util.esIndefinido(selector)) selector=null;
        if(util.esIndefinido(tamano)) tamano=null;

        if(tamano=="xs") tamano="g";

        var raiz=false;
        if(util.esIndefinido(origen)) {
            raiz=true;
            origen=this.obtenerElementoEstilos().cssRules;
        }

        var reglas=[];
        for(var i=0;i<origen.length;i++) {
            var regla=origen[i],
                obj=null;

            if(regla.type==CSSRule.MEDIA_RULE) {
                //Determinar si corresponde a un tamaño estandar
                var tam=null,
                    coincidencia=regla.conditionText.match(/min-width:.+?([0-9]+)/i);
                if(tamano&&!coincidencia) continue;

                if(coincidencia[1]==tamanos.xl) tam="xl";
                else if(coincidencia[1]==tamanos.xl) tam="xl";
                else if(coincidencia[1]==tamanos.lg) tam="lg";
                else if(coincidencia[1]==tamanos.md) tam="md";
                else if(coincidencia[1]==tamanos.sm) tam="sm";
                                
                if(tamano&&tam!=tamano) continue;

                var arr=this.obtenerEstilos(selector,null,regla.cssRules);
                //Ignorar media queries vacíos o sin coincidencias
                if(!arr||!arr.length) continue;

                obj={
                    tipo:"media",
                    media:regla.conditionText,
                    reglas:arr,
                    texto:regla.cssText,
                    indice:i,
                    tamano:tam
                };
            } else if(regla.type==CSSRule.STYLE_RULE) {
                //Ignorar reglas globales si se está filtrando por tamaño
                if(tamano&&tamano!="g"&&raiz) continue;

                if(selector&&regla.selectorText!=selector) continue;

                obj={
                    selector:regla.selectorText,
                    estilos:regla.style,
                    texto:regla.cssText,
                    indice:i
                };
            }
            //Por el momento vamos a ignorar otros tipos. No deberían existir (no se supone que el usuario deba modificar los estilos generados por el editor,
            //sus estilos adicionales deben ir en un archivo distinto.)
            
            if(obj) reglas.push(obj);
        }

        if(!reglas.length) {
            //Inicializar
            this.establecerEstilosSelector(selector,"",tamano);
            reglas=this.obtenerEstilos(selector,tamano);
        }

        //Si se filtró por tamaño, devolver solo las reglas del mismo
        if(tamano) {
            var filtradas=[];
            for(var i=0;i<reglas.length;i++) {
                //Media query
                if(reglas[i].hasOwnProperty("tamano")) {
                    if(reglas[i].tamano==tamano) return reglas[i].reglas;
                    continue;
                }
                if(tamano=="g") filtradas.push(reglas[i]);
            }
            reglas=filtradas;       
        }

        return reglas;
    };

    /**
     * Agrega una hoja o un listado de hojas de estilos.
     */
    this.agregarHojaEstilos=function(url) {
        if(typeof url==="string") url=[url];
        var h=document.querySelector("head"),
            listas=0;
        url.forEach(function(u) {
            h.anexar(
                document.crear("link")
                    .atributo("rel","stylesheet")
                    .evento("load",function() {
                        listas++;
                        //if(esCordova&&listas==url.length) document.querySelector("#contenedor-cordova").agregarClase("listo");
                    })
                    .atributo("href",u)
            );
        });
        return this;
    };

    /**
     * Procesa un objeto de estilos y establece los estilos contenidos en el mismo para el selector dado.
     * @param {string} selector - Selector.
     * @param {Object[]} obj - Estilos (objeto compatible con la salida de obtenerEstilos()).
     * @returns {ui}
     */
    this.procesarObjetoEstilos=function(selector,obj) {
        var t=this;

        obj.forEach(function(estilo) {
            if(estilo.hasOwnProperty("tamano")) {
                estilo.reglas.forEach(function(regla) {
                    t.establecerEstilosSelector(selector,regla.estilos.cssText,estilo.tamano);
                });
            } else {
                t.establecerEstilosSelector(selector,estilo.estilos.cssText);
            }
        });

        return this;
    };

    /**
     * Establece los estilos para un selector.
     * @param {string} selector - Selector.
     * @param {(string|Object[])} css - Estilos. Puede ser código CSS o un objeto compatible con la salida de obtenerEstilos().
     * @param {(string|null)} [tamano] - Tamaño de pantalla. Si se omite, o si es null, se establecerán los estilos generales (sin media query).
     * @returns {ui}
     */
    this.establecerEstilosSelector=function(selector,css,tamano) {
        if(util.esIndefinido(tamano)||!tamano) tamano="g";

        if(util.esArray(css)) return this.procesarObjetoEstilos(selector,css);

        var tamanoPx=tamanos[tamano],
            hoja=this.obtenerElementoEstilos(),
            reglas=hoja.cssRules,
            indicesMedia=[],
            indicePrimerRegla=null,
            indicePrimerMedia=null;
  
        if(tamano!="xs"&&tamano!="g") {
            //Los tamaños xs y g (global) son sinónimos
            //Buscar o crear mediaquery en caso contrario
            var media=null;
            for(var i=0;i<reglas.length;i++) {
                var regla=reglas[i];
                //regla instanceof CSSMediaRule falla por algún motivo que estoy investigando
                //Por el momento verificamos tipo por propiedad type
                //TODO Verificar compatibilidad de este método (probado solo en Opera)
                if(regla.type==CSSRule.STYLE_RULE&&indicePrimerRegla===null) indicePrimerRegla=i;
                if(regla.type==CSSRule.MEDIA_RULE) {
                    if(indicePrimerMedia===null) indicePrimerMedia=i;
                    
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
        } else {
            for(var i=0;i<reglas.length;i++) { 
                var regla=reglas[i];               
                if(regla.type==CSSRule.STYLE_RULE&&indicePrimerRegla===null) indicePrimerRegla=i;
                if(regla.type==CSSRule.MEDIA_RULE&&indicePrimerMedia===null) indicePrimerMedia=i;
                if(indicePrimerMedia!==null&indicePrimerRegla!==null) break;
            }
        }

        reglas=hoja.cssRules;
        
        for(var i=0;i<reglas.length;i++) {
            var regla=reglas[i];

            if(regla.type==CSSRule.STYLE_RULE&&selector==regla.selectorText) {
                hoja.deleteRule(i);
                break;
            }
        }

        //No deben insertarse reglas antes de @import
        if(indicePrimerRegla===null) indicePrimerRegla=0;
        if(indicePrimerMedia===null) indicePrimerMedia=0;
        var indice=Math.max(indicePrimerRegla,indicePrimerMedia);
       
        if(!css) css="";
        hoja.insertRule(
                selector+"{"+css+"}",
                //Insertar las reglas globales antes del primer mediaquery
                tamano=="xs"||tamano=="g"?indice:reglas.length
            );

        return this;
    };

    /**
     * Elimina los estilos para el selector especificado.
     * @param {string} selector - Selector.
     * @param {string} [tamano] - Tamaño. Si se omite, se eliminarán todos los estilos para todos los tamaños.
     * @returns {ui}
     */
    this.removerEstilos=function(selector,tamano) {
        return this.establecerEstilosSelector(selector,null,tamano);
    };

    /**
     * Renombra los estilos para un selector dado (todos los tamaños).
     * @param {string} selector - Selector actual.
     * @param {string} selectorNuevo - Selector nuevo.
     * @returns {ui}
     */
    this.renombrarEstilos=function(selector,selectorNuevo) {
        var estilos=this.obtenerEstilos(selector);
        this.establecerEstilosSelector(selectorNuevo,estilos);
        this.removerEstilos(selector);
        return this;
    };

    ////Gestión de la aplicación

    /**
     * Registra e instancia la clase principal de la aplicación.
     * @param {function} funcion 
     */
    this.registrarAplicacion=function(funcion) {
        //En este caso no puede haber más de una clase, por lo que no tiene sentido llevar un almacén de funciones, instanciamos directamente
        instanciaAplicacion=aplicacion.fabricarAplicacion(funcion);
        //Exportar a global
        window.aplicacion=instanciaAplicacion;
        instanciaAplicacion.inicializar();
        //Evento
        instanciaAplicacion.inicializado();
        return this;
    };

    /**
     * Devuelve la instancia de la clase principal de la aplicacion.
     * @returns {Aplicacion}
     */
    this.obtenerAplicacion=function() {
        return instanciaAplicacion;
    };

    /**
     * Devuelve la instancia de la clase principal de la aplicacion (alias de ui.obtenerAplicacion()).
     * @returns {Aplicacion}
     */
    this.aplicacion=function() {
        return this.obtenerAplicacion();
    };

    ////Gestión de componentes

    /**
     * 
     */
    this.generarId=function() {
        var elem;
        do {
            id++;
            //Verificar que el ID esté libre
            elem=doc.querySelector("[data-fxid$='-"+id+"']");
        } while(elem);
        return id;
    };

    /**
     * Genera y devuelve un selector CSS único.
     * @param {string} [tipo] - Tipo de componente.
     * @param {string} [nombre] - Nombre del componente.
     * @returns {string} 
     */
    this.generarSelector=function(tipo,nombre) {
        if(typeof tipo==="undefined") tipo=null;
        if(typeof nombre==="undefined") nombre=null;

        //Formato: .vista-tipo-número o .vista-tipo-nombre

        var clase="."+nombreVistaPrincipal.replace(/[^a-z0-9-]/g,"-")+"-";

        if(tipo) clase+=tipo+"-";

        if(nombre) {
            clase+=nombre;

            //Verificar que no exista
            var i=0;
            while(doc.querySelector(clase+(i?"-"+i:""))) i++;
            if(i) clase+="-"+i;
        } else {
            var i=++id;

            //Verificar que no exista
            while(doc.querySelector(clase+i)) i++;
            
            clase+=i;
        }

        return clase;
    };

    /**
     * 
     */
    this.registrarComponente=function(nombre,funcion,configuracion) {
        configuracion.nombre=nombre;
        componentesRegistrados[nombre]={
            fn:funcion,
            config:configuracion
        };
        return this;
    };

    /**
     * 
     */
    this.obtenerConfigComponente=function(nombre) {
        return componentesRegistrados[nombre].config;
    };

    /**
     * 
     */
    this.obtenerComponentes=function() {
        return componentesRegistrados;
    };

    /**
     * Crea una instancia de un componente dado su nombre.
     * @param {(Object|string)} comp - Nombre del componente u objeto que representa el componente, si se está creando un componente
     * previamente guardado (desde JSON).
     * @param {componenteVista} [vista] - Instancia de la vista.
     * @returns {Componente}
     */
    this.crearComponente=function(comp,vista) {
        if(typeof vista=="undefined"||vista===null) vista=instanciaVistaPrincipal;

        var nombreVista=typeof vista=="object"&&vista!==null?
            vista.obtenerNombreVista():
            nombreVistaPrincipal;

        var v=nombreVista.replace(/[^a-z0-9]/g,"-"),
            nombre,
            id;

        if(typeof comp==="string") {
            //Nuevo
            nombre=comp;
            id=v+"-"+this.generarId();
        } else {
            //Restaurar
            nombre=comp.componente;
            id=comp.id;
            if(!id) id=v+"-"+this.generarId();
        }
        
        var obj=componente.fabricarComponente(componentesRegistrados[nombre].fn);

        obj.establecerVista(vista)
            .establecerId(id);

        if(typeof comp==="object") {
            //Restaurar
            obj.establecerNombre(comp.nombre,comp.oculto)
                .establecerPropiedades(comp.propiedades)
                .establecerSelector(comp.selector,false)
                .restaurar();
        } else {
            obj.crear();
        }
        
        instanciasComponentes.push(obj);

        //Evento
        obj.inicializar();
        obj.inicializado();

        return obj;
    };

    /**
     * Elimina un componente dada su instancia. Equivalente a `componente.eliminar()`.
     * @param {componente} componente - Componente a eliminar.
     * @returns {ui}
     */
    this.eliminarComponente=function(componente) {
        componente.eliminar(true);
        return this;
    };

    /**
     * Busca y elimina apropiadamente los componentes descendientes del elemento especificado.
     * @param {Node} elemento - Elemento a analizar. `elemento` *puede ser un componente*.
     * @param {boolean} [eliminarElemento=true] - Si es `true`, luego de eliminar los componentes que pueda contener, también removerá del DOM el nodo
     * especificado en `elemento`.
     * @returns {ui}
     *//**
     * Busca y elimina apropiadamente los componentes descendientes del elemento especificado.
     * @param {NodeList} elemento - Listado de elementos a analizar.
     * @param {boolean} [eliminarElemento=true] - Si es `true`, luego de eliminar los componentes que puedan existir en el listado, también
     * removerá del DOM todos los nodos contenidos en `elemento`.
     * @returns {ui}
     *//**
     * Busca y elimina apropiadamente los componentes descendientes del elemento especificado.
     * @param {Node[]} elemento - Listado de elementos a analizar.
     * @param {boolean} [eliminarElemento=true] - Si es `true`, luego de eliminar los componentes que puedan existir en el listado, también
     * removerá del DOM todos los nodos contenidos en `elemento`.
     * @returns {ui}
     */
    this.eliminarComponentes=function(elemento,eliminarElemento) {
        if(elemento instanceof NodeList||util.esArray(elemento)) {
            Array.from(elemento).forEach(function(item) {
                ui.eliminarComponentes(item,eliminarElemento);
            });
            return this;
        }

        if(elemento.esComponente()) {
            elemento.eliminar(true);
            return this;
        }
        
        //Debemos realizar la búsqueda recursiva un nivel a la vez (en oposición a utilizar directamente querySelectorAll(".componente")), ya
        //que donde se encuentre un componente, componente.eliminar() se encargará de su descendencia, con lo cual no tendría sentido
        //continuar la búsqueda
        if(!elemento.hasChildNodes()) elemento.childNodes.forEach(function(hijo) {
                var componente=ui.obtenerInstanciaComponente(hijo);
                if(componente) {
                    componente.eliminar(true);
                } else {
                    //Nodo común, descender
                    ui.eliminarComponentes(hijo,eliminarElemento);
                }
            });
        if(typeof eliminarElemento==="undefined"||eliminarElemento) elemento.remover();

        return this;
    };

    /**
     * Finaliza las tareas de limpieza tras la eliminación de un componente. Método de uso interno.
     * @param {componente} componente 
     * @returns {ui}
     */
    this.componenteEliminado=function(componente) {
        var i=instanciasComponentes.indexOf(componente);
        if(i>=0) delete instanciasComponentes[i];
        return this;
    };

    /**
     * Devuelve las instancias de los componentes existentes.
     */
    this.obtenerInstanciasComponentes=function(vista) {
        return instanciasComponentes;
    };

    /**
     * Devuelve la instancia de un componente dado su ID, instancia, nombre o elemento del DOM.
     * @param {*} param - Valor a evaluar.
     * @returns {Componente}
     */
    this.obtenerInstanciaComponente=function(param) {
        if(typeof param==="string")
            //Por ID, solo se espera desde el editor, por lo que no es necesario considerar componentes repetidos (bucles, vistas importadas)
            return this.obtenerInstanciaComponente(cuerpo.querySelector("[data-fxid='"+param+"']"));
        
        if(typeof param==="object"&&param.esComponente()) return param;

        if(typeof param==="object"&&param.nodeName) return param.metadato("componente");

        return null;
    };

    /**
     * Devuelve la instancia de un componente dado su ID, instancia, nombre o elemento del DOM (alias de ui.obtenerInstanciaComponente(param)).
     * @param {*} param - Valor a evaluar.
     * @returns {Componente}
     */
    this.componente=function(param) {
        return this.obtenerInstanciaComponente(param);
    };

    /**
     * Elimina la instancia de un componente dado su ID, instancia, nombre o elemento del DOM.
     */
    this.eliminarInstanciaComponente=function(param) {
        return this;
    };

    /**
     * Busca todos los componentes con nombre y devuelve un objeto con sus valores.
     * @param {componenteVista} [vista] - Instancia de la vista. Si se omite, o es `null`, se devolverán todos los campos de la página.
     * @returns {Object}
     */
    this.obtenerValores=function(vista) {
        if(typeof vista==="undefined"||!vista) vista=this.obtenerInstanciaVistaPrincipal();

        //La forma más fácil es solicitárselo a los componentes vista  
        var valores=vista.obtenerValores();

        //Anexar los valores del controlador
        var controlador=vista.obtenerControlador();
        if(controlador) valores=Object.assign(valores,controlador.obtenerValores());

        return valores;
    };

    /**
     * Establece los valores de todos los componentes cuyos nombres coincidan con las propiedades del objeto.
     * @param {Object} valores - Pares nombre/valor a asignar.
     * @param {string} [nombreVista] - Nombre de la vista. Si se omite, se aplicará sobre todos los campos de la página.
     */
    this.establecerValores=function(objeto,nombreVista) {
        if(typeof nombreVista==="undefined") nombreVista=null;

        //La forma más fácil es solicitárselo a los componentes vista  
        instanciasVistas.porCada(function(vista) {
            if(nombreVista&&vista!=nombreVista) return;
            self.obtenerInstanciaVista(vista).establecerValores(objeto);
        });

        return this;
    };

    /**
     * Registra un componente en el almacén global `componentes`.
     * @param {componente} componente - Instancia del componente.
     * @returns {ui}
     */
    this.agregarComponente=function(componente) {
        var nombre=componente.obtenerNombre();
        if(nombre) window.componentes[nombre]=componente;
        return this;
    };

    /**
     * Remueve un componente del almacén global `componentes`.
     * @param {componente} componente - Instancia del componente.
     * @returns {ui}
     */
    this.removerComponente=function(componente) {
        var nombre=componente.obtenerNombre();
        if(nombre&&componentes.hasOwnProperty(nombre)&&componentes[nombre]==componente)
            delete window.componentes[nombre];
        return this;
    };    

    ////Cargar/guardar

    /**
     * Devuelve el HTML de la vista.
     * @param {boolean} [paginaCompleta=true] - Determina si debe devolver el HTML de la página completa o, por el contrario, solo del cuerpo.
     * @returns {string}
     */
    this.obtenerHtml=function(paginaCompleta) {
        if(typeof paginaCompleta==="undefined") paginaCompleta=true;
        
        if(paginaCompleta) return "<!doctype html>"+doc.documentElement.outerHTML;

        return cuerpo.outerHTML;
    };

    /**
     * Devuelve el CSS de la vista.
     */
    this.obtenerCss=function() {
        var css="";
        this.obtenerEstilos().forEach(function(regla) {
            //Omitir reglas vacías
            var totalEstilos=0;

            if(regla.hasOwnProperty("reglas")) {
                regla.reglas.forEach(function(subRegla) {
                    totalEstilos+=subRegla.estilos.length;
                });
            } else {
                totalEstilos=regla.estilos.length;
            }

            if(totalEstilos) css+=regla.texto;
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
     * @reteurns {string}
     */
    this.obtenerJson=function() {
        var resultado={
            version:1,
            componentes:[],
            nombre:nombreVistaPrincipal
        };

        var fn=function(obj) {
            for(var propiedad in obj) {
                if(!obj.hasOwnProperty(propiedad)) continue;
                var elem=obj[propiedad];
                if(elem===null||util.esObjetoVacio(elem)||elem==="") {
                    delete obj[propiedad];
                } else if(typeof elem==="object") {
                    fn(elem);
                }
            }
        };

        instanciasComponentes.forEach(function(obj) {
            var componente=ui.obtenerJsonComponente(obj);
            
            //Eliminar propiedades vacías
            fn(componente);

            resultado.componentes.push(componente);
        });

        return JSON.stringify(resultado);
    };

    /**
     * Genera y devuelve el objeto correspondiente a un componente en particular para ser almacenado en el JSON.
     * @param {*} obj - Instancia o cualquier valor que identifique al componente compatible con obtenerInstanciaComponente().
     * @returns {Object}
     */
    this.obtenerJsonComponente=function(obj) {
        var comp=this.obtenerInstanciaComponente(obj);
        if(!comp) return null;
        return {
            id:comp.obtenerId(),
            nombre:comp.obtenerNombre(),
            selector:comp.obtenerSelector(),
            componente:comp.obtenerTipo(),
            propiedades:comp.obtenerPropiedades()
        };
    };

    /**
     * Inserta el código html en el cuerpo del editor. Este método solo debería utilizarse en modo edición.
     */
    this.reemplazarHtml=function(html) {
        cuerpo.outerHTML=html;
        //Se asume un html con una estructura válida para una vista
        cuerpo=doc.querySelector("#foxtrot-cuerpo");
        return this;        
    };

    /**
     * Almacena el JSON para la vista principal.
     * @param {(Object|string)} valor - Objeto o JSON codificado.
     * @returnos {ui}
     */
    this.establecerJson=function(valor) {
        if(typeof valor==="string") valor=JSON.parse(valor);
        jsonVistaPrincipal=valor;
        return this;  
    };

    /**
     * Inicializa la vista y sus componentes dado su json.
     * @param {(Object|string)} json - Objeto de la vista.
     * @param {controlador} [controlador] - Instancia del controlador de la vista.
     * @param {componenteVista} [vista] - Instancia de la vista.
     * @param {boolean} [soloVista=null] - Si es `true`, buscará e inicializará únicamente el componente de la vista; `false`, solo los
     * componentes excepto la vista; `null` (o la omisión del parámetro) procesará todos los componentes.
     * @aram {boolean} [vistaUnica=false] - Si es `false`, devolverá la instancia existente de la vista (*singleton*).
     * @returns {(string|undefined)}
     */
    this.procesarJson=function(json,controlador,vista,soloVista,vistaUnica) {
        if(typeof json=="string") json=JSON.parse(json);
        if(typeof soloVista=="undefined") soloVista=null;
        if(typeof vistaUnica=="undefined") vistaUnica=false;
        var claveVista;

        //Preparar los componentes
        for(var i=0;i<json.componentes.length;i++) {
            var componente=json.componentes[i];

            if(soloVista!==false&&componente.componente=="vista") {
                var nombreVista=json.nombre;

                //Es única y ya existe
                if(vistaUnica&&instanciasVistas.hasOwnProperty(nombreVista))
                    return nombreVista;

                //No es necesario que sea única, generar un elemento nueuvo en instanciasVistas nueva cada vez
                claveVista=nombreVista;
                if(!vistaUnica) {
                    var i=0;
                    while(instanciasVistas.hasOwnProperty(claveVista+(i>0?"-"+i:"")))
                        i++;
                    claveVista=claveVista+(i>0?"-"+i:"");
                }

                instanciasVistas[claveVista]=ui.crearComponente(componente);
                return claveVista;
            }

            if(soloVista!==true&&componente.componente!="vista") {
                ui.crearComponente(componente,vista);
            }
        }
    };

    /**
     * Inicializa la vista dado su json.
     * @param {(Object|string)} json - Objeto de la vista.
     * @param {controlador} [controlador] - Instancia del controlador de la vista.
     * @returns {componenteVista}
     */
    this.procesarJsonVista=function(json,controlador) {
        if(typeof json=="string") json=JSON.parse(json);
        var clave=this.procesarJson(json,controlador,null,true,false);
        instanciasVistas[clave].establecerNombreVista(json.nombre);
        return instanciasVistas[clave];
    };

    /**
     * Inicializa los componentes de la vista (excepto el componente Vista propiamente dicho) dado su json.
     * @param {(Object|string)} json - Objeto de la vista.
     * @param {controlador} [controlador] - Instancia del controlador de la vista.
     * @param {componenteVista} [vista] - Instancia de la vista.
     * @returns {ui}
     */
    this.procesarJsonComponentes=function(json,controlador,vista) {
        if(typeof json=="string") json=JSON.parse(json);
        return this.procesarJson(json,controlador,vista,false);
    };

    /**
     * Crea la instancia del controlador.
     */
    this.crearControlador=function(nombre,principal) {
        if(typeof principal==="undefined") principal=false;

        var obj=this.obtenerInstanciaControlador(nombre,principal);        
        
        return obj;
    };

    /**
     * Limpia todos los parámetros de la ui.
     */
    this.limpiar=function() {
        instanciasComponentes=[];
        instanciasVistas={};
        nombreVistaPrincipal=null;
        controladores={};
        instanciasControladores={};
        instanciaControladorPrincipal=null;
        id=1;

        //Globales
        window.controladores={};
        window.componentes={};
        window.aplicacion=null;
        window.controlador=null;
        window.principal=null;
        window.parametros=null;

        return this;
    };

    /**
     * Busca el primer componente o elemento con autofoco y da foco al mismo.
     * @param {Node} [elem] - Limitar a la descendencia del elemento especificado.
     * @returns {ui}
     */
    this.autofoco=function(elem) {
        if(typeof elem==="undefined") elem=doc;
        if(!this.esMovil()) {
            setTimeout(function() {
                var elems=elem.querySelectorAll(".autofoco");
                for(var i=0;i<elems.length;i++) {
                    if(elems[i].es({visible:true})) {
                        var comp=ui.obtenerInstanciaComponente(elems[i]);
                        if(comp) {
                            //Componente
                            comp.foco();
                        } else {
                            //Cualquier otro elemento del DOM puede usar la clase .autofoco
                            elems[i].focus();
                            if(typeof elems[i].select==="function") elems[i].select();
                        }
                        break;
                    }
                }
            });
        }
        return this;
    };

    /**
     * Prepara la utilidad de auto-seleccionar-todo el contenido de los campos.
     * @returns {ui}
     */
    this.autoseleccionar=function() {
        if(modoEdicion) return this;
        cuerpo.eventoFiltrado("click focus",{clase:"autoseleccionar"},function(ev) {
            var elemento=this;
            if(this.nodeName!="INPUT"&&this.nodeName!="TEXTAREA") elemento=this.querySelector("input,textarea");
            if(!elemento) return;
            elemento.select();
        });
        return this;
    };

    ////Vistas

    //Cuando hablamos de vistas nos referimos al componente "padre" que es la representación lógica de la maquetación de la misma
    //Este componente puede utilizarse para acceder al DOM o a estilos. Para la lógica de la aplicación, debe utilizarse el controlador.
    //Asimismo, la recomendación es acceder a la vista a través del controlador; los siguientes métodos existen principalmente para 
    //procesos internos de Foxtrot.

    /**
     * 
     */
    this.obtenerInstanciasVistas=function() {
        return instanciasVistas;
    };

    /**
     * 
     */
    this.obtenerInstanciaVista=function(nombre) {
        if(!instanciasVistas.hasOwnProperty(nombre)) return null;
        return instanciasVistas[nombre];
    };

    /**
     * 
     */
    this.establecerNombreVistaPrincipal=function(nombre) {
        nombreVistaPrincipal=nombre;

        //Almacenar en el historial para poder ser utilizado en la navegación
        history.replaceState({vista:nombre},doc.title);

        return this;
    };

    /**
     * 
     */
    this.obtenerNombreVistaPrincipal=function() {
        return nombreVistaPrincipal;
    };

    /**
     * 
     */
    this.obtenerInstanciaVistaPrincipal=function() {
        return instanciaVistaPrincipal;
    };

    /**
     * Devuelve la instancia de la vista (es decir, del componente, no del controlador).
     * @param {string} [nombre] - Nombre de la vista embebible. Si se omite, devolverá la vista principal.
     * @returns {Componente}
     */
    this.vista=function(nombre) {
        //Este método en realidad es un acceso directo a los siguientes métodos:
        if(typeof nombre==="undefined") return this.obtenerInstanciaVistaPrincipal();
        return this.obtenerInstanciaVista(nombre);
    };

    /**
     * Desencadena la actualización de componentes en toda la vista. Este método no redibuja todos los componentes ni reasigna todas las propiedades de cada uno. Está diseñado
     * para poder solicitar a los componentes que se refresquen o vuelvan a cargar determinadas propiedades, como el origen de datos. Cada componente lo implementa, o no, de
     * forma específica.
     * @returns {ui}
     */
    this.actualizar=function() {
        instanciaVistaPrincipal.actualizar();
        return this;
    };

    /**
     * Recarga la página.
     */
    this.recargar=function() {
        window.location.reload();
    };
    
    /**
     * Recupera el código HTML y JSON de una vista embebible y envía un objeto {json,html} a la función especificada.
     * @param {string} nombre - Nombre de la vista.
     * @param {function} retorno - Función de retoro.
     * @param {boolean|string} [precarga="barra"] - Mostrar precarga. TRUE para la precarga normal, "barra" para utilizar la barra de progreso o FALSE para deshabilitar.
     * @returns {ui}
     */
    this.obtenerVistaEmbebible=function(nombre,retorno,precarga) {
        if(typeof precarga==="undefined") precarga="barra";

        //Durante la compilación, las vistas embebibles pueden almacenarse en el objeto _vistasEmbebibles
        if(_vistasEmbebibles.hasOwnProperty(nombre)) {
            retorno({
                json:JSON.parse(_vistasEmbebibles[nombre].json),
                html:_vistasEmbebibles[nombre].html
            });
            return this;
        }

        //Si la vista no fue incorporada, intentaremos recuperarla desde el servidor o archivo
        servidor.invocarMetodo({
            foxtrot:"obtenerVista",
            parametros:[nombre],
            retorno:function(res) {
                if(!res) return;

                //Cargar el CSS (TODO varificar si ya existe)
                ui.agregarHojaEstilos(res.urlCss);

                _vistasEmbebibles[nombre]=res;

                //Cargar el JS si el controlador no existe
                if(!controladores.hasOwnProperty(nombre)) {
                    ui.cargarJs(res.urlJs,function() {
                        retorno({
                            json:JSON.parse(res.json),
                            html:res.html
                        });
                    });
                } else {
                    retorno(res);
                }
            },
            precarga:precarga
        });
        return this;
    };

    ////Controladores

    /**
     * 
     */
    this.registrarControlador=function(nombre,funcion) {
        controladores[nombre]=funcion;
        return this;
    };

    /**
     * Devuelve el controlador de la vista principal.
     */
    this.obtenerInstanciaControladorPrincipal=function() {
        return instanciaControladorPrincipal;
    };

    /**
     * Devuelve la instancia del controlador.
     * @param {string} [nombre] - Nombre del controlador de vista embebible. Si se omite, devolverá el controlador de la vista principal.
     * @returns {Controlador}
     */
    this.controlador=function(nombre) {
        //Este método en realidad es un acceso directo a los siguientes métodos:
        if(typeof nombre==="undefined") return this.obtenerInstanciaControladorPrincipal();
        return this.obtenerInstanciaControlador(nombre);
    };

    /**
     * Devuelve el listado de controladores disponibles.
     */
    this.obtenerControladores=function() {
        return controladores;
    };

    /**
     * Devuelve el listado de controladores instanciados.
     */
    this.obtenerInstanciasControladores=function() {
        return instanciasControladores;
    };

    /**
     * Busca y devuelve un controlador dado su nombre, creándolo si no existe.
     * @param {string} nombre - Nombre del controlador.
     * @param {boolean} [principal=false] - Determina si es el controlador de la vista principal.
     * @param {boolean} [unico=false] - Si es `false`, devolverá la instancia existente en lugar de crear una nueva (*singleton*).
     * @returns {controlador}
     */
    this.obtenerInstanciaControlador=function(nombre,principal,unico) {
        if(typeof principal=="undefined") principal=false;
        if(typeof unico=="undefined") unico=false;

        if(!controladores.hasOwnProperty(nombre)) return null;

        if(unico&&instanciasControladores.hasOwnProperty(nombre)) return instanciasControladores[nombre];
        
        //Si unico=false, siempre generar un nuevo elemento en instanciasControladores
        var clave=nombre,
            i=0;
        if(!unico) {
            while(instanciasControladores.hasOwnProperty(clave+(i>0?"-"+i:"")))
                i++;
            clave=clave+(i>0?"-"+i:"");
        }

        var obj=controlador.fabricarControlador(nombre,controladores[nombre]);

        instanciasControladores[clave]=obj;
        if(principal) instanciaControladorPrincipal=obj;

        //Exportar a global
        window.controladores[clave]=obj;
        if(principal) window.principal=obj;
        
        obj.inicializar();
        //Evento
        obj.inicializado();
        
        return obj;
    };

    /**
     * Devuelve la instancia del controlador para la vista dada. No creará el controlador si no existe.
     * @param {string} nombre - Nombre de la vista.
     * @returns {controlador|null}
     */
    this.obtenerInstanciaControladorVista=function(nombre) {
        //TODO Por el momento, asumimos que el controlador siempre se llama igual que la vista, pero ya queda preparado para que no deba ser así por siempre
        if(instanciasControladores.hasOwnProperty(nombre)) return instanciasControladores[nombre];
        return null;
    };

    ////Módulos

    /**
     * Registra un módulo.
     * @param {string} nombre - Nombre del módulo.
     * @param {function} funcion - Función.
     * @returns {ui}
     */
    this.registrarModulo=function(nombre,funcion) {
        modulos[nombre]=funcion;
        return this;
    };

    /**
     * Crea y devuelve una nueva instancia del módulo especificado.
     * @param {string} nombre - Nombre del módulo.
     * @returns {Modulo}
     */
    this.obtenerInstanciaModulo=function(nombre) {
        return modulo.fabricarModulo(modulos[nombre]);
    };

    ////Gestión de la UI

    /**
     * 
     */
    this.establecerModoEdicion=function() {
        modoEdicion=true;
        marco=document.querySelector("#foxtrot-marco");
        return this;
    };

    /**
     * 
     */
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

    /**
     * Devuelve todos los posibles tamaños con formato {ancho máximo:nombre}.
     */
    this.obtenerTamanosPx=function() {
        return tamanosPx;
    };

    /**
     * Inlcuye un archivo js, invocando el callback cuando el archivo haya sido cargado y ejecutado.
     */
    this.cargarJs=function(ruta,funcion) {
        var script=document.createElement("script");
        script.onload=function() {
            if(!util.esIndefinido(funcion)) funcion.call(ui,ruta);
        };
        script.async=true;
        script.src=ruta;
        document.querySelector("head").appendChild(script);
        return this;
    };

    /**
     * Inlcuye un archivo CSS.
     */
    this.cargarCss=function(ruta) {
        doc.head.anexar(doc.crear("<link rel='stylesheet' href='"+ruta+"'>"));
        return this;
    };

    ////Utilidades

    /**
     * Determina si se está ejecutando en un dispositivo móvil.
     */
    this.esMovil=function() {
        if(esCordova) return true;
        //http://detectmobilebrowsers.com/
        return (function(a) {
            return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4));
        })(navigator.userAgent||navigator.vendor||window.opera);
    };

    /**
     * Evalúa una expresión utilizando el intérprete configurado con diferentes objetos predefinidos relacionados a la interfaz y la aplicación.
     * @param {string} - cadena Cadena a evaluar.
     * @param {Object} [valores] - Valores de las variables en la expresión.
     * @param {*} [valores.objeto] - Valor de `objeto`.
     * @param {controlador} [valores.controlador] - Valor de `controlador`.
     * @param {componente} [valores.componente] - Valor de `componente`.
     * @param {componentes} [valores.componentes=valores.controlador.componentes] - Valor de `componentes`.
     * @param {*} [valores.this] - Valor de `this`, si la expresión resuelve a una función.
     * @param {*} [valores.valor] - Valor de `valor`.
     */
    this.evaluarExpresion=function(cadena,valores) {
        if(typeof cadena==="undefined") return null;
        if(typeof cadena!=="string") return cadena;
        if(typeof valores!=="object") valores={};
        valores=Object.assign({
            objeto:null,
            controlador:null,
            componente:null,
            valor:null,
            componentes:null,
            this:null
        },valores);

        var expr=new expresion(cadena);

        if(valores.objeto) expr.establecerObjeto(valores.objeto);
        if(valores.controlador) expr.establecerControlador(valores.controlador);
        if(valores.componente) expr.establecerComponente(valores.componente);
        if(valores.valor) expr.establecerValor(valores.valor);
        if(valores.componentes) {
            expr.establecerComponentes(valores.componentes);
        } else if(valores.controlador) {
            expr.establecerComponentes(valores.controlador.componentes);
        }
        if(valores.this) expr.establecerThis(valores.this);
            
        return expr.evaluar();
    };

    ////Navegación

    /**
     * Registra un enrutador.
     * @param {string} nombre 
     * @param {function} funcion 
     */
    this.registrarEnrutador=function(nombre,funcion) {
        enrutadores[nombre]=funcion;

        //Creamos la instancia del enrutador, eventualmente la clase de la aplicación deberá definir el enrutador en uso
        instanciaEnrutador=enrutador.fabricarEnrutador(nombre,funcion);
    };

    /**
     * Devuelve la instancia del enrutador.
     */
    this.obtenerEnrutador=function() {
        return instanciaEnrutador;
    };

    /**
     * Devuelve la instancia del enrutador (alias de ui.obtenerEnrutador()).
     */
    this.enrutador=function() {
        return this.obtenerEnrutador();
    };

    /**
     * 
     */
    this.procesarUrl=function(url) {
        var resultado={
            url:url,
            vista:null
        };
        if(!/^https?:\/\//i.test(url)) {
            //Obtener URL de la vista dado su nombre
            var nombre=url,
                parametros="",
                p=url.indexOf("?");
            if(p>=0) {
                nombre=url.substring(0,p);
                parametros=url.substring(p);
            }
            nombre=util.trim(nombre,"\\/");
            resultado.url=instanciaEnrutador.obtenerUrlVista(nombre)+parametros;
            resultado.vista=nombre;
        }
        return resultado;
    };

    /**
     * Navega a la vista o URL especificada.
     * @param {string} ruta - URL o nombre de vista de destino.
     * @param {boolean} [nuevaVentana=false] - Abrir en una nueva ventana.
     * @returns {ui}
     */
    this.irA=function(ruta,nuevaVentana) {
        if(typeof nuevaVentana==="undefined") nuevaVentana=false;

        var destino=this.procesarUrl(ruta);

        if(nuevaVentana) {
            if(!/^https?:\/\//i.test(destino.url)) destino.url=this.obtenerUrlBase()+destino.url;
            window.open(destino.url);
        } else {
            //Evento
            if(ejecutarEvento("navegacion",null,[destino.vista])) return;

            window.location.href=destino.url;
        }

        return this;
    };

    /**
     * Cambia la URL hacia la vista o URL especificada, sin navegar hacia ella.
     * @param {string} ruta - URL o nombre de vista de destino.
     * @param {boolean} [nuevaVentana=false] - Abrir en una nueva ventana.
     * @returns {ui}
     */
    this.noIrA=function(ruta,nuevaVentana) {
        if(typeof nuevaVentana==="undefined") nuevaVentana=false;

        ui.cerrarMenu();

        //Si se solicitó abrir en una nueva ventana, el efecto es el mismo que el de irA()
        if(nuevaVentana) return this.irA(ruta,true);

        var fn=function() {        
            var destino=ui.procesarUrl(ruta);
            ui.cambiarUrl(destino.url,{vista:destino.vista});
            //Preprocesar parámetros de la URL
            ui.obtenerParametros();
        };

        if(confirmarSalidaActivado) {
            //Confirmar navegación (onbeforeunload no tiene efecto al cambiar la URL)
            ui.confirmar(confirmarSalidaMensaje,function(r) {
                if(r) fn();
            },{icono:"pregunta"});
        } else {
            fn();
        }
        
        return this;
    };

    /**
     * Vuelve a la URL anterior. Este método no invoca el evento 'volver'.
     * @returns {ui}
     */
    this.volver=function() {
        var fn=function() {
            history.go(-1);

            urlModificada--;
            if(urlModificada<0) urlModificada=0;

            procesarOnPopState();
        };

        if(urlModificada>0&&confirmarSalidaActivado) {
            //Confirmar navegación (onbeforeunload no tiene efecto si ha cambiado la URL)
            ui.confirmar(confirmarSalidaMensaje,function(r) {
                if(r) fn();
            },{icono:"pregunta"});
        } else {
            fn();
        }        

        return this;
    };

    /**
     * Cambia la URL sin navegar hacia la misma.
     * @param {string} url - URL de destino.
     * @param {Object} [estado=null] - Estado.
     * @returns {ui}
     */
    this.cambiarUrl=function(url,estado) {
        if(typeof estado==="undefined") estado=null;

        win.history.pushState(estado,null,url);

        urlModificada++;

        procesarOnPopState();

        return this;
    };

    /**
     * Abre una ventana emergente con la vista o URL especificada.
     * @param {string} ruta - URL o nombre de vista de destino.
     * @returns {Window}
     */
    this.abrirVentana=function(ruta) {
        var ancho=window.ancho()*.75,
            alto=window.alto();
        return window.open(this.procesarUrl(ruta).url,util.cadenaAzar(),"height="+alto+",width="+ancho+",toolbar=no,menubar=no,location=no");
    };

    /**
     * Inicia la descarga de la URL especificada.
     * @param {string} url - URL.
     * @returns {ui}
     */
    this.descargar=function(url) {
        var a=doc.crear("<a download>")
            .atributo("href",url)
            .anexarA(body);
        a.click();
        a.remover();
        return this;
    };

    /**
     * Activa o desactiva el diálogo de confirmación antes de navegar a otra URL o salir de la vista actual.
     * @param {boolean} [activar=true] - Activa (`true`) o desactiva (`false`) este comportamiento.
     * @param {string} [mensaje="¿Estás seguro de querer continuar?"] - Mensaje. Nótese que cuando se utiliza el diálogo nativo, la mayoría de los
     * navegadores actualmente ignora este texto.
     * @returns {ui}
     */
    this.confirmarSalida=function(activar,mensaje) {
        if(typeof activar==="undefined") activar=true;
        if(typeof mensaje==="undefined") mensaje="¿Estás seguro de querer continuar?";
        window.onbeforeunload=activar?function() {
            return mensaje;
        }:null;
        confirmarSalidaActivado=activar;
        confirmarSalidaMensaje=mensaje;
        return this;
    };

    ////Eventos

    /**
     * Procesa el evento `popstate`.
     * @param {PopStateEvent} [evento] 
     */
    var procesarOnPopState=function(evento) {
        //TODO Por el momento, solo soportamos la navegación entre vistas mediante popState. Debería ser posible determinar la vista a partir
        //de la URL inicial, lo cual, por el momento, sucede exclusivamente del lado del servidor
        
        var vista;
        if(typeof evento!=="undefined"&&evento.state&&evento.state.hasOwnProperty("vista")) {
            vista=evento.state.vista;
        } else {
            vista=instanciaEnrutador.obtenerNombreVista(window.location.href);
        }

        //Evento
        if(ejecutarEvento("navegacion",null,[vista])) return;

        //El cambio de URL no tiene otro efecto
    };

    /**
     * Procesa el evento `resize`.
     * @param {Event} [evento] 
     */
    var procesarResize=function(evento) {
        //El evento se transmite a la visa y a los componentes solo cuando cambie el tamaño de pantalla
        var tamano=ui.obtenerTamano();
        if(tamano!=tamanoActual) {
            body.removerClase(/^tamano-.+/)
                .agregarClase("tamano-"+tamano);
                      
            if(ejecutarEvento("tamano",null,[tamano,tamanoActual])) return;
        }
        tamanoActual=tamano;
    };

    /**
     * Establece los eventos globales de la interfaz.
     * @returns {ui}
     */
    this.establecerEventos=function() {
        if(modoEdicion) return this;

        if(esCordova) {
            document.addEventListener("deviceready",function() {
                document.addEventListener("backbutton",function() {
                    //Cerrar todos los menú y diálogos

                    if(self.obtenerMenuAbierto().length) {
                        ui.cerrarMenus();
                        return;
                    }

                    var dialogo=self.obtenerDialogoAbierto();
                    if(dialogo) {
                        if(!dialogo.param.modal) ui.cerrarDialogo();
                        return;
                    }

                    //Pasar el evento a los controladores y componentes                        
                    if(ejecutarEvento("volver")) return;

                    //Si la URL cambió, volver
                    if(urlModificada>0) {
                        self.volver();
                        return;
                    }

                    //Por último, cerrar la aplicación
                    ui.salir();
                },false);                
            },false);
        }

        win.addEventListener("popstate",procesarOnPopState);
        win.addEventListener("resize",procesarResize);   
        
        return this;
    };

    /**
     * Invoca el método correspondiente al evento en todos los controladores. Devuelve `true` si la propagación del evento fue detenida.
     * @param {string} nombre - Nombre del evento.
     * @param {*} [params] - Parámetros a pasar al método.
     * @param {controlador} [obj] - Ejecutar solo en un controlador en particular, dada su instancia.
     * @returns {boolean}
     */
    this.evento=function(nombre,params,obj) {
        if(typeof obj==="undefined") obj=null;
        if(typeof params==="undefined") params=null;

        var metodo=instanciaAplicacion[nombre],
            retorno;
        if(typeof metodo!=="function") return false;
        if(params) {
            retorno=metodo.apply(instanciaAplicacion,params);
        } else {
            retorno=metodo.call(instanciaAplicacion);
        }
        //El método puede devolver true para detener el evento
        if(typeof retorno==="boolean"&&retorno) return true;

        //Controladores de vistas
        for(var control in instanciasControladores) {
            if(!instanciasControladores.hasOwnProperty(control)||(obj&&obj!=instanciasControladores[control])) continue;

            var obj=instanciasControladores[control],
                metodo=obj[nombre],
                retorno;
            if(typeof metodo!=="function") continue;
            if(params) {
                retorno=metodo.apply(obj,params);
            } else {
                retorno=metodo.call(obj);
            }

            //El método puede devolver true para detener el evento
            if(typeof retorno==="boolean"&&retorno) return true;
        }

        return false;
    };

    /**
     * Invoca el método correspondiente al evento en todos los componentes.
     * @param {Object} origen - Repositorio de componentes. Especificar `null` para ejecutar en todos los componentes del sistema.
     * @param {string} nombre - Nombre del evento.
     * @param {boolean} [soloImplementados=false] - Si es `true`, solo invocará aquellos métodos implementados en el componente concreto (no invocará métodos heredados).
     * @param {*} [params] - Parámetros a pasar al método.
     * @returns {boolean}
     */
    this.eventoComponentes=function(origen,nombre,soloImplementados,params) {
        if(typeof soloImplementados==="undefined") soloImplementados=false;
        if(typeof params==="undefined") params=null;

        var listado=origen?origen:instanciasComponentes;

        for(var comp in listado) {
            if(!listado.hasOwnProperty(comp)) continue;

            if(soloImplementados&&!listado[comp].hasOwnProperty(nombre)) continue;

            var obj=listado[comp],
                metodo=obj[nombre],
                retorno;
            if(params) {
                retorno=metodo.apply(obj,params);
            } else {
                retorno=metodo.call(obj);
            }

            //El método puede devolver true para detener el evento
            if(typeof retorno==="boolean"&&retorno) return true;
        }
        
        return false;
    };

    /**
     * Función útil de uso interno para los casos en que se invocan `eventoComponentes()` y `evento()` en cadena. Devuelve `true` si el evento
     * se debe detener.
     */
    var ejecutarEvento=function(nombre,origenComponentes,params) {
        if(typeof origenComponentes==="undefined") origenComponentes=null;
        if(ui.eventoComponentes(origenComponentes,nombre,true,params)) return true;
        if(ui.evento(nombre,params)) return true;
        return false;
    };

    ////Inicialización y ejecución del cliente

    /**
     * 
     */
    this.establecerCordova=function() {
        esCordova=true;
        urlBase=localStorage.getItem("_urlBase");
        document.head.anexar(document.crear("base").atributo("href",urlBase));
        return this;
    };

    /**
     * Si es Cordova o cliente de escritorio, cierra la aplicación.
     * @returns {ui}
     */
    this.salir=function() {
        if(esCordova) navigator.app.exitApp();
        //TODO Escritorio
        return this;
    };

    /**
     * Devuelve los parámetros de la URL.
     * @returns {Object}
     */
    this.obtenerParametros=function() {
        var url=window.location.href,
            p=url.indexOf("?");
        if(p<0) return {};
        var resultado={};
        url.substring(p+1).split("&").forEach(function(parte) {
            var p=parte.indexOf("=");
            if(p<0) {
                resultado[decodeURIComponent(parte).toLowerCase()]=true;
            } else {
                resultado[decodeURIComponent(parte.substring(0,p)).toLowerCase()]=decodeURIComponent(parte.substring(p+1));
            }
        });
        //Exportar a global
        window.parametros=resultado;
        return resultado;
    };

    /**
     * Devuelve el valor de un parámetro de la URL, o null si no existe.
     * @param {string} nombre 
     * @returns {(string|null)}
     */
    this.obtenerParametro=function(nombre) {
        var params=this.obtenerParametros();
        if(!params.hasOwnProperty(nombre.toLowerCase())) return null;
        return params[nombre];
    };

    /**
     * Inicializa el sistema.
     */
    this.inicializar=function(nombreVista,opciones) {
        opciones=Object.assign({
            cordova:false
        },opciones);

        //Si estamos en el marco del editor, utilizar los objetos de la ventana principal
        if(window.parent.ui!=ui&&window.parent.ui.enModoEdicion()) {
            modoEdicion=true;
            ui=window.parent.ui;
            ui.preparar(document);
            ui.inicializar(nombreVista,opciones);
            //Agregar referencia al editor dentro del marco
            window.editor=window.parent.editor;
            return ui;
        }

        if(opciones.cordova) this.establecerCordova();

        //Mostrar barra de precarga, excepto en Cordova
        if(!modoEdicion&&!esCordova) {
            this.mostrarPrecarga("barra");
        }

        this.establecerNombreVistaPrincipal(nombreVista);

        return this;
    };

    /**
     * Prepara las referencias al documento.
     */
    this.preparar=function(nuevoDoc) {
        win=nuevoDoc.defaultView;
        doc=nuevoDoc;
        body=doc.body;
        cuerpo=doc.querySelector("#foxtrot-cuerpo");
        return this;
    };

    /**
     * Inicializa la vista y ejecuta su controlador.
     * @param {string} nombre - Nombre de la vista.
     * @param {boolean} principal - Determina si se trata de la vista principal.
     * @param {Object} [json] - Objeto JSON decodificado de la vista.
     * @param {string} [html] - Código HTML, en caso de tratarse de una vista secundaria.
     * @param {Node|Element} [destino] - Elemento de destino, en caso de tratarse de una vista secundaria.
     * @param {function} [retorno] - Función de retorno.
     * @returns {ui}
     */
    this.ejecutarVista=function(nombre,principal,json,html,destino,retorno) {
        //Por el momento, el controlador es el que tiene el mismo nombre que la vista
        var controlador=ui.crearControlador(nombre,principal);

        if(typeof html==="string"&&typeof destino!=="undefined") {
            //Remover #foxtrot-cuerpo del HTML, ya que solo debería tener ese ID la vista principal
            html=html.replace(/ id="foxtrot-cuerpo"/,"");
            destino.establecerHtml(html);
        }
        
        if(typeof json==="undefined") json=jsonVistaPrincipal;        
        
        var vista=this.procesarJsonVista(json,controlador);

        if(principal) {
            instanciaVistaPrincipal=vista;
            vista.establecerPrincipal();
            //La vista principal utilizará el cuerpo principal, vistas secundarias pueden utilizar otros contenedores
            vista.establecerElemento(cuerpo);
        } else {
            vista.establecerElemento(destino.querySelector(".componente.vista"));
        }
        vista.inicializar();
        
        //Asociamos la vista y el controlador para que, llegado el caso de que los nombres de vista y controlador puedan diferir, quede desacoplado
        //cualquier otro lugar que se necesite conocer el controlador *actual* de la vista.
        controlador.establecerVista(vista);
        controlador.establecerAplicacion(instanciaAplicacion);
        vista.establecerControlador(controlador);
        
        this.procesarJsonComponentes(json,controlador,vista);
        
        //Exportar a global
        window.controlador=controlador;
        
        //Evento 'listo'
        var listo=function() {
            if(principal) {
                //Al cargar la vista principal el evento Listo es invocado en todo el sistema
                ui.evento("listo");
            } else {
                //Al cargar una vista secundaria, solo en la misma
                ui.eventoComponentes(controlador.obtenerComponentes(),"listo");
                controlador.listo();
            }

            //Ejecutar un evento 'tamaño' para que, en caso de que la vista requiera realizar un ajuste inicial en base al tamaño de pantalla, no deba realizarlo
            //necesariamente en 'listo'
            var tamano=ui.obtenerTamano();
            if(principal) {
                if(!ui.evento("tamano",[tamano,null]))
                ui.eventoComponentes(null,"tamano",false,[tamano,null]);
            } else {
                controlador.tamano(tamano,tamano);
                ui.eventoComponentes(controlador.obtenerComponentes(),"tamano",false,[tamano,null]);
            }
        };
        
        if(esCordova) {                
            document.addEventListener("deviceready",listo,false);
        } else {
            listo();
        }

        this.autofoco();
        this.autoseleccionar();

        if(typeof retorno==="function") retorno(controlador,vista);

        return this;
    };

    /**
     * Finaliza la ejecución de la vista e invoca el evento `fin` en su controlador y sus componentes.
     * @param {componenteVista} vista - Vista.
     * @returns {ui}
     */
    this.finalizarVista=function(vista) {
        var ctl=vista.obtenerControlador();
        if(ctl) {
            this.eventoComponentes(ctl.obtenerComponentes(),"fin");
            this.evento("fin",null,ctl);
        }
        return this;
    };

    /**
     * Elimina todas las referencias a la vista, su controlador y sus componentes. Se espera el llamado a este método desde el controlador
     * tras responder al evento `fin`.
     * @param {componenteVista} vista - Vista.
     * @returns {ui}
     */
    this.vistaFinalizada=function(vista) {
        //Ignorar en la vista principal (nunca debería suceder)
        if(vista.esPrincipal()) return this;

        //Eliminar referencias al controlador
        var controlador=vista.obtenerControlador();
        if(controlador) {
            for(var clave in instanciasControladores) {
                if(instanciasControladores.hasOwnProperty(clave)&&instanciasControladores[clave]==controlador) {
                    delete instanciasControladores[clave];
                    break;
                }
            }
        }

        //Eliminar componentes
        this.eliminarComponentes(vista.obtenerHijos());

        //Eliminar referencias a la vista
        for(var clave in instanciasVistas) {
            if(instanciasVistas.hasOwnProperty(clave)&&instanciasVistas[clave]==vista) {
                delete instanciasVistas[clave];
                break;
            }
        }

        return this;
    };

    /**
     * Inicia la ejecución del sistema.
     * @returns {ui}
     */
    this.ejecutar=function() {
        if(modoEdicion) {
            //En modo de edición, procesar el JSON y pasar el control al editor

            var vista=this.procesarJsonVista(jsonVistaPrincipal);
            instanciaVistaPrincipal=vista;            
            vista.establecerElemento(cuerpo);
            this.procesarJsonComponentes(jsonVistaPrincipal,null,vista);

            editor.ejecutar();

            body.agregarClase("escritorio");
        } else {
            var esMovil=this.esMovil();
            if(esMovil) {
                body.agregarClase("movil");
            } else {                
                body.agregarClase("escritorio");
            }

            if(esCordova) {
                doc.documentElement.agregarClase("cordova");
                body.agregarClase("cordova");
            }

            //Preprocesar parámetros de la URL
            this.obtenerParametros();

            this.ejecutarVista(nombreVistaPrincipal,true);

            if(!esCordova) {
                this.ocultarPrecarga("barra");
            }
        }

        this.establecerEventos();

        tamanoActual=ui.obtenerTamano();
        body.agregarClase("tamano-"+this.obtenerTamano());

        var listo=function() {
            //El evento Listo en los componentes se ejecuta incluso en modo edición
            ui.eventoComponentes(null,"listo");
        };

        if(esCordova) {
            var contenedor=doc.querySelector("#contenedor-cordova");
            if(contenedor) contenedor.agregarClase("listo");
            
            document.addEventListener("deviceready",listo,false);
        } else {
            listo();
        }

        //Simular Cordova (integración con el gestor de aplicaciones)
        if(esCordova&&localStorage.getItem("_simularCordova"))
            document.dispatchEvent(new Event("deviceready"));

        return this;
    };
}();

/**
 * Plantilla para los objetos de configuración a utilizar en ui.registrarComponente().
 */
var configComponente={
    nombre: null,
    descripcion: null,
    etiqueta: null,
    icono: null,
    /**
     * aceptaHijos:
     * - true               Cualquiera
     * - false              Ninguno
     * - [ nombre, ... ]    Nombre de componentes que acepta como hijos
     */
    aceptaHijos: true,
    /**
     * padre:
     * - true               Cualquiera
     * - [ nombre, ... ]    Nombre de componentes que dentro de los cuales se puede insertar
     */
    padre: true,
    grupo:null
};

/**
 * @var {componente[]} componentes - Instancias de componentes con nombre.
 * @var {controlador[]} controladores - Instancias de controladores cargados.
 * @var {aplicacion} aplicacion - Instancias del controlador de la aplicación.
 * @var {controlador} controlador - Instancia del controlador de la vista actual.
 * @var {controlador} principal - Instancia del controlador de la vista actual. A diferencia de `controlador`, cuando se trabaje con
 * vistas embebibles corresponderá siempre a la vista principal.
 * @var {Object} parametros - Parámetros de la URL actual (GET).
 */
var controladores={},
    componentes={},
    aplicacion=null,
    controlador=null,
    principal=null,
    parametros=null;

var _vistasEmbebibles={};

window["ui"]=ui;
window["componentes"]=componentes;
window["controladores"]=controladores;
window["parametros"]=parametros;
window["aplicacion"]=aplicacion;
window["controlador"]=controlador;
window["principal"]=principal;

//Evitar que los links <a href="#"> naveguen antes de que se hayan asignado los controladores de eventos
document.body.eventoFiltrado("click",{atributos:{href:"#"}},function(ev) {
    ev.preventDefault();
});