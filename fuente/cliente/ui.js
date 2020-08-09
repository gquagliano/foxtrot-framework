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
        menuAbierto=null,
        instanciasVistas={},
        nombreVistaPrincipal=null,
        enrutadores={},
        instanciaEnrutador=null,
        instanciaAplicacion=null;

    ////Elementos del dom

    var doc=document,
        body=doc.body,
        cuerpo=doc.querySelector("#foxtrot-cuerpo"),
        estilos=doc.querySelector("#foxtrot-estilos"),
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
            origen=estilos.sheet.cssRules;
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
                        if(esCordova&&listas==url.length) document.querySelector("#contenedor-cordova").agregarClase("listo");
                    })
                    .atributo("href",u)
            );
        });
        return this;
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

    this.removerEstilos=function(selector,tamano) {
        return this.establecerEstilosSelector(selector,null,tamano);
    };

    ////Gestión de la aplicación

    /**
     * Registra e instancia la clase principal de la aplicación.
     * @param {function} funcion 
     */
    this.registrarAplicacion=function(funcion) {
        //En este caso no puede haber más de una clase, por lo que no tiene sentido llevar un almacén de funciones, instanciamos directamente
        instanciaAplicacion=aplicacion.fabricarAplicacion(funcion);
        instanciaAplicacion.inicializar();
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
     * @param {Object|string} comp - Nombre del componente u objeto que representa el componente, si se está creando un componente previamente guardado (desde JSON).
     * @param {string} vista - Nombre de la vista.
     */
    this.crearComponente=function(comp,vista) {
        if(typeof vista==="undefined") vista=nombreVistaPrincipal;

        var nombre,id;
        if(typeof comp==="string") {
            //Nuevo
            nombre=comp;
            id=vista+"-"+this.generarId();
        } else {
            //Restaurar
            nombre=comp.componente;
            id=comp.id;
            if(!id) id=vista+"-"+this.generarId();
        }
        
        var obj=componente.fabricarComponente(componentesRegistrados[nombre].fn);

        obj.establecerNombreVista(vista)
            .establecerId(id);

        if(typeof comp==="object") {
            //Restaurar
            obj.establecerNombre(comp.nombre)
                .establecerPropiedades(comp.propiedades);
        }
        
        var i=instanciasComponentes.push(obj);

        //Índice
        instanciasComponentesId[id]=i-1;

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

        var valores={};

        //La forma más fácil es solicitárselo a los componentes vista  
        instanciasVistas.forEach(function(vista) {
            if(nombreVista&&vista!=nombreVista) return;
            var obj=self.obtenerInstanciaVista(vista).obtenerValores();
            valores=Object.assign({},valores,obj);
        });

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
     */
    this.obtenerHtml=function() {
        return editor.limpiarHtml(cuerpo.outerHTML);
    };

    /**
     * Devuelve el CSS de la vista.
     */
    this.obtenerCss=function() {
        var css="";
        this.obtenerEstilos().forEach(function(regla) {
            if(!regla.estilos.length) return;
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
            version:1,
            componentes:[],
            nombre:nombreVistaPrincipal
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
        cuerpo.outerHTML=html;
        //Se asume un html con una estructura válida para una vista
        cuerpo=doc.querySelector("#foxtrot-cuerpo");
        return this;        
    };

    /**
     * Establece e inicializa la vista y sus componentes dado su json.
     */
    this.establecerJson=function(json) {
        if(typeof json==="string") json=JSON.parse(json);

        var nombreVista=json.nombre,
            fn=function(componente) {
                return ui.crearComponente(componente,nombreVista)
                    .restaurar();
            };

        //Preparar los componentes
        json.componentes.forEach(function(componente) {
            var obj=fn(componente);

            //Almacenar en cache de instancias
            if(componente.componente=="vista") {
                instanciasVistas[nombreVista]=obj;

                //Asumir el primer componente vista (debería ser el único) como vista principal
                if(!nombreVistaPrincipal) nombreVistaPrincipal=nombreVista;
            }
        });

        return this;  
    };

    /**
     * Crea la instancia del controlador.
     */
    this.crearControlador=function(nombre,principal) {
        if(typeof principal==="undefined") principal=false;

        var obj=this.obtenerInstanciaControlador(nombre,principal);        
        if(obj) obj.inicializar();
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
        
        obj.inicializar();
        
        return obj;
    };

    ////Gestión de la UI

    this.establecerModoEdicion=function(valor) {
        modoEdicion=valor;
        body.alternarClase("foxtrot-modo-edicion");
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

    var duracionAnimacion=1000; //Depende de la animación CSS

    /**
     * Hace aparecer el elemento en forma animada utilizando animaciones CSS.
     * @param {(Node|Element)} elem - Elemento.
     * @param {function} [retorno] - Función de retorno.
     */
    this.animarAparecer=function(elem,retorno) {
        this.detenerAnimacion(elem);

        elem.removerClase("oculto")
            .agregarClase("aparece");  

        if(typeof retorno!=="undefined") {
            elem._timeoutAnimMenu=setTimeout(function() {
                retorno();
            },duracionAnimacion);
        }

        return this;
    };

    /**
     * Hace desaparecer y oculta el elemento en forma animada utilizando animaciones CSS.
     * @param {(Node|Element)} elem - Elemento.
     * @param {function} [retorno] - Función de retorno.
     */
    this.animarDesaparecer=function(elem,retorno) {
        this.detenerAnimacion(elem);

        elem.agregarClase("desaparece");

        elem._timeoutAnimMenu=setTimeout(function() {
            if(typeof retorno!=="undefined") retorno();

            elem.removerClase("desaparece")
                .agregarClase("oculto");
        },duracionAnimacion);
    };

    /**
     * Oculta el elemento mediante el mismo mecanismo que animarDesaparecer(), pero de forma inmediata.
     * @param {(Node|Element)} elem - Elemento.
     */
    this.desaparecer=function(elem) {
        elem.removerClase("aparece")
            .agregarClase("oculto");
        return this;
    };

    /**
     * Detiene la animación en curso.
     * @param {(Node|Element)} elem - Elemento.
     */
    this.detenerAnimacion=function(elem) {
        if(elem.hasOwnProperty("_timeoutAnimMenu")) clearTimeout(elem._timeoutAnimMenu);
        elem.removerClase("aparece desaparece");
        return this;
    };

    var temporizadorPrecarga,
        precargaVisible=false,
        elementoPrecarga=null;

    /**
     * Muestra una animación de precarga.
     */
    this.mostrarPrecarga=function() {
        //Detener si se había solicitado ocultar la precarga hace menos de 200ms
        clearTimeout(temporizadorPrecarga);

        if(precargaVisible) return this;

        if(!elementoPrecarga) {
            elementoPrecarga=doc.crear("<div id='foxtrot-precarga' class='oculto'>")   
                .anexarA(body);
        }

        this.animarAparecer(elementoPrecarga);
        precargaVisible=true;

        return this;
    };

    /**
     * Oculta la animación de precarga.
     */
    this.ocultarPrecarga=function() {
        if(!elementoPrecarga||!precargaVisible) return this;

        clearTimeout(temporizadorPrecarga);
        
        //Utilizamos un temporizador para que llamados sucesivos no provoquen que aparezca y desaparezca reiteradas veces
        temporizadorPrecarga=setTimeout(function() {
            self.animarDesaparecer(elementoPrecarga);
            precargaVisible=false;
        },200);

        return this;
    };

    this.construirDialogo=function(obj) {

    };

    this.abrirDialogo=function(dialogo) {

    };

    this.alerta=function(mensaje,funcion,etiquetaBoton) {
        //TODO Integración con el plugin de Cordova de Foxtrot
        //TODO Integración con el cliente de escritorio
        alert(mensaje);
        if(typeof funcion==="function") funcion();
    };

    this.confirmar=function(mensaje,funcion,etiquetaSi,etiquetaNo) {
        //TODO Integración con el plugin de Cordova de Foxtrot
        //TODO Integración con el cliente de escritorio
        if(confirm(mensaje)&&typeof funcion==="function") funcion();
    };

    var abrirElementoMenu=function(elem) {
        ui.animarAparecer(elem);
    };
    
    var cerrarElementoMenu=function(elem,omitirAnimacion,eliminar) {
        var fn=function() {
            if(eliminar) elem.remover();
        };

        if(omitirAnimacion) {
            fn();
        } else {
            ui.animarDesaparecer(elem,fn);
        }
    };

    /**
     * @callback callbackAccion
     */

    /**
     * @callback callbackHabilitado
     * @returns {boolean}
     */

    /**
     * Construye un menú.
     * @param {Object[]} items - Items del menú.
     * @param {string} items[].etiqueta - Etiqueta.
     * @param {callbackAccion) [items[].accion] - Función a ejecutar al seleccionarse la opción.
     * @param {(callbackHabilitado|boolean)} [items[].habilitado=true] - Estado del item o función a ejecutar para determinar si el item se encuentra habilitado.
     * @param {boolean} [items[].separador=false] - Determina si el item es seguido de un separador.
     * @param {Object[]} [items[].submenu] - Items del submenú (admiten las mismas propiedades que items).
     * @param {string} [clase] - Clase CSS.
     * @returns {Object}
     */
    this.construirMenu=function(items,clase) {
        if(typeof clase==="undefined") clase=null;

        //TODO Integración con Cordova
        //TODO Integración con el cliente de escritorio

        var click=function(item,ev) {
            if(item.hasOwnProperty("accion")) {
                ev.preventDefault();
                ev.stopPropagation();
                item.accion();
            }
            self.cerrarMenu(menuAbierto);
        },
        toque=function(item,ev) {
            if(item.hasOwnProperty("elemSubmenu")) {
                abrirSubmenu(item);
                ev.preventDefault();
                ev.stopPropagation();
            } else {
                click(item,ev);
            }
        },
        abrirSubmenu=function(item) {
            //TODO Posicionamiento según el espacio disponible
            if(!item.hasOwnProperty("elemSubmenu")) return;
            abrirElementoMenu(item.elemSubmenu);
        },
        cerrarSubmenu=function(item) {
            if(!item.hasOwnProperty("elemSubmenu")) return;
            cerrarElementoMenu(item.elemSubmenu);
        };

        var fn=function(ul,items) {
            for(var i=0;i<items.length;i++) {
                var li=document.crear("<li>"),
                    a=document.crear("<a href='#'>");

                a.html(items[i].etiqueta);

                if(items[i].hasOwnProperty("submenu")) {
                    var ulSubmenu=document.crear("<ul class='foxtrot-submenu oculto'>");
                    fn(ulSubmenu,items[i].submenu);

                    li.agregarClase("con-submenu");
                    li.anexar(ulSubmenu);
                    items[i].elemSubmenu=ulSubmenu;
                }

                if(items[i].hasOwnProperty("separador")&&items[i].separador) li.agregarClase("foxtrot-menu-separador");

                li.anexar(a);
                ul.anexar(li);
                
                items[i].elem=li;
                items[i].elemA=a;

                //Eventos

                a.evento("click",function(item) {
                    return function(ev) {
                        click(item,ev);
                    };
                }(items[i]))
                .evento("touchstart",function(item) {
                    return function(ev) {
                        toque(item,ev);
                    };
                }(items[i]));

                li.evento("mouseenter",function(item) {
                    return function() {
                        abrirSubmenu(item);
                    };
                }(items[i]))
                .evento("mouseleave",function(item) {
                    return function() {
                        cerrarSubmenu(item);
                    };
                }(items[i]));
            }
        };

        var menu={
            elem:document.crear("<ul class='foxtrot-menu oculto'>"),
            items:items.clonar(),
            eliminar:false
        };

        if(clase) menu.elem.agregarClase(clase);

        fn(menu.elem,menu.items);

        body.anexar(menu.elem);

        return menu;
    };

    /**
     * Actualiza el estado de los items del menú.
     * @param {Object} menu - Menú generado con ui.construirMenu().
     */
    this.actualizarMenu=function(menu) {
        var fn=function(items) {
            for(var i=0;i<items.length;i++) {
                if(items[i].hasOwnProperty("habilitado")) {
                    var v=items[i].habilitado;
                    if(typeof v==="function") v=v();
                    if(v) items[i].elem.removerClase("foxtrot-deshabilitado");
                    else items[i].elem.agregarClase("foxtrot-deshabilitado");
                }
                
                if(items[i].hasOwnProperty("submenu")) fn(items[i].submenu);
            }
        };

        fn(menu.items);
    };

    var menuKeyDn=function(ev) {
        var eventoValido=true;
        if(ev.which==27) {
            //ESC
            self.cerrarMenu(menuAbierto);
        } else if(ev.which==40) {
            //Abajo
            //TODO
        } else if(ev.which==84) {
            //Arriba
            //TODO
        } else if(ev.which==13) {
            //Enter
            //TODO
        } else {
            eventoValido=false;
        }
        if(eventoValido) {
            ev.preventDefault();
            ev.stopPropagation();
        }
    };

    var menuMouseUp=function(ev) {
        self.cerrarMenu(menuAbierto);
    };

    var menuBlur=function(ev) {
        self.cerrarMenu(menuAbierto);
    };

    var removerEventosMenu=function() {
        doc.removerEvento("keydown",menuKeyDn)
            .removerEvento("mouseup",menuMouseUp);
        window.removerEvento("blur",menuBlur);
        if(marco) marco.contentWindow.removerEvento("blur",menuBlur);
    };

    /**
     * Abre un menú.
     * @param {(Object[]|Object)} obj - Array de items de menú, un menú generado con ui.construirMenu() o cualquier elemento del DOM compatible.
     * @param {(Node|Element|Object)} [posicion] - Si se especifica un elemento del DOM, se posicionará el menú sobre el mismo; en caso contrario, debe especificarse un objeto con las propiedades {x,y}.
     * @param {string} [clase] - Clase CSS.
     */
    this.abrirMenu=function(obj,posicion,clase) {
        if(typeof posicion==="undefined") posicion=null;
        if(typeof clase==="undefined") clase=null;

        //TODO Integración con Cordova
        //TODO Integración con el cliente de escritorio

        //Cerrar menú abierto
        //if(menuAbierto) self.cerrarMenu(menuAbierto);

        if(util.esArray(obj)) {
            obj=self.construirMenu(obj,clase);
            obj.eliminar=true;
        }

        var elem;
        if(util.esElemento(obj)) {
            elem=obj;
        } else {
            elem=obj.elem;
            self.actualizarMenu(obj);
        }

        menuAbierto=obj;

        //Posición

        if(posicion) {
            var x,y;
            if(util.esElemento(posicion)) {
                var pos=posicion.posicionAbsoluta(),
                    alto=posicion.alto();
                x=pos.x;
                y=pos.y+alto;
            } else {
                x=posicion.x;
                y=posicion.y;
            }

            elem.estilos({
                    left:x,
                    top:y
                });
        }        
        
        //Reposicionar si se sale de pantalla

        abrirElementoMenu(elem);

        //Eventos

        doc.evento("keydown",menuKeyDn)
            .evento("mouseup",menuMouseUp);
            
        window.evento("blur",menuBlur);

        if(marco) marco.contentWindow.evento("blur",menuBlur);
    };

    /**
     * Cierra el menú especificado.
     * @param {Object} menu - Menú a cerrar (objeto generado con ui.construirMenu o cualquier elemento del DOM compatible).
     * @param {boolean} [omitirAnimacion=false] - Cierra el menú inmediatamente, sin animaciones.
     */
    this.cerrarMenu=function(menu,omitirAnimacion) {
        if(typeof menu==="undefined") menu=menuAbierto;
        if(typeof omitirAnimacion==="undefined") omitirAnimacion=false;
        
        if(!menu) return this;

        var elem=util.esElemento(menu)?menu:menu.elem; //Si no es un elemento del DOM, se asume un objeto menú
        cerrarElementoMenu(elem,omitirAnimacion,menu.eliminar);

        removerEventosMenu();
        menuAbierto=null;

        return this;
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
        var resultado;
        if(/^https?:\/\//i.test(url)) {
            resultado=url;
        } else {
            //Obtener URL de la vista dado su nombre
            resultado=instanciaEnrutador.obtenerUrlVista(url);
        }
        return resultado;
    };

    /**
     * Navega a la vista o URL especificada.
     * @param {string} ruta - URL o nombre de vista de destino.
     */
    this.irA=function(ruta) {
        window.location.href=this.procesarUrl(ruta);
        return this;
    };

    /**
     * Abre una ventana emergente con la vista o URL especificada.
     * @param {string} ruta - URL o nombre de vista de destino.
     */
    this.abrirVentana=function(ruta) {
        var ancho=window.ancho()*.75,
            alto=window.alto();
        return window.open(this.procesarUrl(ruta),"_ventana","height="+alto+",width="+ancho+",toolbar=no,menubar=no,location=no");
    };

    ////Inicialización y ejecución del cliente

    this.cordova=function() {
        esCordova=true;
        urlBase=localStorage.getItem("_urlBase");
        document.head.anexar(document.crear("base").atributo("href",urlBase));
        return this;
    };

    this.ejecutar=function(nuevoDoc) {
        if(!util.esIndefinido(nuevoDoc)) {
            //Si se activa para un documento diferente, reemplazar las referencias al dom
            doc=nuevoDoc;
            body=doc.body;
            cuerpo=doc.querySelector("#foxtrot-cuerpo");
            estilos=doc.querySelector("#foxtrot-estilos");
            marco=document.querySelector("#foxtrot-marco");
        }        

        //Preparar la vista
        if(nombreVistaPrincipal&&instanciasVistas.hasOwnProperty(nombreVistaPrincipal)) {
            //La vista principal utilizará el cuerpo principal, vistas secundarias pueden utilizar otros contenedores
            instanciasVistas[nombreVistaPrincipal].establecerElemento(cuerpo);
        }
        
        if(!modoEdicion) {
            //Por el momento, el controlador es el que tiene el mismo nombre que la vista
            var obj=ui.crearControlador(nombreVistaPrincipal,true);
            //Asociamos la vista y el controlador para que, llegado el caso de que los nombres de vista y controlador puedan diferir, quede desacoplado
            //cualquier otro lugar que se necesite conocer el controlador *actual* de la vista.
            if(obj) {
                obj.establecerVista(nombreVistaPrincipal);
                instanciasVistas[nombreVistaPrincipal].establecerControlador(nombreVistaPrincipal);
                //Evento 'Listo'
                instanciaControladorPrincipal.listo();
            }
        }
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

window["ui"]=ui;
window["componentes"]=componentes;
window["controladores"]=controladores;