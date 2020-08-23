/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 "use strict";

/**
 * Objeto de gestión de la interfaz.
 * @typedef ui
 */

/**
 * Métodos de gestión de la interfaz.
 */
var ui=new function() {
    "use strict";

    ////Almacenes y parámetros

    var self=this,
        componentesRegistrados={},
        instanciasComponentes=[],
        instanciasComponentesId={},
        controladores={},
        instanciasControladores={},
        instanciaControladorPrincipal=null,
        modoEdicion=false,
        id=1,
        tamanos={ //TODO Configurable
            xl:1200,
            lg:992,
            md:768,
            sm:576,
            xs:0
        },
        urlBase=null,
        esCordova=false,
        instanciasVistas={},
        nombreVistaPrincipal=null,
        enrutadores={},
        instanciaEnrutador=null,
        instanciaAplicacion=null,
        urlModificada=0,
        jsonVistaPrincipal=null;

    ////Elementos del dom

    var win=window,
        doc=document,
        body=doc.body,
        cuerpo=doc.querySelector("#foxtrot-cuerpo"),
        estilos=null,
        marco=null;

    ////Acceso a variables generales

    this.obtenerMarco=function() {
        return marco;
    };

    this.obtenerDocumento=function() {
        return doc;
    };

    this.obtenerCuerpo=function(vista) {
        if(typeof vista==="undefined") return cuerpo;

        //Buscar cuerpo de una vista secundaria (embebida)
        if(instanciasVistas.hasOwnProperty(vista)) return instanciasVistas[vista].obtenerElemento();
    };

    this.obtenerElementoEstilos=function() {
        return estilos;
    };

    this.obtenerUrlBase=function() {
        return urlBase;
    };

    this.esCordova=function() {
        return esCordova;
    };

    ////Estilos

    this.obtenerEstilos=function(selector,tamano,origen) {        
        if(util.esIndefinido(selector)) selector=null;
        if(util.esIndefinido(tamano)) tamano=null;

        if(tamano=="xs") tamano="g";

        var raiz=false;
        if(util.esIndefinido(origen)) {
            raiz=true;
            origen=estilos.cssRules;
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
            
            reglas.push(obj);
        }

        //Si se filtró por tamaño, devolver solo las reglas del mismo
        if(tamano) {
            var res=[];
            for(var i=0;i<reglas.length;i++) {
                //Media query
                if(reglas[i].hasOwnProperty("tamano")) {
                    if(reglas[i].tamano==tamano) return reglas[i].reglas;
                    continue;
                }
                if(tamano=="g") res.push(reglas[i]);
            }
            return res;            
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
            hoja=estilos,
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
       
        if(!css) css="";
        hoja.insertRule(
                selector+"{"+css+"}",
                //Insertar las reglas globales antes del primer mediaquery
                tamano=="xs"||tamano=="g"?indicePrimerMedia:reglas.length
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
        instanciaAplicacion.inicializar()
            //Evento
            .inicializado();
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

        var clase="."+nombreVistaPrincipal.replace(/[^a-z0-9-]/,"-")+"-";

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
     * @param {(Object|string)} comp - Nombre del componente u objeto que representa el componente, si se está creando un componente previamente guardado (desde JSON).
     * @param {string} [vista] - Nombre de la vista.
     * @returns {Componente}
     */
    this.crearComponente=function(comp,vista) {
        if(typeof vista==="undefined") vista=nombreVistaPrincipal;
        var v=vista.replace(/[^a-z0-9]/g,"-");

        var nombre,id;
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

        obj.establecerNombreVista(vista)
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
        
        var i=instanciasComponentes.push(obj);

        //Índice
        instanciasComponentesId[id]=i-1;

        //Agregar al controlador
        var controlador=this.obtenerInstanciaControladorVista(vista);
        if(controlador) controlador.agregarComponente(obj); //el controlador puede no existir, por ejemplo en el editor

        //Evento
        obj.inicializar()
            .inicializado();

        return obj;
    };

    /**
     * Devuelve las instancias de los componentes existentes.
     */
    this.obtenerInstanciasComponentes=function(vista) {
        return instanciasComponentes;
    };

    /**
     * Devuelve el ID de un componente dado su ID, instancia, nombre o elemento del DOM.
     */
    function identificarComponente(param) {
        if(typeof param=="string"&&instanciasComponentesId.hasOwnProperty(param)) {
            //Por ID
            return instanciasComponentes[instanciasComponentesId[param]].obtenerId();
        } if(typeof param=="string"&&componentes.hasOwnProperty(param)) {
            //Por nombre
            return componentes[param].obtenerId();
        } else if(typeof param==="object"&&param.esComponente()) {
            return param.obtenerId();
        } else if(typeof param==="object"&&param.nodeName) { //TODO Agregar Object.esNodo()
            return param.dato("fxid");
        }

        //if(typeof param==="number"||!isNaN(parseInt(param))) return parseInt(param);
        //if(typeof param==="string"&&componentes.hasOwnProperty(param)) return componentes[param];
        //if(param instanceof Node) return param.dato("fxid"); TODO ¿Revisar?
        
        return null;
    }

    /**
     * Devuelve la instancia de un componente dado su ID, instancia, nombre o elemento del DOM.
     * @param {*} param - Valor a evaluar.
     * @returns {Componente}
     */
    this.obtenerInstanciaComponente=function(param) {
        var id=identificarComponente(param);    
        if(!id) return null;    
        return instanciasComponentes[instanciasComponentesId[id]];
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
        var id=identificarComponente(param);
        if(!id) return this;

        delete instanciasComponentes[instanciasComponentesId[id]];
        delete instanciasComponentesId[id];
        
        return this;
    }

    /**
     * Busca todos los componentes con nombre y devuelve un objeto con sus valores.
     * @param {string} [nombreVista] - Nombre de la vista. Si se omite, se devolverán todos los campos de la página.
     * @returns {Object}
     */
    this.obtenerValores=function(nombreVista) {
        if(typeof nombreVista==="undefined") nombreVista=null;

        //La forma más fácil es solicitárselo a los componentes vista  
        var valores=this.obtenerInstanciaVistaPrincipal().obtenerValores();

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
        instanciasVistas.forEach(function(vista) {
            if(nombreVista&&vista!=nombreVista) return;
            self.obtenerInstanciaVista(vista).establecerValores(objeto);
        });

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
     * @param {Object|string} valor - Objeto o JSON codificado.
     * @returnos {ui}
     */
    this.establecerJson=function(valor) {
        if(typeof valor==="string") valor=JSON.parse(valor);
        jsonVistaPrincipal=valor;
        return this;  
    };

    /**
     * Inicializa la vista y sus componentes dado su json.
     * @param {Object} json - Objeto (JSON de la vista decodificado).
     * @param {controlador} [controlador] - Instancia del controlador de la vista.
     * @returns {ui}
     */
    this.procesarJson=function(json,controlador) {
        var nombreVista=json.nombre,
            fn=function(componente) {
                var obj=ui.crearComponente(componente,nombreVista);
                return obj;
            };

        //Preparar los componentes
        json.componentes.forEach(function(componente) {
            var obj=fn(componente);

            //Almacenar en cache de instancias
            if(componente.componente=="vista") instanciasVistas[nombreVista]=obj;
        });

        return this;  
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
        instanciasComponentesId={};
        instanciasVistas={};
        nombreVistaPrincipal=null;
        controladores={};
        instanciasControladores={};
        instanciaControladorPrincipal=null;
        id=1;
        return this;
    };

    ////Vistas

    //Cuando hablamos de vistas nos referimos al componente "padre" que es la representación lógica de la maquetación de la misma
    //Este componente puede utilizarse para acceder al DOM o a estilos. Para la lógica de la aplicación, debe utilizarse el controlador.
    //Asimismo, la recomendación es acceder a la vista a través del controlador; los siguientes métodos existen principalmente para 
    //procesos internos de Foxtrot.

    this.obtenerInstanciasVistas=function() {
        return instanciasVistas;
    };

    this.obtenerInstanciaVista=function(nombre) {
        if(!instanciasVistas.hasOwnProperty(nombre)) return null;
        return instanciasVistas[nombre];
    };

    this.establecerNombreVistaPrincipal=function(nombre) {
        nombreVistaPrincipal=nombre;

        //Almacenar en el historial para poder ser utilizado en la navegación
        history.replaceState({vista:nombre},doc.title);

        return this;
    };

    this.obtenerNombreVistaPrincipal=function() {
        return nombreVistaPrincipal;
    };

    this.obtenerInstanciaVistaPrincipal=function() {
        return instanciasVistas[nombreVistaPrincipal];
    };

    this.vista=function() {
        return this.obtenerInstanciaVistaPrincipal();
    };

    /**
     * Desencadena la actualización de componentes en toda la vista. Este método no redibuja todos los componentes ni reasigna todas las propiedades de cada uno. Está diseñado
     * para poder solicitar a los componentes que se refresquen o vuelvan a cargar determinadas propiedades, como el origen de datos. Cada componente lo implementa, o no, de
     * forma específica.
     */
    this.actualizar=function() {
        instanciasVistas[nombreVistaPrincipal].actualizar();
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
     * Acceso directo a la instancia del controlador de la vista principal (alias de ui.obtenerInstanciaControladorPrincipal()).
     */
    this.controlador=function() {
        return this.obtenerInstanciaControladorPrincipal();
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
     */
    this.obtenerInstanciaControlador=function(nombre,principal) {
        if(util.esIndefinido(principal)) principal=false;

        if(!controladores.hasOwnProperty(nombre)) return null;
        
        if(instanciasControladores.hasOwnProperty(nombre)) return instanciasControladores[nombre];

        var obj=controlador.fabricarControlador(nombre,controladores[nombre]);

        instanciasControladores[nombre]=obj;
        if(principal) instanciaControladorPrincipal=obj;
        
        obj.inicializar()
            //Evento
            .inicializado();
        
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

    ////Gestión de la UI

    this.establecerModoEdicion=function() {
        modoEdicion=true;
        marco=document.querySelector("#foxtrot-marco");
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
     * @param {string} cadena Cadena a evaluar.
     * @param {Object} [variables] Variables adicionales.
     * @param {Object} [funciones] Funciones adicionales.
     */
    this.evaluarExpresion=function(cadena,variables,funciones) {
        //Agregar al intérprete el controlador y otros objetos y funciones útiles
        var vars={
            ui:ui,
            util:util,
            aplicacion:instanciaAplicacion,
            controlador:instanciaControladorPrincipal,
            componentes:componentes
        };
        if(instanciasControladores) instanciasControladores.forEach(function(nombre,obj) {
                vars[nombre]=obj;
            });
        if(typeof variables!=="undefined") Object.assign(vars,variables);

        var funcs={
        };
        if(typeof funciones!=="undefined") Object.assign(funcs,funciones);

        expresion.establecerVariablesGlobales(vars);
        expresion.establecerFuncionesGlobales(funcs);

        return expresion.evaluar(cadena);
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
     * @returns {ui}
     */
    this.irA=function(ruta) {
        var destino=this.procesarUrl(ruta);

        //Evento
        //Pasar a los controladores y componentes
        //Si un método devolvió true, detener
        if(ui.evento("navegacion",[destino.vista])||ui.eventoComponentes(null,"navegacion",true,[destino.vista])) return;

        window.location.href=destino.url;
        return this;
    };

    /**
     * Cambia la URL hacia la vista o URL especificada, sin navegar hacia ella.
     * @param {string} ruta - URL o nombre de vista de destino.
     * @returns {ui}
     */
    this.noIrA=function(ruta) {
        var destino=this.procesarUrl(ruta);
        this.cambiarUrl(destino.url,{vista:destino.vista});
        return this;
    };

    /**
     * Vuelve a la URL anterior. Este método no invoca el evento 'volver'.
     * @returns {ui}
     */
    this.volver=function() {
        history.go(-1);

        urlModificada--;
        if(urlModificada<0) urlModificada=0;

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

        //Evento
        //Pasar a los controladores y componentes
        //Si un método devolvió true, detener
        if(ui.evento("navegacion",[estado.vista])||ui.eventoComponentes(null,"navegacion",true,[estado.vista])) return;

        //El cambio de URL no tiene otro efecto

        return this;
    };

    /**
     * Abre una ventana emergente con la vista o URL especificada.
     * @param {string} ruta - URL o nombre de vista de destino.
     */
    this.abrirVentana=function(ruta) {
        var ancho=window.ancho()*.75,
            alto=window.alto();
        return window.open(this.procesarUrl(ruta).url,util.cadenaAzar(),"height="+alto+",width="+ancho+",toolbar=no,menubar=no,location=no");
    };

    ////Eventos

    /**
     * Procesa el evento 'popstate'.
     * @param {PopStateEvent} evento 
     */
    var procesarOnPopState=function(evento) {
        //Por el momento, solo soportamos la navegación entre vistas mediante popState.
        //TODO Debería ser posible determinar la vista a partir de la URL inicial, lo cual, por el momento, sucede exclusivamente del lado del servidor
        if(evento.state&&evento.state.hasOwnProperty("vista")) {
            //Evento
            //Pasar a los controladores y componentes
            //Si un método devolvió true, detener
            if(ui.evento("navegacion",[evento.state.vista])||ui.eventoComponentes(null,"navegacion",true,[evento.state.vista])) return;

            //El cambio de URL no tiene otro efecto
        }
    };

    /**
     * Establece los eventos globales de la interfaz.
     * @returns {ui}
     */
    this.establecerEventos=function() {
        if(esCordova) {
            document.addEventListener("deviceready",function() {
                document.addEventListener("backbutton",function() {
                    //Cerrar todos los menú y diálogos

                    if(self.obtenerMenuAbierto().length) {
                        ui.cerrarMenus();
                        return;
                    }

                    if(self.obtenerDialogoAbierto()) {
                        ui.cerrarDialogo();
                        return;
                    }

                    //Pasar el evento a los controladores y componentes
                    //Si un método devolvió true, detener
                    if(ui.evento("volver")||ui.eventoComponentes(null,"volver",true)) return;

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
    };

    /**
     * Invoca el método correspondiente al evento en todos los controladores.
     * @param {string} nombre - Nombre del evento.
     * @param {*[]} [params] - Parámetros a pasar al método.
     * @returns {boolean}
     */
    this.evento=function(nombre,params) {
        //Controladores de vistas
        for(var control in instanciasControladores) {
            if(!instanciasControladores.hasOwnProperty(control)) continue;

            var obj=instanciasControladores[control],
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

        var metodo=instanciaAplicacion[nombre],
            retorno;
        if(params) {
            retorno=metodo.apply(instanciaAplicacion,params);
        } else {
            retorno=metodo.call(obj);
        }
        //El método puede devolver true para detener el evento
        if(typeof retorno==="boolean"&&retorno) return true;

        return false;
    };

    /**
     * Invoca el método correspondiente al evento en todos los componentes.
     * @param {Object} origen - Repositorio de componentes. Especificar NULL para ejecutar en todos los componentes del sistema.
     * @param {string} nombre - Nombre del evento.
     * @param {boolean} [soloImplementados=false] - Si es true, solo invocará aquellos métodos implementados en el componente concreto (no invocará métodos heredados).
     * @param {*[]} [params] - Parámetros a pasar al método.
     * @returns {boolean}
     */
    this.eventoComponentes=function(origen,nombre,soloImplementados,params) {
        if(typeof soloImplementados==="undefined") soloImplementados=false;

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

    ////Inicialización y ejecución del cliente

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
                resultado[decodeURIComponent(parte)]=true;
            } else {
                resultado[decodeURIComponent(parte.substring(0,p))]=decodeURIComponent(parte.substring(p+1));
            }
        });
        return resultado;
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
        var obj=ui.crearControlador(nombre,principal);

        if(typeof html==="string"&&typeof destino!=="undefined") destino.establecerHtml(html);
        
        if(typeof json==="undefined") json=jsonVistaPrincipal;
        this.procesarJson(json,obj);
        
        //Asociamos la vista y el controlador para que, llegado el caso de que los nombres de vista y controlador puedan diferir, quede desacoplado
        //cualquier otro lugar que se necesite conocer el controlador *actual* de la vista.
        if(obj) {
            obj.establecerVista(nombre);
            instanciasVistas[nombre].establecerControlador(nombre);
            
            //Evento
            if(principal) {
                //Al cargar la vista principal el evento Listo es invocado en todo el sistema
                this.evento("listo");
                this.eventoComponentes(null,"listo",true);
            } else {
                //Al cargar una vista secundaria, solo en la misma
                obj.listo();
                this.eventoComponentes(obj.obtenerComponentes(),"listo",true);
            }
        }

        if(typeof retorno==="function") retorno();

        return this;
    };

    /**
     * Inicia la ejecución del sistema.
     * @returns {ui}
     */
    this.ejecutar=function() {
        //Preparar la vista
        if(nombreVistaPrincipal&&instanciasVistas.hasOwnProperty(nombreVistaPrincipal)) {
            //La vista principal utilizará el cuerpo principal, vistas secundarias pueden utilizar otros contenedores
            instanciasVistas[nombreVistaPrincipal].establecerElemento(cuerpo);
        }

        //Buscar la hoja de estilos correspondiente a los estilos de la vista (por el momento la identificamos por nombre, esto quizás debería mejorar--TODO)
        for(var i=0;i<doc.styleSheets.length;i++) {
            var hoja=doc.styleSheets[i];
            if(new RegExp("cliente/vistas/"+nombreVistaPrincipal+".css").test(hoja.href)) {
                estilos=hoja;
                break;
            }
        }

        if(modoEdicion) {
            //En modo de edición, procesar el JSON y pasar el control al editor
            this.procesarJson(jsonVistaPrincipal);
            editor.ejecutar();
        } else {
            if(!this.esMovil()) {
                body.agregarClase("escritorio");

                var elem=doc.querySelector(".autofoco");
                if(elem) {
                    var comp=this.obtenerInstanciaComponente(elem);
                    if(comp) {
                        //Componente
                        comp.foco();
                    } else {
                        //Cualquier otro elemento del DOM puede usar la clase .autofoco
                        elem.focus();
                    }
                }
            } else {
                body.agregarClase("movil");
            }

            this.establecerEventos();

            if(esCordova) body.agregarClase("cordova");

            this.ejecutarVista(nombreVistaPrincipal,true);

            if(!esCordova) {
                this.ocultarPrecarga("barra");
            }
        }

        if(esCordova) {
            doc.querySelector("#contenedor-cordova").agregarClase("listo");
        }

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
     * - [ nombre, ... ]    Nombre de componentes de los cualqes puede ser hijo, o que acepta como hijos
     */
    aceptaHijos: true,
    grupo:null
};

var componentes={};
var controladores={};
var _vistasEmbebibles={};

window["ui"]=ui;
window["componentes"]=componentes;
window["controladores"]=controladores;

//Evitar que los links <a href="#"> naveguen antes de que se hayan asignado los manejadores de eventos
document.body.eventoFiltrado("click",{atributos:{href:"#"}},function(ev) {
    ev.preventDefault();
});