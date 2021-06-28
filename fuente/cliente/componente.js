/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * @typedef {componente} Componente concreto.
 */

/**
 * @external Object
 */

/**
 * Objeto base para los componentes.
 * @class
 */
var componente=new function() {
    "use strict";

    //Los métodos para sobreescribir en el componente concreto tienen una versión nnnComponente que permiten invocar
    //la funcionalidad por defecto.

    ////Privado
    
    var propiedadesCombinadas=null,
        ultimaClase=null,
        clasesCssEstablecidas="";

    ////Propiedades

    /**
     * @var {string} id - ID del componente (interno).
     * @var {string} selector - Selector CSS del componente.
     * @var {string} componente - Tipo de componente.
     * @var {string} nombre - Nombre del componente.
     * @var {(Element|Node)} elemento - Elemento del componente.
     * @var {(Element|Node)} contenedor - Elemento contenedor de la descendencia del componente (puede diferir de `elemento`).
     * @var {boolean} contenidoEditable - Indica si presenta contenido editable mediante el editor de texto (doble click).
     * @var {boolean} elementoEditable - Si `contenidoEditable` es `true`, este es el elemento que admite edición de texto.
     * @var {(Element|Node)} elementoEventos - Elemento al cual se asignan los controladores de eventos por defecto.
     * @var {boolean} arrastrable - Indica si el componente se puede arrastrar y soltar.
     * @var {boolean} fueInicializado - Indica si la instancia ya fue inicializada.
     * @var {boolean} modoEdicionListo - Indica si la instancia ya fue preparado para editar el componente en el editor de vistas.
     * @var {componenteVista} vista - Vista a la cual pertenece la instancia.
     * @var {Object} datos - Origen de datos asignado.
     * @var {boolean} oculto - Indica si el componente está oculto, lo cual significa que el mismo no se publica en `componentes`, aunque tenga un nombre asignado (es independiente de la visiblidad del elemento del DOM).
     * @var {(Element|Node)} campo - Elemento campo, si el componente presenta algún tipo de campo de ingreso (`input`, `textarea`, etc.)
     * @var {componente} prototipo - Instancia de `componente`.
     * @var {Object} valoresPropiedades - Almacen de valores de parámetros.
     * @var {boolean} listoEjecutado - Indica si ya fue ejecutado el evento *Listo*.
     * @var {boolean} actualizacionEnCurso - Determina si el componente se encuentra en proceso de actualización o redibujado.
     * @var {controlador} controlador - Instancia del controlador de la vista a la cual pertenece.
     * @var {*[]} clasesCss - Listado todas las de clases CSS propias del componente posibles. Cada componente concreto debe agregar las propias.
     * @var {boolean} iterativo - Indica si el componente concreto es una estructura que itere su contenido.
     * @var {*[]} itemsAutogenerados - Listado de items autogenerados por el componente iterativo.
     * @var {boolean} plantilla - Indica si es un componente que será utilizado como plantilla de otro componente iterativo.
     * @var {boolean} autogenerado - Indica si es un componente que fue autogenerado por otro componente iterativo.
     * @var {Node} contenedorItems - Contenedor de los items autogenerados del componente iterativo. Por defecto, será coincidente con `elemento`.
     * @var {boolean} descartarValores - Indica si se deben descartar los valores de los campos durante el próximo redibujado (componentes iterativos).
     * @var {boolean} redibujar - Indica si se debe redibujar por completo el componente durante la próxima actualización.
     */
    this.id=null;
    this.selector=null;
    this.componente=null;
    this.nombre=null;
    this.elemento=null;
    this.contenedor=null;
    this.contenidoEditable=false;
    this.elementoEditable=null;
    this.elementoEventos=null;
    this.arrastrable=true;
    this.fueInicializado=false;
    this.modoEdicionListo=false;
    this.vista=null;
    this.datos=null;
    this.oculto=false;
    this.campo=null;
    this.prototipo=this;
    this.valoresPropiedades=null;
    this.listoEjecutado=false;
    this.actualizacionEnCurso=false;
    this.controlador=null;
    this.esFlex=false;
    this.clasesCss=[
        "componente",
        "contenedor",
        /^float(-sm|-md|-lg|-xl)?-(left|right|none)$/,
        /^text(-sm|-md|-lg|-xl)?-(left|right|center|justify)$/,
        /^d(-sm|-md|-lg|-xl)?-(block|flex|inline|inline-block)$/,
        /^flex(-sm|-md|-lg|-xl)?-(row|column)(-reverse)?$/,
        /^justify-content(-sm|-md|-lg|-xl)?-(start|end|center|between|around)$/,
        /^align-items(-sm|-md|-lg|-xl)?-(start|end|center|baseline|stretch)?$/,
        /^(visible|invisible)(-sm|-md|-lg|-xl)?$/,
        /^d(-sm|-md|-lg|-xl)?-(flex|block|none)$/,
        /^font-weight-(light|normal|medium|bold)$/,
        "font-italic",
        "subrayado",
        "tachado",
        "autofoco",
        "deshabilitado",
        //Clases del editor
        "foxtrot-editando-texto",
        "foxtrot-seleccionado",
        "foxtrot-hijo-seleccionado"
    ];
    this.iterativo=false;
    this.itemsAutogenerados=[];
    this.plantilla=false;
    this.autogenerado=false;
    this.contenedorItems=null;
    this.descartarValores=false;
    this.redibujar=false;

    /**
     * @var {Obejct} propiedadesComunes - Propiedades comunes a todos los componentes.
     * @var {Object} propiedadesConcretas - Propiedades del componente concreto (a sobreescribir por el componente concreto).
     */
    this.propiedadesComunes={
        "Estilo":{
            //nombre:{
            //    etiqueta
            //    tipo (predeterminado texto|multilinea|opciones|multiple|color|numero|comando|bool o logico|archivo)
            //    opciones (objeto {valor:etiqueta} cuando tipo=opciones o tipo=multiple)
            //    placeholder
            //    funcion
            //    adaptativa (predeterminado true)
            //    clase
            //    ayuda
            //    evento Indica si es un evento (predeterminado false)
            //    eventoCampo Indica si es un evento que debe aplicarse solo a campos (predeterminado false)
            //    boton (texto del botón en caso de tipo=comando)
            //    evaluable (predeterminado false) Indica si se deben evaluar las expresiones en forma automática (método actualizarPropiedadesExpresiones)
            //}
            color:{
                etiqueta:"Color de texto",
                tipo:"color",
                evaluable:true
            },
            fondo:{
                etiqueta:"Fondo",
                tipo:"color",
                evaluable:true
            },
            clase:{
                etiqueta:"Clase CSS",
                //TODO En el futuro, sería bueno tener clases adaptativas. Ello puede servir para muchas clases de Bootstrap, donde no tiene sentido reescribirlas con
                //sufijos (-md, -lg, etc.), pero por el momento es preferible evitar la carga de JS que implicaría verificar las clases de todos los componentes cada
                //vez que se redimensiona la pantalla.
                adaptativa:false,
                evaluable:true
            }
        },
        "Posicionamiento":{
            flotar:{
                etiqueta:"Alineacion",
                tipo:"opciones",
                opciones:{
                    ninguna:"Ninguna - Predeterminado",
                    izquierda:"Izquierda",
                    derecha:"Derecha"
                    //TODO centro (establece margen izq y der = auto)
                },
                evaluable:true
            },
            margen:{
                etiqueta:"Margen",
                evaluable:true
                //TODO Tipo de campo personalizado que permita, por ejemplo, crear los 4 campos para los márgenes
            },
            estructura:{
                etiqueta:"Estructura",
                tipo:"opciones",
                opciones:{
                    bloque:"Bloque",
                    enLinea:"En línea",
                    bloqueEnLinea:"Bloque en línea",
                    flex:"Flex",
                    flexInverso:"Flex inverso",
                    flexVertical:"Flex vertical",
                    flexVerticalInverso:"Flex vertical inverso"
                },
                evaluable:true
            },
            flex:{
                etiqueta:"Flex",
                evaluable:true
            },
            alineacionItems:{
                etiqueta:"Alineación de items (Flex)",
                tipo:"opciones",
                opciones:{
                    inicio:"Inicio",
                    fin:"Fin",
                    centro:"Centro",
                    entre:"Entre items",
                    envolver:"Envolver"
                },
                evaluable:true
            },
            justificacionItems:{
                etiqueta:"Justificación de items (Flex)",
                tipo:"opciones",
                opciones:{
                    inicio:"Inicio",
                    fin:"Fin",
                    centro:"Centro",
                    base:"Línea base",
                    estirar:"Estirar"
                },
                evaluable:true
            },
            visibilidad:{
                etiqueta:"Visibilidad",
                tipo:"opciones",
                opciones:{
                    visible:"Visible",
                    invisible:"Invisible",
                    oculto:"Oculto"
                },
                evaluable:true
            },
            opacidad:{
                etiqueta:"Opacidad",
                tipo:"numero",
                evaluable:true
            },
            ordenZ:{
                etiqueta:"Orden Z",
                tipo:"numero",
                adaptativa:false,
                evaluable:true
            }
        },
        "Dimensiones":{
            ancho:{
                etiqueta:"Ancho",
                evaluable:true
            },
            anchoMaximo:{
                etiqueta:"Ancho máximo",
                evaluable:true
            }, 
            anchoMinimo:{
                etiqueta:"Ancho mínimo",
                evaluable:true
            },            
            alto:{
                etiqueta:"Alto",
                evaluable:true
            },
            altoMaximo:{
                etiqueta:"Alto máximo",
                evaluable:true
            },
            altoMinimo:{
                etiqueta:"Alto mínimo",
                evaluable:true
            }
        },
        "Texto":{
            alineacion:{
                etiqueta:"Alineación",
                tipo:"opciones",
                opciones:{
                    ninguna:"Ninguna - Heredada",
                    izquierda:"Izquierda",
                    derecha:"Derecha",
                    centro:"Centro",
                    justificado:"Justificado",
                    //TODO
                    //justificadoCentro:"Justificado al centro",
                    //justificadoDerecha:"Justificado a la derecha"
                },
                evaluable:true
            },
            //TODO Barra de formato
            peso:{
                etiqueta:"Peso",
                tipo:"opciones",
                opciones:{
                    fino:"Fino",
                    normal:"Normal",
                    medio:"Medio",
                    negrita:"Negrita"
                },
                adaptativa:false,
                evaluable:true
            },
            cursiva:{
                etiqueta:"Cursiva",
                tipo:"bool",
                adaptativa:false,
                evaluable:true
            },
            subrayado:{
                etiqueta:"Subrayado",
                tipo:"bool",
                adaptativa:false,
                evaluable:true
            },
            tachado:{
                etiqueta:"Tachado",
                tipo:"bool",
                adaptativa:false,
                evaluable:true
            },
            tamano:{
                etiqueta:"Tamaño de texto",
                tipo:"numero",
                evaluable:true
            }
        },
        "Eventos":{
            click:{
                etiqueta:"Click",
                adaptativa:false,
                evento:true,
                evaluable:true,
                eventoCampo:true
            },
            menuContextual:{
                etiqueta:"Menú contextual",
                adaptativa:false,
                ayuda:"Ingresar el nombre de un componente Menú existente en la vista, o una expresión que resuelva a una instancia de un componente Menú.",
                evento:true,
                evaluable:true,
                eventoCampo:true
            },
            intro:{
                etiqueta:"Intro",
                adaptativa:false,
                evaluable:true,
                evento:true
            },
            modificacion:{
                etiqueta:"Modificación",
                adaptativa:false,
                evaluable:true,
                evento:true,
                eventoCampo:true
            }
        },
        "Datos":{
            datos:{
                etiqueta:"Origen de datos",
                adaptativa:false,
                evaluable:true,
                ayuda:"Permite establecer el origen de datos utilizando una expresión, equivalente a componente.establecerDatos(). Modificar esta propiedad en tiempo de ejecución no tendrá efecto."
            },
            propiedad:{
                etiqueta:"Propiedad",
                adaptativa:false,
                ayuda:"Propiedad del origen de datos. Admite rutas para acceder a propiedades anidadas, separadas por punto."
            },
            propiedadValor:{
                etiqueta:"Propiedad Valor",
                adaptativa:false,
                ayuda:"Propiedad del origen de datos de donde se obtendrá y donde se asignará el valor. A diferencia de Propiedad, no filtrará el origen de datos cuando sea asignado. Admite rutas para acceder a propiedades anidadas, separadas por punto."
            }
        },
        "Comportamiento":{
            autofoco:{
                etiqueta:"Autofoco",
                tipo:"bool"
            },
            deshabilitado:{
                etiqueta:"Deshabilitado",
                tipo:"bool",
                adaptativa:false,
                evaluable:true
            }
        }
    };
    this.propiedadesConcretas=null;

    ////Acceso a propiedades    

    /**
     * Devuelve el ID de la instancia.
     * @returns {string}
     */
    this.obtenerId=function() {
        return this.id;
    };

    /**
     * Asigna la vista a la cual pertenece el componente.
     * @param {componenteVista} vista - Instancia de la vista.
     * @returns {componente}
     */
    this.establecerVista=function(vista) {
        if(this.vista) this.vista.removerComponente(this);
        if(this.controlador) this.controlador.removerComponente(this);

        this.vista=vista;
        this.controlador=vista?
            vista.obtenerControlador():
            null;

        if(this.controlador&&this.nombre&&!this.oculto) this.controlador.agregarComponente(this);

        return this;
    };

    /**
     * Devuelve la instancia de la vista (componente `Vista`) a la cual pertenece.
     * @returns {componenteVista}
     */
    this.obtenerVista=function() {
        return this.vista;
    };

    /**
     * Devuelve la instancia del controlador de la vista a la cual pertenece.
     * @returns {controlador}
     */
    this.obtenerControlador=function() {
        return this.controlador;
    };

    /**
     * Devuelve el nombre de la instancia.
     * @returns {string}
     */
    this.obtenerNombre=function() {
        return this.nombre;
    };

    /**
     * Devuelve si el componente está oculto o no.
     */
    this.esComponenteOculto=function() {
        return this.oculto;
    };

    /**
     * Establece que el componente está oculto.
     * @returns {componente}
     */
    this.establecerComponenteOculto=function() {
        //Ocultar de los almacenes por nombre
        if(this.controlador) this.controlador.removerComponente(this);
        if(this.vista.esPrincipal()) ui.removerComponente(this);

        this.oculto=true;
        return this;
    };

    /**
     * Devuelve el nombre del tipo de componente.
     * @returns {string}
     */
    this.obtenerTipo=function() {
        return this.componente;
    };

    /**
     * Devuelve el selector para el elemento.
     * @returns {string}
     */
    this.obtenerSelector=function() {
        return this.selector;
    };

    /**
     * Genera y asigna un selector automático para el elemento.
     * @param {boolean} [asignar=true] - Determina si debe asignarse el nuevo selector o no.
     * @returns {string}
     */
    this.generarSelector=function(asignar) {
        if(typeof asignar==="undefined") asignar=true;

        var clase=ui.generarSelector(this.componente,this.nombre);
        
        if(asignar) this.establecerSelector(clase);

        return clase;
    };

    /**
     * Establece el selector para el elemento, actualizando los estilos preexistentes.
     * @param {(string|null)} nuevo - Nuevo selector. Puede ser un ID (#id), clase (.clase) o NULL para remover.
     * @param {boolean} [actualizar=true] - Determina si se deben actualizar el elemento y los estilos.
     * @returns {componente}
     */
    this.establecerSelector=function(nuevo,actualizar) {
        if(typeof actualizar==="undefined") actualizar=true;

        if(this.selector&&actualizar) {
            //Remover clase anterior (si es ID, se mantiene, aunque se eliminarán sus estilos)
            if(this.selector.substring(0,1)==".") {
                var nombre=this.selector.substring(1);
                this.elemento.removerClase(nombre);
                util.removerElemento(clasesCss,nombre);
            }

            //Mover estilos
            if(nuevo) {
                ui.renombrarEstilos(this.selector,nuevo);
            } else {
                ui.removerEstilos(this.selector);
            }
        }

        this.selector=nuevo;

        if(nuevo&&actualizar) {
            //El selector puede ser un ID o una clase
            var pc=nuevo.substring(0,1),
                nombre=nuevo.substring(1);
            if(pc==".") {
                this.elemento.agregarClase(nombre);
                this.clasesCss.push(nombre);
            } else if(pc=="#") {
                this.elemento.atributo("id",nombre);
            }
        }

        return this;
    };

    /**
     * Devuelve el elemento correspondiente a esta instancia, o uno nuevo si es una nueva instancia.
     */
    this.obtenerElemento=function() {
        if(!this.elemento) this.crear();
        return this.elemento;
    };

    /**
     * Devuelve el elemento del campo de esta instancia.
     * @returns {HTMLElement}
     */
    this.obtenerCampo=function() {
        return this.campo;
    };

    /**
     * Devuelve si el componente es o no un campo.
     * @returns {boolean}
     */
    this.esCampo=function() {
        return this.campo!==null;
    };

    /**
     * Devuelve el elemento correspondiente al contenedor de los hijos de esta instancia.
     */
    this.obtenerContenedor=function() {
        return this.contenedor;
    };

    /**
     * Devuelve un objeto con todos los parámetros de configuración.
     */
    this.obtenerPropiedades=function() {
        //TODO Excluir del JSON las propiedades que se puedan obtener desde el DOM (ejemplo origen en imagen)

        return this.valoresPropiedades;
    };

    /**
     * Determina si el componente debe poder arrastrarse para reposicionarse o no.
     */
    this.esArrastrable=function() {
        return this.arrastrable;
    };

    /**
     * Establece el origen de datos.
     * @param {Object} obj - Objeto a asignar.
     * @param {boolean} [actualizar=true] - Actualizar el componente luego de establecer el origen de datos.
     * @param {boolean} [dispersar] - Si es `true`, los datos serán aplicados a toda la descendencia en forma recursiva. Por defecto, `false` para componentes
     * iterativos, `true` para todos los demás.
     * @param {boolean} [ignorarPropiedad=false] - Si es `true` no tendrá en cuenta el valor de la propiedad *Propiedad* (`propiedad`) del componente.
     * @returns {componente}
     */
    this.establecerDatos=function(obj,actualizar,dispersar,ignorarPropiedad) {
        if(typeof actualizar=="undefined") actualizar=true;
        if(typeof dispersar=="undefined") dispersar=!this.iterativo;
        if(typeof ignorarPropiedad=="undefined") ignorarPropiedad=false;

        if(this.iterativo) this.descartarValores=true;

        //Si se omite obj, intentar usar el último objeto asignado, u obtener de la propiedad Origen
        if(typeof obj=="undefined"||!obj) obj=this.datos||this.propiedad(true,"datos");
        if(!obj) return this;

        var propiedad=null;
        if(!ignorarPropiedad) propiedad=this.propiedad(false,"propiedad");
        if(propiedad) {
            //Tomar listado de una propiedad específica
            this.datos=util.obtenerPropiedad(obj,propiedad);
        } else {
            this.datos=obj;
        }

        if(dispersar) this.obtenerHijos().forEach(function(hijo) {
                hijo.establecerDatos(obj,actualizar);
            });

        if(actualizar) this.actualizar();

        return this;
    };

    /**
     * Filtra el objeto dado según el valor de `propiedadValor`.
     * @param {*} obj - Objeto a procesar.
     * @returns {*}
     */
    this.filtrarDatos=function(obj) {
        if(typeof obj!="object") return obj;

        var propiedad=this.propiedad("propiedadValor");
        if(!propiedad) return obj;
        return util.obtenerPropiedad(obj,propiedad);
    };

    /**
     * Devuelve el origen de datos actual.
     * @param {boolean} [filtrar=false] - Si es `true`, el valor devuelto será filtrado según `propiedadValor`.
     * @returns {*}
     */
    this.obtenerDatos=function(filtrar) {
        var datos=this.obtenerDatosActualizados();        
        if(typeof filtrar=="undefined"||!filtrar) return datos;
        return this.filtrarDatos(datos);
    };

    /**
     * Devuelve el origen de datos actual tal como fue asignado, sin procesar las relaciones entre sus propiedades y campos del componente.
     * @param {boolean} [filtrar=false] - Si es `true`, el valor devuelto será filtrado según `propiedadValor`.
     * @returns {*}
     */
    this.obtenerDatosCrudos=function(filtrar) {
        if(typeof filtrar=="undefined"||!filtrar) return this.datos;
        return this.filtrarDatos(this.datos);
    };

    /**
     * Busca una propiedad por su nombre y devuelve sus parámetros.
     * @param {string} nombre - Nombre de la propiedad.
     * @returns {(Object|null)}
     */
    this.obtenerParametrosPropiedad=function(nombre) {
        for(var gr in this.propiedadesComunes) {
            if(!this.propiedadesComunes.hasOwnProperty(gr)) continue;
            if(this.propiedadesComunes[gr].hasOwnProperty(nombre)) return this.propiedadesComunes[gr][nombre];
        }
        for(var gr in this.propiedadesConcretas) {
            if(!this.propiedadesConcretas.hasOwnProperty(gr)) continue;
            if(this.propiedadesConcretas[gr].hasOwnProperty(nombre)) return this.propiedadesConcretas[gr][nombre];
        }
        return null;
    };

    ////Gestión de la instancia

    /**
     * Determina si un objeto es instancia de un componente.
     * @memberof external:Object
     */
    Object.prototype.esComponente=function() {
        return this.cttr()==componente.cttr();
    };    

    /**
     * Fabrica una instancia de un componente concreto dada su función.
     */
    this.fabricarComponente=function(fn) {
        //TODO Aquí se debe mejorar el trabajo con prototipos (remover "pseudo-herencia")

        //Heredar prototipo
        fn.prototype=new (this.cttr());

        var obj=new fn;

        //Inicializar las propiedades que son objetos (de otro modo, se copiarán las referencias desde el prototipo)
        obj.hijos=[];
        obj.valoresPropiedades={};
        obj.clasesCss=this.clasesCss.clonar();
        obj.itemsAutogenerados=[];

        return obj;
    };

    /**
     * Genera y devuelve un nuevo componente con las mismas propiedades y una copia del elemento del DOM.
     * @param {componente} padre - Padre del nuevo componente. Puede ser null si se especificará elemento.
     * @param {boolean} [oculto=false] - Determina si el componente debe ser visible o permanecer anónimo aunque tenga un nombre asignado (a nivel API, no interfaz).
     * @param {Node} [elemento] - Elemento del DOM. Si se especifica, en lugar de duplicar el actual, se intentará recuperar el mismo.
     * @returns {componente}
     */
    this.clonar=function(padre,oculto,elemento) {
        if(typeof oculto=="undefined") oculto=false;
        if(typeof elemento=="undefined") elemento=null;

        var nuevoId=ui.generarId();

        if(!elemento) {
            //Duplicar el elemento del DOM
            elemento=this.elemento.clonar();
            var elemPadre=padre;
            if(padre.esComponente()) elemPadre=padre.obtenerContenedor();
            elemPadre.anexar(elemento);

            //Al clonar el elemento del DOM, los elementos de la descendencia también fueron clonados, por lo tanto debemos duplicar las instancias y asignar los elementos clonados
            var fn=function(comp) {
                comp.obtenerHijos().forEach(function(hijo) {
                    //Buscar el elemento entre los elementos duplicados
                    var elem=elemento.querySelector("[data-fxid='"+hijo.obtenerId()+"']");
                    hijo.clonar(null,oculto,elem);
                    //Avanzar recursivamente
                    fn(hijo);
                });
            };
            fn(this);
        }

        //Renombrar el elemento (se asume que está duplicado y debe asignarse a la nueva instancia)
        elemento.dato("fxid",nuevoId)
            .removerAtributo("id");
            
        var propiedades={
            id:nuevoId,
            oculto:oculto,
            selector:this.obtenerSelector(),
            componente:this.obtenerTipo(),
            propiedades:this.obtenerPropiedades()
        };

        var comp=ui.crearComponente(propiedades,this.vista);

        comp.establecerElemento(elemento);

        return comp;
    };

    /**
     * Inicializa la instancia.
     * @param {boolean} [omitirEventos=false] - Si es true, se omitirá la asignación de los eventos predefinidos.
     * @returns {componente}
     */ 
    this.inicializar=function(omitirEventos) {
        if(this.fueInicializado) return this;

        if(this.elemento) {
            //Las clases css que se mantengan al salir del modo de edición deben ser breves
            this.elemento.agregarClase("componente "+this.componente);
            this.clasesCss.push(this.componente);

            this.elemento.metadato("componente",this);

            if(!this.contenidoEditable) this.elemento.propiedad("contenteditable",false);
        }

        if(this.contenedor) {
            this.contenedor.agregarClase("contenedor"); //.contenedor hace referencia al elemento que contiene los hijos, a diferencia de
                                                        //.container que es la clase de Bootstrap.
            //if(!this.hijos.length) this.contenedor.agregarClase("vacio");
        }

        this.establecerId();

        if(typeof omitirEventos==="undefined"||!omitirEventos) this.establecerEventos();

        if(!ui.enModoEdicion()) this.establecerDatos();
        
        return this;
    };

    /**
     * Verifica y procesa las propiedades al inicializarse la instancia.
     * @returns {componente}
     */
    this.procesarPropiedades=function() {
        //Vamos a verificar si hay propiedades cuyos valores contengan expresiones y, en esos casos, reasignarlas para que las expresiones sean procesadas.
        if(!this.valoresPropiedades) return this;

        var t=this;

        /*this.valoresPropiedades.porCada(function(clave,valor) {
            //Únicamente para valores no adaptativos
            if(typeof valor!=="string"||!valor.trim()||!/[\{\}]+/.test(valor)) return;

            //Los eventos tampoco deben procesarse
            var prop=t.obtenerParametrosPropiedad(clave);
            if(!prop||prop.evento) return;

            //Evaluar expresiones con las propiedades del origen de datos definidas como variables
            var resultado=ui.evaluarExpresion(valor,t.datos);

            //Aplicar el nuevo valor
            t.propiedadModificada(clave,resultado,null,valor);
        });*/

        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.crearComponente();
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crearComponente=function() {
        this.establecerId();
        return this;
    };

    /**
     * Elimina el componente.
     * @param {boolean} [descendencia] - Si está definido y es `true`, indica que se está eliminando el componente por ser descendencia de otro componente eliminado. Parámetro de
     * uso interno; omitir al solicitar eliminar este componente.
     * @returns {componente}
     */
    this.eliminar=function(descendencia) {
        if(typeof descendencia==="undefined") descendencia=false;

        if(this.nombre) {
            if(this.vista.esPrincipal()) ui.removerComponente(this);
            if(this.controlador) this.controlador.removerComponente(this);
        }

        this.vista.removerComponente(this);

        ui.eliminarInstanciaComponente(this.id);

        //Eliminar estilos, solo en el editor, para no guardar basura; en ejecución se mantienen ya que puede existir una nueva instancia
        //con el mismo selector en el futuro (caso vistas embebibles que se destruyen y vuelven a crear).
        if(ui.enModoEdicion()) ui.removerEstilos(this.selector);

        //Avanzar recursivamente
        this.obtenerHijos().forEach(function(hijo) {
            hijo.eliminar(true);
        });

        this.elemento.remover();

        //Eliminar todas las referencias
        delete this.elemento;
        delete this.contenedor;
        delete this.elementoEditable;
        delete this.elementoEventos;
        delete this.campo;

        //Avisar a UI
        ui.componenteEliminado(this);
        
        return this;
    };

    /**
     * Establece el elemento del DOM correspondiente a esta instancia.
     * @param {Node} elem - Elemento.
     * @returns {componente}
     */
    this.establecerElemento=function(elem) {
        this.elemento=elem;

        this.fueInicializado=false;
        this.inicializar();

        return this;
    };

    /**
     * Inicializa la instancia en base a su ID y sus parámetros.
     * @returns {componente}
     */
    this.restaurar=function() {
        if(!this.elemento) {
            var vista=this.obtenerVista(),
                buscarEn=vista?vista.obtenerElemento():ui.obtenerCuerpo();
            this.elemento=buscarEn.querySelector("[data-fxid='"+this.id+"']");
        }

        if(this.elemento) {
            this.fueInicializado=false;
            this.inicializar(); 
        }

        return this;
    };

    /**
     * Establece el ID de la instancia. Si se omite id, intentará configurar el DOM de la instancia con un id previamente asignado.
     * @returns {componente}
     */
    this.establecerId=function(id) {
        if(typeof id!=="undefined") this.id=id;
        if(this.elemento) this.elemento.dato("fxid",this.id);
        return this;
    };

    /**
     * Establece el nombre de la instancia.
     * @param {string} [nombre] - Nuevo nombre. Si se omite, se mantendrá el valor actual (especificar `null` o `""` para remover el nombre).
     * @param {boolean} [oculto] - Si es `true`, permanecerá oculto, es decir que no se publicará en componentes. Si se omite, se mantendrá el valor actual.
     * @returns {componente}
     */
    this.establecerNombre=function(nombre,oculto) {
        if(typeof nombre==="undefined") nombre=this.nombre;
        if(typeof oculto==="undefined") oculto=this.oculto;

        this.oculto=oculto;

        //Eliminar de componentes y controlador.componentes si cambia el nombre
        if(this.nombre&&(this.nombre!=nombre||this.oculto)) {
            if(this.vista.esPrincipal()) ui.removerComponente(this);
            if(this.controlador) this.controlador.removerComponente(this);
        }
        
        this.nombre=nombre;
        
        //Registrar acceso rápido (esperar al evento Listo)
        if(nombre&&!this.oculto) {
            //Si pertenece a la vista principal, en window.componentes
            if(this.vista.esPrincipal()) ui.agregarComponente(this);
            //Y siempre en el controlador
            if(this.controlador) this.controlador.agregarComponente(this); 
        }

        return this;
    };

    /**
     * Devuelve `true` si el componente se encuentra en proceso de actualización o redibujado.
     * @reutns {boolean}
     */
    this.actualizando=function() {
        return this.actualizacionEnCurso;
    };

    /**
     * Actualiza el componente y sus hijos en forma recursiva (método para sobreescribir.) Este método no redibuja el componente ni reasigna todas sus propiedades. Está diseñado
     * para poder solicitar al componente que se refresque o vuelva a cargar determinadas propiedades, como el origen de datos. Cada componente concreto lo implementa, o no, de
     * forma específica.
     * @param {boolean} [actualizarHijos] - Determina si se debe desencadenar la actualización de la descendencia del componente. Por defecto, es `true` excepto en componentes
     * iterativos.
     * @returns {componente}
     */
    this.actualizar=function(actualizarHijos) {
        this.actualizacionEnCurso=true;

        if(this.iterativo) {
            actualizarHijos=false;
        } else if(typeof actualizarHijos==="undefined") {
            actualizarHijos=true;
        }
        if(!ui.enModoEdicion()) this.establecerDatos(undefined,false);

        this.actualizarPropiedadesExpresiones();

        //Cuando se asigne un origen de datos, esté establecida la propiedad `propiedadValor` y el componente presente un campo,
        //intentar asignar el valor desde el origen de datos (otros usos de la propiedad deben implementarse en actualizar() en el 
        //componente concreto)        
        if(this.campo) {
            var valor=this.obtenerDatos(true);
            if(typeof valor!=="undefined"&&valor!==null) this.valor(valor);
        }

        if(actualizarHijos) {
            var t=this;
            this.obtenerHijos().forEach(function(hijo) {
                hijo.redibujar=t.redibujar;
                hijo.actualizar();
            });
        }

        if(this.iterativo) this.actualizarIterativo();

        this.actualizacionEnCurso=false;
        this.redibujar=false;

        return this;
    };

    /**
     * Devuelve los estilos del componente.
     */
    this.obtenerEstilos=function(tamano) {
        //Generar un selector si aún no tenemos uno
        //Esto evita que todos los componentes tengan un selector, aún cuando no sea necesario
        if(!this.selector) this.generarSelector();

        var estilos=ui.obtenerEstilos(this.selector,tamano);        
        return estilos[0].estilos;
    };

    /**
     * Valida, corrige y agrega unidades a los valores de propiedades CSS.
     */
    this.normalizarValorCss=function(valor,tipo) {
        if(util.esIndefinido(tipo)) tipo="numerico";

        if(tipo=="numerico") {
            //Admitir 'auto'
            if(valor.trim()=="auto") return "auto";

            //Agregar unidad a los números (px por defecto)
            if(typeof valor==="number"||/^[0-9]+$/.test(valor)) return valor.toString()+"px";

            //Si es solo números con espacios (por ejemplo margin:10 20), agregar unidades a todos los números (margin:10px 20px)
            //Admitir 'auto'
            if(/^([0-9\s]|auto)+$/.test(valor)) {
                valor=valor.split(" ");
                valor.forEach(function(v,i) {
                    if(/^[0-9]+$/.test(v)) valor[i]=v.toString()+"px";
                });
                return valor.join(" ");
            }

            //TODO ¿Otros?
        } else if(tipo=="color") {
            //TODO
        }

        //TODO ¿Otros?

        return valor;
    };

    /**
     * Determina si la propiedad tiene un valor asignado, no vacío y distinto de null, ya sea global o en algún tamaño de pantalla.
     * @param {string} nombre - Propiedad a evaluar.
     * @returns {(boolean|null)}
     */
    this.propiedadAsignada=function(nombre) {
        //Determinar si la propiedad es adaptativa (por defecto, si)
        var adaptativa=true,
            definicion=this.buscarPropiedad(nombre);

        if(!definicion) return null;
        if(definicion.hasOwnProperty("adaptativa")) adaptativa=definicion.adaptativa;

        var fn=function(v) {
            return typeof v!=="undefined"&&v!==null&&v!=="";
        };

        if(!this.valoresPropiedades.hasOwnProperty(nombre)) return false;

        //Si no es adaptativa, devolver directamente si está asignado o no un valor
        if(!adaptativa) return !fn(this.valoresPropiedades[nombre]);

        //Si es adaptativa, verificar cada propiedad del objeto
        var tieneValores=false;
        for(var clave in this.valoresPropiedades[nombre]) {
            if(!this.valoresPropiedades[nombre].hasOwnProperty(clave)) continue;
            if(fn(this.valoresPropiedades[nombre][clave])) {
                tieneValores=true;
                break;
            }
        }
        return tieneValores;            
    };

    /**
     * Busca las propiedades que tengan asignado un valor con expresiones y aplica los valores resultantes.
     * @returns {componente}
     */
    this.actualizarPropiedadesExpresiones=function() {
        var tamano=ui.obtenerTamano(),
            t=this;

        this.valoresPropiedades.porCada(function(propiedad,valor) {
            //Solo si la propiedad es evaluable=true
            var config=t.obtenerParametrosPropiedad(propiedad);
            if(!config) return this;
            if(!config.hasOwnProperty("evaluable")||!config.evaluable) return this;

            //Obtener el valor correspondiente al tamaño actual
            valor=t.propiedadAdaptada(tamano,propiedad);

            //Evaluar expresión
            if(!expresion.contieneExpresion(valor)) return this;
            var resultado=t.evaluarExpresion(valor);

            //Asignar el resultado
            t.propiedadModificada(propiedad,resultado,tamano);
            t.postPropiedadModificada();
        });
        
        return this;
    };
    
    /**
     * Actualiza el componente tras la modificación de una propiedad.
     * @param {string} propiedad - Nombre de la propiedad.
     * @param {*} [valor] - Valor asignado.
     * @param {string} [tamano="g"] - Tamaño de pantalla.
     * @param {*} [valorAnterior] - Valor anterior.
     * @returns {componente}
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(util.esIndefinido(valor)) valor=this.propiedad(tamano?tamano:"g",propiedad);
        if(util.esIndefinido(tamano)) tamano=null;
        if(util.esIndefinido(valorAnterior)) valorAnterior=null;

        var parametrosPropiedad=this.obtenerParametrosPropiedad(propiedad),
            adaptativa=!parametrosPropiedad.hasOwnProperty("adaptativa")||parametrosPropiedad.adaptativa!==false; //Por defecto, si

        var claseTamano=(tamano!="g"&&tamano!="xs"?"-"+tamano:""),
            estilos;

        //Las propiedades que afecten estilos en el editor se guardan en la hoja de estilos, pero en tiempo de ejecución se establecen en línea
        if(!ui.enModoEdicion()) {
            estilos=this.elemento.style;
        } else {
            //Las propiedades con expresiones se ignoran en el editor (no deben quedar establecidas en el html ni en el css), excepto para propiedades
            //que tengan una consideración especial de las expresiones en tiempo de diseño (por ahora solo es el caso de `clase`).
            if(!~["clase"].indexOf(propiedad)&&expresion.contieneExpresion(valor)) valor=null;
            estilos=this.obtenerEstilos(adaptativa?tamano:"g"); //Utilizar siempre los estilos globales si la propiedad no es adaptativa
        }

        if(propiedad=="color") {
            estilos.color=this.normalizarValorCss(valor,"color");
            return this;
        }

        if(propiedad=="fondo") {
            estilos.background=this.normalizarValorCss(valor,"fondo");
            return this;
        }
        
        if(propiedad=="flotar") {
            var float=null;
            if(valor=="izquierda") float="left";
            else if(valor=="derecha") float="right";

            this.elemento.removerClase(new RegExp("float"+claseTamano+"-(left|right|none)"));
            if(float) this.elemento.agregarClase("float"+claseTamano+"-"+float);                
            
            return this;
        }
        
        if(propiedad=="margen") {
            //TODO Margen izq/der/arr/ab
            estilos.margin=this.normalizarValorCss(valor);
            return this;
        }
        
        if(propiedad=="ancho") {
            estilos.width=this.normalizarValorCss(valor);
            return this;
        }
        
        if(propiedad=="anchoMaximo") {
            estilos.maxWidth=this.normalizarValorCss(valor);
            return this;
        }
        
        if(propiedad=="anchoMinimo") {
            estilos.minWidth=this.normalizarValorCss(valor);
            return this;
        }
        
        if(propiedad=="alto") {
            estilos.height=this.normalizarValorCss(valor);
            return this;
        }
        
        if(propiedad=="altoMaximo") {
            estilos.maxHeight=this.normalizarValorCss(valor);
            return this;
        }
        
        if(propiedad=="altoMinimo") {
            estilos.minHeight=this.normalizarValorCss(valor);
            return this;
        }

        if(propiedad=="alineacion") {
            var opc={
                    izquierda:"left",
                    derecha:"right",
                    centro:"center",
                    justificado:"justify"
                },
                align=opc.hasOwnProperty(valor)?opc[valor]:null;

            this.elemento.removerClase(new RegExp("text"+claseTamano+"-(left|right|center|justify)"));
            if(align) this.elemento.agregarClase("text"+claseTamano+"-"+align);
            
            return this;
        }

        if(propiedad=="clase") {
            //Preservar clases propias del componente antes de agregar las clases del usuario, a fin de prevenir la eliminación
            //accidental de estas clases
            this.preservarClasesCss();

            if(valorAnterior) this.elemento.removerClase(valorAnterior)
            if(ultimaClase) this.elemento.removerClase(ultimaClase);
            if(valor&&valor.trim()!="") {
                ultimaClase=valor;

                //En modo de edición, remover las expresiones para poder asignar y previsualizar otras clases regulares
                if(ui.enModoEdicion()) {
                	var removerClases=[];
                	valor=new expresion(valor).evaluar(function(expr,posicion) {
                		var precede=valor.substring(0,posicion);
                		//La expresión es parte del nombre de una clase ("clase-{etc}"), remover también "clase-"
                		if(precede.substr(-1)!=" ") removerClases.push(precede.substring(precede.lastIndexOf(" ")));
                		//Remover la expresión
                		return "";
                	});
                	for(var i=0;i<removerClases.length;i++)
                		valor=valor.replace(removerClases[i],"");
                }

                this.elemento.agregarClase(valor);
            }

            //Volver a asignar las clases internas que puedan haberse removido
            this.establecerClasesCss();

            return this;
        }

        if(propiedad=="estructura") {
            var clases={
                    bloque:"block",
                    enLinea:"inline",
                    bloqueEnLinea:"inline-block",
                    flex:"flex",
                    flexInverso:"flex",
                    flexVertical:"flex",
                    flexVerticalInverso:"flex"
                };

            this.elemento.removerClase(new RegExp("d"+claseTamano+"-(block|flex|inline|inline-block)"));
            if(valor) this.elemento.agregarClase("d"+claseTamano+"-"+clases[valor]);

            this.elemento.removerClase(new RegExp("flex"+claseTamano+"-(row|column)(-reverse)?"));
            
            if(valor=="flexVertical") {
                this.elemento.agregarClase("flex"+claseTamano+"-column");
            } else if(valor=="flexInverso") {
                this.elemento.agregarClase("flex"+claseTamano+"-row-reverse");
            } else if(valor=="flexVerticalInverso") {
                this.elemento.agregarClase("flex"+claseTamano+"-column-reverse");
            }

            return this;
        }

        if(propiedad=="flex") {
            estilos.flex=valor;
            return this;
        }

        if(propiedad=="alineacionItems") {
            var clases={
                inicio:"start",
                fin:"end",
                centro:"center",
                entre:"between",
                envolver:"around"
            };

            this.elemento.removerClase(new RegExp("justify-content"+claseTamano+"-(start|end|center|between|around)"));
            if(valor) this.elemento.agregarClase("justify-content"+claseTamano+"-"+clases[valor]);            

            return this;
        }

        if(propiedad=="justificacionItems") {
            var clases={
                inicio:"start",
                fin:"end",
                centro:"center",
                base:"baseline",
                estirar:"stretch"
            };

            this.elemento.removerClase(new RegExp("align-items"+claseTamano+"-(start|end|center|baseline|stretch)"));
            if(valor) this.elemento.agregarClase("align-items"+claseTamano+"-"+clases[valor]);            

            return this;
        }

        if(propiedad=="visibilidad") {         
            var nombre=this.esFlex?"flex":"block";
            
            this.elemento.removerClase(new RegExp("^(visible|invisible)"+claseTamano+"$"))
                .removerClase(new RegExp("^d"+claseTamano+"-("+nombre+"|none)$"));

            if(valor=="invisible") {
                this.elemento.agregarClase("invisible"+claseTamano);
            } else if(valor=="oculto") {
                this.elemento.agregarClase("d"+claseTamano+"-none");
            } else if(valor=="visible") {
                this.elemento.agregarClase("d"+claseTamano+"-"+nombre+" visible"+claseTamano);
            }
            return this;
        }

        if(propiedad=="opacidad") {
            estilos.opacity=valor;
            return this;
        }
        
        if(propiedad=="peso") {
            var clases={
                fino:"light",
                normal:"normal",
                medio:"medium",
                negrita:"bold"
            };
            this.elemento.removerClase(/font-weight-(light|normal|medium|bold)/);
            if(valor) this.elemento.agregarClase("font-weight-"+clases[valor]);
            return this;
        }

        if(propiedad=="cursiva") {
            if(valor===true||valor===1||valor==="1") {
                this.elemento.agregarClase("font-italic");
            } else {
                this.elemento.removerClase("font-italic");
            }
            return this;
        }

        if(propiedad=="subrayado") {
            if(valor===true||valor===1||valor==="1") {
                this.elemento.agregarClase("subrayado");
            } else {
                this.elemento.removerClase("subrayado");
            }
            return this;
        }

        if(propiedad=="tachado") {
            if(valor===true||valor===1||valor==="1") {
                this.elemento.agregarClase("tachado");
            } else {
                this.elemento.removerClase("tachado");
            }
            return this;
        }

        if(propiedad=="autofoco") {
            if(valor===true||valor===1||valor==="1") {
                this.elemento.agregarClase("autofoco");
            } else {
                this.elemento.removerClase("autofoco");
            }
            return this;
        }

        if(propiedad=="tamano") {
            estilos.fontSize=this.normalizarValorCss(valor);
            return this;
        }

        if(propiedad=="deshabilitado") {
            if(valor===true||valor===1||valor==="1") {
                this.elemento.agregarClase("deshabilitado")
                    .propiedad("disabled",true);
            } else {
                this.elemento.removerClase("deshabilitado")
                    .removerAtributo("disabled");
            }
            return this;
        }

        if(propiedad=="ordenZ") {
            estilos.zIndex=valor;
            return this;
        }

        return this;
    };

    /**
     * Actualiza `clasesCssEstablecidas` con las clases internas actualmente asignadas, a fin de poder reestablecerse mediante `establecerClasesCss()`.
     */
    this.preservarClasesCss=function() {
        var res=[],
            clases=this.elemento.classList;

        for(var i=0;i<clases.length;i++) {
            if(util.buscarElemento(this.clasesCss,clases[i]))
                res.push(clases[i]);
        }

        clasesCssEstablecidas=res.join(" ");
    };

    /**
     * Establece o reestablece las clases CSS propias del componente.
     */
    this.establecerClasesCss=function() {
        this.elemento.agregarClase(clasesCssEstablecidas);
    };

    /**
     * Realiza tareas de mantenimiento tras modificarse una propiedad (método de uso interno). Este método se implementa porque en los componentes
     * concretos no es obligatorio invocar `propiedadModificada()` en el padre (es decir, en esta clase), por lo que buscamos hacer la limpieza en
     * un paso posterior.
     * @returns {componente}
     */
    this.postPropiedadModificada=function() {
        //Ordenar clases adaptativas
        var clases=Array.from(this.elemento.classList),
            ordenadas=[];

        if(!clases.length) return this;

        ["","sm","md","lg","xl"].porCada(function(i,tamano) {
            var regexp1=new RegExp("-"+tamano+"$"),
                regexp2=new RegExp("-"+tamano+"-");

            clases.porCada(function(j,clase) {
                //Remover clases inválidas
                if(clase.substr(0,1)=="-"||clase.substr(-1)=="-") return;

                if(
                    (!tamano&&!/-(sm|md|lg|xl)-/.test(clase)&&!/-(sm|md|lg|xl)$/.test(clase))||
                    (regexp1.test(clase)||regexp2.test(clase))
                ) ordenadas.push(clase);
            });
        });

        this.elemento.atributo("class",ordenadas.join(" "));

        return this;
    };

    ////Propiedades y parámetros

    /**
     * Devuelve el valor efectivo de la propiedad, que puede ser heredado desde un tamaño de pantalla menor al solicitado.
     * @param {string} tamano - Tamaño de pantalla.
     * @param {string} nombre - Nombre de la propiedad.
     * @returns {(string|null)}
     */
    this.propiedadAdaptada=function(tamano,nombre) {
        var valores=this.propiedadObj(nombre),
            tamanos=["g","sm","md","lg","xl"],
            valor=null;

        if(typeof valores!=="object"||!valores) return valores;

        if(tamano=="xs") tamano="g";

        if(valores.hasOwnProperty(tamano)) return valores[tamano];

        var iActual=tamanos.indexOf(tamano);
        for(var i=0;i<=iActual;i++)
            if(valores.hasOwnProperty(tamanos[i]))
                valor=valores[tamanos[i]];

        return valor;
    };

    /**
     * Establece o devuelve el valor de una propiedad como objeto (sin filtrar por tamaño).
     */
    this.propiedadObj=function(nombre,valor) {
        if(util.esIndefinido(valor)) {
            if(!this.valoresPropiedades.hasOwnProperty(nombre)) return null;
            return this.valoresPropiedades[nombre];
        }

        var anterior=this.valoresPropiedades[nombre];
        this.valoresPropiedades[nombre]=valor;
        this.propiedadModificada(nombre,valor,null,anterior);
        this.postPropiedadModificada();

        return this;
    };

    /**
     * Devuelve la definición de una propiedad.
     */
    this.buscarPropiedad=function(nombre) {
        var props=[this.propiedadesComunes,this.propiedadesConcretas];
        for(var i=0;i<2;i++) {
            for(var grupo in props[i]) {
                if(!props[i].hasOwnProperty(grupo)) continue;
                for(var prop in props[i][grupo]) {
                    if(!props[i][grupo].hasOwnProperty(prop)) continue;
                    if(prop==nombre) return props[i][grupo][nombre];
                }
            }
        }
        return null;        
    };

    /**
     * Establece o devuelve el valor de una propiedad.
     * @param {string} tamano - Tamaño de pantalla (xl, lg, md, sm, xs). Especificar xs, g o NULL trabajará con el valor global.
     * @param {string} nombre - Nombre de la propiedad.
     * @param {*} [valor] - Valor a asignar. Si se omite, devolverá el valor de `nombre`.
     *//**
     * Establece o devuelve el valor de una propiedad en forma global.
     * @param {string} nombre - Nombre de la propiedad.
     * @param {*} [valor] - Valor a asignar. Si se omite, devolverá el valor de `nombre`.
     *//**
     * Establece o devuelve el valor de una propiedad.
     * @param {boolean} evaluarExpresiones - Determina si se deben evaluar, o no, las expresiones.
     * @param {string} tamano - Tamaño de pantalla (xl, lg, md, sm, xs). Especificar xs, g o NULL trabajará con el valor global.
     * @param {string} nombre - Nombre de la propiedad.
     * @param {*} [valor] - Valor a asignar. Si se omite, devolverá el valor de `nombre`.
     *//**
     * Establece o devuelve el valor de una propiedad en forma global.
     * @param {boolean} evaluarExpresiones - Determina si se deben evaluar, o no, las expresiones.
     * @param {string} nombre - Nombre de la propiedad.
     * @param {*} [valor] - Valor a asignar. Si se omite, devolverá el valor de `nombre`.
     */
    this.propiedad=function(a,b,c,d) {
        var evaluar=true,
            tamano=null,
            nombre,
            valor;
        if(typeof a==="boolean") {
            evaluar=a;
            a=b;
            b=c;
            c=d;
        }
        if(typeof c!=="undefined") {
            //Tres argumentos
            tamano=a;
            nombre=b;
            valor=c;
        } else {
            if(a===null||a=="g"||a=="xl"||a=="lg"||a=="md"||a=="sm"||a=="xs") {
                //Dos argumentos pero el primero es el tamaño
                tamano=a;
                nombre=b;
            } else {
                //Uno o dos argumentos
                nombre=a;
                valor=b;
            }
        }
                
        if(nombre=="nombre") return;

        //xs y g son sinónmos, ya que en ambos casos los estilos son globales
        if(!tamano||tamano=="xs") tamano="g";

        //Determinar si la propiedad es adaptativa (por defecto, si)
        var adaptativa=true,
            evaluable=false,
            definicion=this.buscarPropiedad(nombre);
        if(definicion) {
            if(definicion.hasOwnProperty("adaptativa")) adaptativa=definicion.adaptativa;
            if(definicion.hasOwnProperty("evaluable")) evaluable=definicion.evaluable;
        }
        
        if(!evaluable) evaluar=false;

        if(util.esIndefinido(valor)) {
            if(!this.valoresPropiedades.hasOwnProperty(nombre)) return null;

            var obj=this.valoresPropiedades[nombre],
                resultado=null;

            if(!adaptativa) {
                resultado=obj;
            } else if(obj.hasOwnProperty(tamano)) {
                resultado=obj[tamano];
            } else {
                var tamanos=["g","sm","md","lg","xl"],
                    i=tamanos.indexOf(tamano)+1; //ya sabemos que el tamaño actual no existe, probamos el siguiente
                if(i<0) return null;
                for(;i<tamanos.length;i++) 
                    if(obj.hasOwnProperty(tamano)) {
                        resultado=obj[tamano];
                        break;
                    }
            }
            
            if(typeof resultado=="string") {
                if(ui.enModoEdicion()) return resultado;
                if(evaluar) resultado=this.evaluarExpresion(resultado);
            }
            
            return resultado;
        }

        var anterior;

        if(adaptativa) {
            if(!this.valoresPropiedades.hasOwnProperty(nombre)) this.valoresPropiedades[nombre]={};
            anterior=this.valoresPropiedades[nombre][tamano];
            this.valoresPropiedades[nombre][tamano]=valor;
        } else {
            anterior=this.valoresPropiedades[nombre];
            this.valoresPropiedades[nombre]=valor;
        }

        this.propiedadModificada(nombre,valor,tamano,anterior);
        this.postPropiedadModificada();

        return this;
    };

    /**
     * Devuelve el listado de propiedades ordenadas por grupo con valores.
     */
    this.obtenerListadoPropiedades=function(tamano) {
        if(util.esIndefinido(tamano)) tamano="g";
        var t=this;

        if(!propiedadesCombinadas) {
            propiedadesCombinadas={};

            ["propiedadesComunes","propiedadesConcretas"].forEach(function(v) {
                if(!t[v]) return;
                t[v].porCada(function(grupo,propiedades) {
                    propiedades.porCada(function(nombre,propiedad) {
                        if(!propiedadesCombinadas.hasOwnProperty(grupo)) propiedadesCombinadas[grupo]={};

                        if(!propiedad.hasOwnProperty("funcion")||!propiedad.funcion) propiedad.funcion=function(componentes,tamano,prop,valor) {
                            componentes.propiedad.call(componentes,tamano,prop,valor);
                        };
                        
                        propiedadesCombinadas[grupo][nombre]=propiedad;
                    });
                });
            });
        }

        propiedadesCombinadas.porCada(function(grupo,propiedades) {
            propiedades.porCada(function(nombre,propiedad) {
                propiedad.valor=t.propiedad(false,tamano,nombre);
            });
        });

        return propiedadesCombinadas;
    };

    /**
     * Reestablece la configuración a partir de un objeto previamente generado con obtenerPropiedades().
     */
    this.establecerPropiedades=function(obj) {
        if(typeof obj==="undefined") obj={};
        this.valoresPropiedades=obj;
        return this;
    };

    /**
     * Devuelve o establece el valor del componente. Si el componente no es un campo, devolverá `null`.
     * @param {*} [valor] - Valor a establecer. Si se omite, devolverá el valor actual.
     * @returns {(componente|undefined|*)}
     */
    this.valor=function(valor) {
        if(this.iterativo) {
            //Cuando se solicite el valor del componente, devolver el origen de datos actualizado con las propiedades que puedan haber cambiado
            if(typeof valor==="undefined") return this.extraerValor();            

            //Si valor es null, solo limpiar
            if(valor===null) {
                this.limpiarValoresAutogenerados(true);
                return this;
            }

            //Cuando se asigne un valor, establecer como origen de datos
            return this.establecerDatos(valor);
        }

        if(!this.campo) return this;

        if(typeof valor==="undefined") return this.campo.valor();
            
        this.campo.valor(valor);
        //if(document.activeElement===this.campo&&typeof this.campo.select==="function") this.campo.select();

        return this;
    };

    ////Editor de texto WYSIWYG
    
    this.iniciarEdicion=function(pausar) {
        if(util.esIndefinido(pausar)) pausar=true;
        
        if(!this.contenidoEditable||!ui.enModoEdicion()) return this;        

        var elem=this.elementoEditable?this.elementoEditable:this.elemento;
        elem.iniciarEdicion().focus();
        
        this.elemento.agregarClase("foxtrot-editando-texto");
        
        if(pausar) {
            //Deshabilitar arrastre en todo el árbol
            this.elemento.pausarArrastreArbol();
            //Deshabilitar otros eventos del editor
            editor.pausarEventos();
        }

        //Finalizar edición con ESC
        var t=this,
            fn=function(ev) {
                if(ev.which==27) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    t.finalizarEdicion();
                    ui.obtenerDocumento().removerEvento("keydown",fn);
                }
            };
        ui.obtenerDocumento().evento("keydown",fn);

        return this;
    };
    
    this.finalizarEdicion=function() {
        var elem=this.elementoEditable?this.elementoEditable:this.elemento;
        elem.finalizarEdicion();

        this.elemento.removerClase("foxtrot-editando-texto");

        //Reestablecer eventos
        this.elemento.pausarArrastreArbol(false);
        editor.pausarEventos(false);       

        return this;
    };

    ////Eventos
    
    /**
     * Establece los eventos predeterminados.
     * @returns {componente}
     */
    this.establecerEventos=function() {
        var t=this,
            elemento=this.elementoEventos?this.elementoEventos:this.elemento;
            
        if(!elemento) return this;

        if(!ui.enModoEdicion()) {
            elemento.removerEventos();

            //Eventos estándar

            //Click
            elemento.evento("click",function(ev) {
                t.procesarEvento("click","click","click",ev);
            });

            //Menú contextual
            elemento.evento("contextmenu",function(ev) {
                t.procesarEvento("contextmenu","menuContextual","menuContextual",ev);
            });

            //Modificación (solo campos)
            if(this.campo) elemento.evento("change input paste",function(ev) {
                    t.procesarEvento("change","modificacion","modificacion",ev);
                });

            //Intro (solo campos)
            if(this.campo) elemento.evento("keydown",function(ev) {
                    if(ev.which==13) t.procesarEvento("intro","intro","intro",ev);
                });

            //Click con botón medio
            elemento.evento("mousedown",function(ev) {
                if(ev.which==2) t.procesarEvento("click","click","click",ev,null,null,false,true);
            });            
        } else if(this.contenidoEditable) {
            this.elemento.evento("dblclick",function(ev) {
                ev.stopPropagation();                
                t.iniciarEdicion(false);
            });
        }

        this.fueInicializado=true;

        return this;
    };

    /**
     * Evalúa una expresión incluyendo las variables relacionadas al componente.
     * @param {string} cadena - Cadena a evaluar.
     * @param {*} [objeto] - Valor de `objeto`.
     * @returns {*}
     */
    this.evaluarExpresion=function(cadena,objeto) {
        if(typeof objeto=="undefined") objeto=this.obtenerDatos();
        return ui.evaluarExpresion(cadena,{ objeto:objeto, componente:this, controlador:this.controlador, valor:this.valor() });
    };

    /**
     * Procesa una cadena que representa el controlador de un evento, almacenada en las propiedades del componente.
     * @param {string} nombre - Nombre de la propiedad a leer.
     * @param {Object} [evento] - Objeto del evento.
     * @returns {*}
     */
    this.procesarCadenaEvento=function(nombre,evento) {
        if(typeof evento==="undefined") evento=null;

        var valor=this.propiedad(false,nombre);
        if(!valor) return null;
        if(typeof valor!=="string") return valor;

        //Evaluar expresiones, si las contiene
        return this.evaluarExpresion(valor);
    };

    /**
     * Procesa un evento.
     * @param {string} nombre - Nombre del evento.
     * @param {string} propiedad - Nombre de la propiedad.
     * @param {string} [metodo] - Método interno del componente.
     * @param {Event} [evento] - Objeto nativo del evento.
     * @param {*} [parametros] - Parámetros a pasar a la función.
     * @param {function} [retorno] - Función de retorno.
     * @param {boolean} [silencioso=false] - Deshabilita la precarga en caso de llamados al servidor.
     * @param {boolean} [nuevaVentana=false] - En caso de navegación, abrir la nueva vista o URL en una nueva ventana.
     * @returns {(ajax|*|undefined)}
     */
    this.procesarEvento=function(nombre,propiedad,metodo,evento,parametros,retorno,silencioso,nuevaVentana) {
        if(typeof metodo==="undefined") metodo=null;
        if(typeof evento==="undefined") evento=null;
        if(typeof parametros==="undefined") parametros=null;
        if(typeof retorno==="undefined") retorno=null;
        if(typeof silencioso==="undefined") silencioso=false;
        if(typeof nuevaVentana==="undefined") nuevaVentana=false;

        if(!evento) evento=document.createEvent("Event");

        this.obtenerDatosActualizados();

        //Si está deshabilitado, suprimir el evento
        var deshabilitado=this.propiedad(null,"deshabilitado");
        if(!deshabilitado) {
            //Verificar si es descendencia de un elemento deshabilitado
            //Realizaremos esto buscando en el DOM por clase .deshabilitado/disabled (compatible con Bootstrap) o atributo disabled, para
            //mayor eficiencia. Sería poco eficiente leer la propiedad deshabilitado de cada componente en toda la ascendencia ante cada evento.
            if(this.elemento.closest(".deshabilitado,.disabled,[disabled]")) deshabilitado=true;
        }
        if(deshabilitado) {
            evento.preventDefault();
            evento.stopPropagation();
            return this;
        }

        //Almacenar algunos metadatos en el objeto del evento
        evento.nombre=nombre;
        evento.componente=this;

        var detener=true,
            prevenir=true;

        evento.noDetener=function() {
            detener=false;
        };
    
        evento.noPrevenirPredeterminado=function() {
            prevenir=false;
        };

        //Método interno del componente
        if(metodo&&typeof this[metodo]==="function") {
            var ret=this[metodo](evento);
            //Los métodos que devuelvan true, detendrán el procesamiento del controlador
            if(ret===true) return;
        }       
                
        //Agregar los parámetros al evento
        if(parametros) {
            parametros.porCada(function(nombre,valor) {
                evento[nombre]=valor;
            });
        }
        
        //Al servidor, a menos que el componente haya especificado otros parámetros, se enviará un objeto con información del evento
        var parametrosServidor=parametros;
        if(!parametrosServidor) parametrosServidor={};
        parametrosServidor.componente=this.nombre;
        parametrosServidor.evento=nombre;
        parametrosServidor.vista=this.vista.obtenerNombreVista();

        //Controlador de evento definido por el usuario
        var controladorEvento=this.procesarCadenaEvento(propiedad,evento);

        var procesado=true;

        var ajax,resultadoLocal;

        if(typeof controladorEvento==="function") {
            resultadoLocal=controladorEvento(this,evento);

            if(retorno) retorno(resultadoLocal);
        } else if(typeof controladorEvento==="boolean"&&controladorEvento) {
            //Si la expresión devolvió true, se asume procesado el evento
            resultadoLocal=controladorEvento;

            if(retorno) retorno(resultadoLocal);
        } else if(typeof controladorEvento==="string") {
            if(/^[\d\.]+$/.test(controladorEvento)) {
                resultadoLocal=controladorEvento.indexOf(".")>=0?parseFloat(controladorEvento):parseInt(controladorEvento);
            } else {
                resultadoLocal=controladorEvento;
                var comando=null,
                    coincidencia=controladorEvento.match(/^(servidor|enviar|servidor-apl|enviar-apl|ir|no-ir|abrir|apl):(.+)/);                
                if(coincidencia) {
                    comando=coincidencia[1];
                    controladorEvento=coincidencia[2];
                } else {
                    //Corregir \: (ejemplo enviar\:test -> enviar:test, sin tomarlo como comando)
                    controladorEvento=controladorEvento.replace(/^(servidor|enviar|servidor-apl|enviar-apl|ir|no-ir|abrir|apl)\:/,"$1:");
                }

                var vista=this.vista,
                    ctl=this.controlador,
                    apl=ui.aplicacion();

                if(comando=="servidor"||comando=="enviar"||comando=="servidor-apl"||comando=="enviar-apl") {
                    //Método del controlador de servidor

                    //servidor y enviar => Controlador de vista
                    var obj=ctl;
                    //servidor-apl y enviar-apl => Controlador de aplicacion
                    if(comando=="servidor-apl"||comando=="enviar-apl") obj=apl;

                    if(silencioso) obj.servidor.establecerOpcionesProximaConsulta({ precarga:false });                

                    var args=[parametrosServidor];
                    //enviar y enviar-apl => El primer parámetro serán los valores de los componentes
                    if(comando=="enviar"||comando=="enviar-apl") args.unshift(ui.obtenerValores(vista));

                    //Retorno
                    var fn=function(respuesta) {
                        if(retorno) retorno(respuesta);
                    };

                    //Invocar el método
                    if((comando=="servidor"||comando=="enviar")&&controladorEvento.indexOf(".")>=0) {
                    	//controlador.metodo (no debería admitirse más de un punto)
                    	var partes=controladorEvento.split("."),
                    		nombreControlador=partes[0],
                    		nombreMetodo=partes[1];
                    	ajax=servidor.invocarMetodo({
                    		controlador:nombreControlador,
                    		metodo:nombreMetodo,
                    		retorno:fn,
                    		parametros:args
                    	});
                    } else {
                    	//Utilizar el controlador (JS)
                    	var metodo=obj.servidor[controladorEvento];
                    	args.unshift(fn);
                    	ajax=metodo.apply(obj.servidor,args);
                    }
                } else if(comando=="ir") {
                    //Navegación
                    ui.irA(controladorEvento,nuevaVentana);
                } else if(comando=="no-ir") {
                    //Reemplazar URL sin navegar
                    ui.noIrA(controladorEvento,nuevaVentana);
                } else if(comando=="abrir") {
                    //Popup
                    ui.abrirVentana(controladorEvento);
                } else if(comando=="apl") {
                    //Propiedad del controlador de aplicacion
                    var obj=ui.aplicacion();
                    resultadoLocal=obj[controladorEvento].call(obj,this,evento);

                    if(retorno) retorno(resultadoLocal);
                } else if(comando) {
                    //Controlador de evento con el formato nombreComponente:valor invocará el método eventoExterno(valor,evento) en el
                    //componente. Cada comppnente puede decidir qué hacer con el valor. De esta forma implementamos la navegación
                    //en el widget de importación de vista manteniendo loz componentes concretos desacoplados.
                    
                    var nombre=comando,
                        valor=controladorEvento;
                    resultadoLocal=obj.eventoExterno.call(this,valor,evento);

                    if(retorno) retorno(resultadoLocal);
                } else if(controladorEvento!="") {
                    //Propiedad del controlador
                    if(ctl&&typeof ctl[controladorEvento]==="function") resultadoLocal=ctl[controladorEvento].call(ctl,this,evento);

                    if(retorno) retorno(resultadoLocal);
                }
                //El acceso a otras funciones o métodos se puede realizar a través de expresiones que devuelvan funciones
                //Nota: No validamos las propiedades ni tipos antes de invocar las funciones intencionalmente, para que produzcan error. Eventualmente debemos implementar
                //      un control de errores interno, que valide estos casos y arroje errores de Foxtrot.
            }
        } else if(typeof manejador==="number") {
            resultadoLocal=manejador;
        } else {
            procesado=false;
        }

        if(procesado) {
            if(prevenir) evento.preventDefault();
            if(detener) evento.stopPropagation();
        }

        return typeof ajax!=="undefined"?ajax:resultadoLocal;
    };

    /**
     * Recepción de eventos externos. Los eventos externos son desencadenados por aquellos navegadores con el formato `nombre:...` donde `nombre` es el nombre del componente.
     * @param {*} valor 
     * @param {Object} evento 
     * @returns {*}
     */
    this.eventoExterno=function(valor,evento) {
    };

    /**
     * Evento Click. Devolver `true` suprimirá el evento.
     * @param {MouseEvent} evento - Parámetros del evento.
     * @returns {boolean}
     */
    this.click=function(evento) {
        return false;
    };

    /**
     * Evento Menú contextual. Devolver `true` suprimirá el evento.
     * @param {MouseEvent} evento - Parámetros del evento.
     * @returns {boolean}
     */
    this.menuContextual=function(evento) {
        var valor=this.procesarCadenaEvento("menuContextual");
        if(valor) {
            var componente=ui.obtenerInstanciaComponente(valor);
            if(componente) {
                //var posicion=this.elemento;
                //Mostrar siempre sobre el cursor
                var posicion={
                    x:evento.clientX,
                    y:evento.clientY
                };

                ui.abrirMenu(componente.obtenerElemento(),posicion);
                
                evento.preventDefault();
                evento.stopPropagation();
            }
        }

        //Siempre se detiene, aunque no haya sido procesado
        return true;
    };

    /**
     * Evento intro. Devolver `true` suprimirá el evento.
     * @param {KeyboardEvent} evento - Parámetros del evento.
     * @returns {boolean}
     */
    this.intro=function(evento) {
        return false;
    };

    /**
     * Evento keydown. Devolver `true` suprimirá el evento.
     * @param {KeyboardEvent} evento - Parámetros del evento.
     * @returns {boolean}
     */
    this.modificacion=function(evento) {
        return false;
    };

    ////Eventos de la instancia
    
    /**
     * Evento 'Inicializado'.
     * @returns {(boolean|undefined)}
     */
    this.inicializado=function() {
    };
    
    /**
     * Evento 'Insertado'. El evento Insertado es invocado cuando el component es insertado en el DOM, ya sea tras ser creado o al
     * ser movido, únicamente en modo de edición.
     * @returns {(boolean|undefined)}
     */
    this.insertado=function() {
    };

    /**
     * Evento Listo.
     * @returns {(boolean|undefined)}
     */
    this.listo=function() {
        this.listoEjecutado=true;
        
        if(this.iterativo) {
            //Ocultar toda la descendencia para que las instancias originales de los campos que se van a duplicar no se vean afectadas
            //al obtener/establecer los valores de la vista
            this.ocultarDescendencia();
        }

        this.procesarPropiedades();
    };

    /**
     * Evento `fin`.
     */
    this.fin=function() {
    };
    
    /**
     * Evento 'Tamaño'.
     * @param {string} tamano - Tamaño actual (`'xl'`,`'lg'`,`'md'`,`'sm'`,`'xs'`).
     * @param {(string|null)} tamanoAnterior - Tamaño anterior (`'xl'`,`'lg'`,`'md'`,`'sm'`,`'xs'` o `null` si es la primer invocación al cargar la vista).
     */
    this.tamano=function(tamano,tamanoAnterior) {
        if(!this.elemento) return;
        this.actualizarPropiedadesExpresiones();
    };

    /**
     * Evento `editor`.
     * @returns {(boolean|undefined)}
     */
    this.editor=function() {
        this.modoEdicionListo=true;
    };

    /**
     * Evento `editorDesactivado`.
     * @returns {(boolean|undefined)}
     */
    this.editorDesactivado=function() {
        this.modoEdicionListo=false;
    };

    /**
     * Devuelve si ya fue preparado para editar.
     * @returns {boolean}
     */
    this.editando=function() {
        return this.modoEdicionListo;
    };

    /**
     * Evento 'Seleccionado'.
     * @param {boolean} estado
     * @returns {(boolean|undefined)}
     */
    this.seleccionado=function(estado) {
    }; 
    
    /**
     * Evento 'Navegación'. Devolver `true` suspenderá la navegación.
     * @param {string} nombreVista - Nombre de la vista de destino.
     * @returns {(boolean|undefined)}
     */
    this.navegacion=function(nombreVista) {
    };
    
    /**
     * Evento 'Volver'. Devolver `true` suspenderá la navegación.
     * @returns {(boolean|undefined)}
     */
    this.volver=function() {
    };

    ////Utilidades

    /**
     * Intenta enviar el formulario (componente Formulario) al que pertenece el componente.
     * @returns {componente}
     */
    this.enviarFormulario=function() {
        //Ejecutar evento Click en el botón predeterminado del formulario
        var formulario=this.elemento,
            boton=null;
        if(!formulario.es({clase:"formulario"})) formulario=formulario.padre({clase:"formulario"});
        if(formulario) boton=formulario.querySelector(".predeterminado");
        if(boton) boton.ejecutarEvento("click");
        return this;
    };

    /**
     * Devuelve la configuración del tipo de componente.
     * @returns {Object}
     */
    this.obtenerConfigComponente=function() {
        return ui.obtenerComponentes()[this.componente].config;
    };

    /**
     * Da foco al componente.
     */
    this.foco=function() {
        (this.campo||this.elemento).focus();
        if(this.campo&&typeof this.campo.select==="function") this.campo.select();
        return this;
    };

    /**
     * Devuelve o establece si el componente se encuentra o no habilitado.
     * @param {boolean} [habilitado] - Si se especifica, habilitará (`true`) o deshabilitará (`false`) el componente.
     * @returns {boolean}
     */
    this.habilitado=function(habilitado) {
        if(typeof habilitado!="undefined") {
            if(habilitado) {
                this.habilitar();
            } else {
                this.deshabilitar();
            }
            return habilitado;
        }
        
        var deshabilitado=this.propiedad("deshabilitado");
        return !deshabilitado;
    };

    /**
     * Habilita el componente (acceso directo a establecer la propiedad deshabilitado=false).
     * @returns {componente}
     */
    this.habilitar=function() {
        this.propiedad(null,"deshabilitado",false);
        return this;
    };

    /**
     * Deshabilita el componente (acceso directo a establecer la propiedad deshabilitado=true).
     * @returns {componente}
     */
    this.deshabilitar=function() {
        this.propiedad(null,"deshabilitado",true);
        return this;
    };

    /**
     * Devuelve si el componente se encuentra visible *de acuerdo a su propiedad `visibilidad`* (no tiene en cuentra otros
     * posibles estilos que puedan mantenerlo oculto).
     * @returns {boolean}
     */
    this.visible=function() {
        var valor=this.propiedad("visibilidad");
        return !valor||valor==="visible";
    };

    /**
     * Oculta el componente (acceso directo a establecer la propiedad visibilidad=oculto).
     * @returns {componente}
     */
    this.ocultar=function() {
        this.propiedad("visibilidad","oculto");
        return this;
    };

    /**
     * Muestra el componente (acceso directo a establecer la propiedad visibilidad=visible).
     * @returns {componente}
     */
    this.mostrar=function() {
        this.propiedad("visibilidad","visible");
        return this;
    };

    ////Árbol

    //La jerarquía estará definida exclusivamente por el DOM, no almacenaremos información de las relaciones entre los componentes en el JSON

    /*var coincideFiltroComponente=function(comp,filtro) {
        if(filtro.hasOwnProperty("componente")&&comp.componente==filtro.componente) return true;
        if(filtro.hasOwnProperty("nombre")&&comp.nombre==filtro.nombre) return true;
        if(filtro.hasOwnProperty("elemento")&&comp.elemento.es(filtro.elemento)) return true;
        return false;
    };*/

    /**
     * Devuelve un array de componentes hijos, o un listado de componentes de su descendencia que coincidan con el filtro.
     * @param {boolean} [recursivo=false] - Buscar recursivamente toda la descendencia.
     * @returns {componente[]}
     */
    this.obtenerHijos=function(recursivo) {
        if(typeof recursivo=="undefined") recursivo=false;

        var hijos=[];
        
        //Los componentes no serán necesariamente hijos directos, por lo tanto debemos profundizar en la descendencia en el DOM hasta encontrar
        //un componente (no puede utilizarse querySelectorAll ya que solo necesitamos el primer nivel)
        
        var fn=function(padre) {
            var elementos=padre.hijos();
            for(var i=0;i<elementos.length;i++) {
                if(elementos[i].es({clase:"componente"})) {
                    var comp=ui.obtenerInstanciaComponente(elementos[i]);
                    if(comp) {
                        hijos.push(comp);
                        if(recursivo) fn(elementos[i]);
                    }
                } else {
                    fn(elementos[i]);
                }
            }
        };

        var elem=this.contenedor||this.elemento;
        if(elem) fn(elem);

        return hijos;
    };

    /**
     * Devuelve el componente padre.
     * @returns {componente}
     */
    this.obtenerPadre=function() {
        var elem=this.elemento.padre({
            clase:"componente"
        });
        if(!elem) return null;
        return ui.obtenerInstanciaComponente(elem);
    };

    /**
     * Mueve el componente a una nueva posición dentro del padre.
     * @param {number} orden - Nueva posición, comenzando desde `0`.
     * @returns {componente}
     */
    this.mover=function(orden) {
        var padre=this.elemento.parentNode,
            hermanos=padre.hijos();
        this.elemento.desacoplar();
        if(hermanos.length>orden) {
            hermanos[orden].insertarAntes(this.elemento);
        } else {
            padre.anexar(this.elemento);
        }
        return this;
    };    

    /**
     * Busca y devuelve todos los componentes del mismo tipo cuya propiedad coincida con el valor especificado.
     * @param {string} propiedad - Nombre de la propiedad.
     * @param {*} valor - Valor a buscar.
     * @returns {componente[]}
     */
     this.buscarComponentes=function(propiedad,valor) {
        var t=this,
            elems=this.vista.obtenerElemento().querySelectorAll(".componente."+this.componente),
            resultado=[];
    
        elems.forEach(function(elem) {
            var componente=ui.obtenerInstanciaComponente(elem);
            if(!componente||componente.propiedad(propiedad)!=valor) return;
            resultado.push(componente);
        });

        return resultado;
    };

    ////Datos

    /**
     * Establece toda la descendencia como oculta.
     * @param {componente} [comp] - Uso interno.
     * @returns {componente}
     */
    this.ocultarDescendencia=function(comp) {
        if(typeof comp==="undefined") comp=this;
        var t=this;
        comp.obtenerHijos().forEach(function(hijo) {
            hijo.establecerComponenteOculto();
            t.ocultarDescendencia(hijo);
        });
        return this;
    };

    /**
     * Busca todos los componentes con nombre que desciendan de este componente y devuelve un objeto con sus valores.
     * @returns {Object}
     */
    this.obtenerValores=function() {
        if(this.iterativo) {
            //Los componentes iterativos devuelven directamente su valor. No deben continuar la búsqueda en forma recursiva entre los
            //componentes autogenerados  
            if(this.nombre) {
                var obj=[];
                obj[this.nombre]=this.valor();
                return obj;
            }
            return null;
        }

        var hijos=this.obtenerHijos(),
            valores={};

        hijos.forEach(function(hijo) {            
            var nombre=hijo.obtenerNombre();
            if(nombre&&hijo.esCampo()&&!hijo.esComponenteOculto()) {
                var valor=hijo.valor();
                if(typeof valor!=="undefined") valores[nombre]=valor; //Un componente puede devolver nulo; se entiende que es un componente sin valor (como un contenedor) cuando devuelve indefinido
            }
            
            //Continuar la búsqueda en forma recursiva
            valores=Object.assign({},valores,hijo.obtenerValores());
        });

        return valores;
    };

    /**
     * Establece los valores de todos los componentes cuyos nombres coincidan con las propiedades del objeto.
     * @param {Object} valores - Pares nombre/valor a asignar.
     * @param {boolean} [inclusoOcultos=false] - Asignar componentes ocultos también.
     * @returns {componente}
     */
    this.establecerValores=function(valores,inclusoOcultos) {
        if(typeof inclusoOcultos==="undefined") inclusoOcultos=false;

        var hijos=this.obtenerHijos();

        hijos.forEach(function(hijo) {   
            var nombre=hijo.obtenerNombre(),
                propiedad=hijo.propiedad("propiedadValor");
            if(inclusoOcultos||!hijo.esComponenteOculto()) {
                if(nombre&&valores.hasOwnProperty(nombre)) {
                    hijo.valor(valores[nombre]);
                } else if(propiedad) {
                    hijo.valor(util.obtenerPropiedad(valores,propiedad));
                } else {
                    //hijo.valor(valores);
                }
            }
            
            //Continuar la búsqueda en forma recursiva
            hijo.establecerValores(valores,inclusoOcultos);
        });

        return this;
    };

    /**
     * Limpia los valores de todos los componentes con nombre que desciendan de este componente.
     * @returns {componente}
     */
    this.limpiarValores=function() {
        if(this.nombre||this.campo) this.valor(null);
        //Continuar la búsqueda en forma recursiva
        this.obtenerHijos().forEach(function(hijo) {
            hijo.limpiarValores();
        });
        return this;
    };    

    /**
     * Devuelve el origen de datos actualizado con las propiedades que hayan cambiado por tratarse de componentes de ingreso de datos (campos, etc.)
     * @param {componente[]} [buscarEn] - Parámetro de uso interno. Listado de componentes donde realizar la búsqueda de campos.
     * @returns {Object[]}
     */
    this.obtenerDatosActualizados=function(buscarEn) {
        if(typeof buscarEn=="undefined") buscarEn=this.itemsAutogenerados;

        var t=this,
            fn=function(comp,obj) {
                var asignarValor=function(hijo) {
                    var propiedad=hijo.propiedad("propiedadValor"),
                        nombre=hijo.obtenerNombre(),
                        valor;
                        
                    if(hijo.esCampo()) {
                        valor=hijo.valor();
                    } else {
                        //Si no es un campo, obtener el origen de datos actualizado, no su valor. Si bien es posible obtenerlo mediante valor(),
                        //queremos evitar posprocesamiento de los datos
                        valor=hijo.obtenerDatosActualizados();
                        if(propiedad) valor=util.obtenerPropiedad(valor,propiedad);
                    }

                    if(typeof valor!=="undefined") {
                        if(propiedad) {
                            util.asignarPropiedad(obj,propiedad,valor);
                        } else if(nombre) {
                            obj[nombre]=valor;
                        }
                    }
                };
                asignarValor(comp);
                comp.obtenerHijos().forEach(function(hijo) {
                    asignarValor(hijo);
                    fn(hijo,obj);
                });
            };

        buscarEn.forEach(function(hijo) {
            var obj=t.obtenerObjetoDatos(hijo.ruta||hijo.indice);

            //Dentro de cada item, buscar recursivamente todos los componentes relacionados con una propiedad
            if(t.datos.length>hijo.indice)
                fn(hijo,obj);
        });

        return this.datos;
    };   

    /**
     * Devuelve un elemento del origen de datos correspondiente a un índice o, en el caso de listados a nidados, una ruta.
     * @param {(number|string|number[])} [indice] - Índice, o ruta como array o índices separados por punto, comenzando desde `0` (por ejemplo `0.1.0`).
     * @param {string} [propiedadRecursiva] - Nombre de la propiedad para avanzar en forma recursiva, si corresponde.
     * @returns {(Object|null)}
     */
    this.obtenerObjetoDatos=function(indice,propiedadRecursiva) {
        if(typeof propiedadRecursiva=="undefined") propiedadRecursiva=null;

        var obj=this.datos;

        if(!propiedadRecursiva)
            return obj[indice];

        var ruta=indice;
        if(typeof ruta=="string") ruta=ruta.split(".");

        for(var i=0;i<ruta.length;i++) {
            var item=parseInt(ruta[i]);
            
            if(i>0) {
                if(!obj.hasOwnProperty(propiedadRecursiva)||!util.esArray(obj[propiedadRecursiva])) return null;
                obj=obj[propiedadRecursiva];
            }

            if(!util.esArray(obj)||obj.length<item) return null;

            obj=obj[item];
        }

        return obj;
    };

    /**
     * Agrega un nuevo elemento.
     * @param {*} [obj] - Elemento a insertar.
     * @returns {componente}
     */
    this.agregarElemento=function(obj) {
        if(typeof obj=="undefined") obj={};

        if(!util.esArray(this.datos)) this.datos=[];
        var idx=this.datos.push(obj)-1;

        this.removerMensajeSinDatos();

        //Agregar el nuevo elemento sin redibujar todo
        this.generarItems(idx);
        
        //Autofoco
        ui.autofoco(this.itemsAutogenerados[idx].obtenerElemento());

        return this;
    };

    /**
     * Agrega los elementos del listado provisto.
     * @param {*[]} listado - Listado (*array*) de elementos a insertar.
     * @returns {componente}
     */
    this.agregarElementos=function(listado) {
        var t=this;

        listado.porCada(function(i,elem) {
            t.agregarElemento(elem);
        });

        return this;
    };

    /**
     * Remueve un elemento dado su índice.
     * @param {number} indice - Número de fila (basado en 0).
     * @returns {componente}
     */
    this.removerElemento=function(indice) {
        this.datos.splice(indice,1);
        this.actualizar();
        return this;
    };

    ////Componentes iterativos

    /**
     * Genera y devuelve el valor de retorno según las propiedades `filtrarPropiedades` y `filtrarItems` para componentes iterativos.
     * @param {string} [propiedadRecursiva] - Nombre de una propiedad para recorrer el listado en forma recursiva.
     * @param {boolean} [devolverListado=false] - Al analizar un listado recursivo, indica si debe devolverse un listado plano (`true`) o mantenerse la
     * estructura anidada (`false`).
     * @returns {*}
     */
    this.extraerValor=function(propiedadRecursiva,devolverListado) {
        if(typeof propiedadRecursiva=="undefined") propiedadRecursiva=null;
        if(typeof devolverListado=="undefined") devolverListado=false;
        
        var obj=this.obtenerDatosActualizados(),
            propiedades=this.propiedad(false,"filtrarPropiedades"),
            filtro=this.propiedad(false,"filtrarItems");

        if(!obj) return obj;

        var filtrar=function(item) {
            if(filtro&&!item[filtro]) return null;

            if(!propiedades||typeof item!="object") return item;

            if(typeof propiedades!="string") {
                propiedades=propiedades.split(",");
                for(var i=0;i<propiedades.length;i++)
                    propiedades[i]=propiedades[i].trim();
            }

            var nuevoItem={};

            for(var prop in item) {
                if(~propiedades.indexOf(prop))
                    nuevoItem[prop]=item[prop];
            }

            return nuevoItem;
        },
        listado=[];

        (function recorrer(items,destino) {
            for(var i=0;i<items.length;i++) {
                var item=items[i],
                    filtrado=filtrar(item);

                if(filtrado===null) {
                    //Si el item no se incluye tras los filtros, se debe detener la búsqueda solo si el valor debe ser devuelto como árbol, de
                    //lo contrario, el item se omite pero continúa la búsqueda en forma recursiva añadiendo los items al listado independientemente
                    //de si la ascendencia fue incluida o no.
                    if(!devolverListado) continue;
                } else {
                    destino.push(filtrado);
                }

                if(propiedadRecursiva&&typeof item[propiedadRecursiva]=="object") {
                    if(devolverListado) {
                        //Agregar descendencia directamente en el listado 
                        recorrer(item[propiedadRecursiva],destino);
                    } else {
                        //Mantener la estructura anidada
                        filtrado[propiedadRecursiva]=[];
                        recorrer(item[propiedadRecursiva],filtrado[propiedadRecursiva]);
                    }
                }
            }
        })(obj,listado);
        
        return listado;
    };
    
    /**
     * Limpia los valores de los campos que se encuentren entre los items autogenerados.
     * @returns {componente}
     */
    this.limpiarValoresAutogenerados=function() {
        for(var i=0;i<this.itemsAutogenerados.length;i++)
            this.itemsAutogenerados[i].limpiarValores();
        return this;
    };
    
    /**
     * Elimina el mensaje de bloque sin datos, si existe.
     * @returns {componente}
     */
    this.removerMensajeSinDatos=function() {
        //A implementar en el componente concreto
        return this;
    };    

    /**
     * Genera el mensaje de bloque sin datos.
     * @returns {componente}
     */
    this.mostrarMensajeSinDatos=function() {
        //A implementar en el componente concreto
        return this;
    };    

    /**
     * Actualiza el componente iterativo.
     * @returns {componente}
     */
     this.actualizarIterativo=function() {
        if(ui.enModoEdicion()) return this;

        this.obtenerHijos(true).forEach(function(hijo) {
            hijo.plantilla=true;
            hijo.autogenerado=false; //en caso de iterativos anidados puede haber sido asignado true, debe reestablecerse
        });

        //Aplicar cambios en los campos
        //if(!this.descartarValores) this.obtenerDatosActualizados();
        this.descartarValores=false;

        var datos=this.obtenerDatosCrudos(true);

        if(this.redibujar||!util.esArray(datos)||!datos.length) {
            //Limpiar filas autogeneradas
            ui.eliminarComponentes(this.itemsAutogenerados);
            this.itemsAutogenerados=[];
        }
        
        this.removerMensajeSinDatos();

        if(!datos) return this;

        if(util.esArray(datos)&&!datos.length) {
            this.mostrarMensajeSinDatos();
        } else {
            this.generarItems();

            //Notificar actualización finalizada
            this.itemsAutogenerados.forEach(function(comp) {
                comp.actualizacionPadreCompleta();
            });
        }

        return this;
    };

    /**
     * Prepara un elemento del origen de datos con sus metadatos y funciones útiles.
     * @param {componente} componente - Componente o elemento del DOM.
     * @param {Object} obj - Objeto.
     * @param {number} indice - Índice dentro del origen de datos.
     * @param {Object} recursivo - Parámetros del recorrido recursivo del listado, si corresponde.
     * @returns {Object}
     */
    this.prepararElemento=function(componente,obj,indice,recursivo) {
        componente.indice=indice;
        
        if(!componente.autogenerado) {
            componente.autogenerado=true;
            componente.obtenerHijos(true).forEach(function(hijo) {
                hijo.autogenerado=true;
            });
        }

        //Notificar actualización en curso
        componente.actualizandoPadre();

        componente.establecerDatos(obj);

        if(recursivo) componente.ruta=recursivo.ruta.concat(indice).join(".");

        //Agregar métodos al origen de datos

        obj.obtenerIndice=(function(i) {
            return function() {
                return i;
            };
        })(indice);
        
        obj.obtenerNivel=(function(i) {
            return function() {
                return i;
            };
        })(recursivo?recursivo.nivel:null);

        obj.obtenerRuta=(function(i) {
            return function() {
                return i;
            };
        })(recursivo?recursivo.ruta.concat(indice).join("."):null);

        return componente;
    };

    /**
     * Genera y agrega un nuevo item correspondiente a un elemento del origen de datos del componente iterativo.
     * @param {Node} destino - Elemento de destino.
     * @param {*} objeto - Objeto o elemento del origen de datos.
     * @param {number} indice - Indice del elemento en el listado u origen de datos.
     * @param {Object} [recursivo] - Parámetros del recorrido recursivo del listado, si corresponde.
     * @returns {Node}
     */
    this.generarItem=function(destino,objeto,indice,recursivo) {
        var t=this;
        
        this.obtenerHijos().forEach(function(hijo) {
            if(hijo.autogenerado) return;
    
            var nuevo=hijo.clonar(destino,true);

            t.itemsAutogenerados.push(nuevo);

            t.prepararElemento(nuevo,objeto,indice,recursivo);

            nuevo.ocultarDescendencia();
            nuevo.obtenerElemento().agregarClase("autogenerado");
        });

        return destino;
    };

    /**
     * Genera los items del componente iterativo.
     * @param {number} [indice] - Índice del objeto de datos que se desea generar. Si se omite, iterará sobre todo el origen de datos. 
     * @param {object[]} [listado] - Listado a utilizar. Por defecto, utilizará el origen de datos.
     * @param {Node} [destino] - Elemento de destino. Por defecto, utilizará el elemento del componente.
     * @param {int} [recursivo.nivel=0] - Nivel actual.
     * @param {Object} [recursivo] - Parámetros para recorrer `listado` en forma recursiva. Puede presentar propiedades adicionales, las cuales serán pasadas
     * tal cual a la descendencia.
     * @param {string} [recursivo.propiedad] - Propiedad de cada elemento de `listado` que contiene la descendencia.
     * @param {int} [recursivo.nivel=0] - Nivel actual.
     * @param {int[]} [recursivo.ruta] - Ruta actual, como listado de índices.
     * @returns {componente}
     */
    this.generarItems=function(indice,listado,destino,recursivo) {
        if(typeof listado=="undefined") listado=this.obtenerDatosCrudos(true);
        if(typeof destino=="undefined") destino=this.contenedorItems||this.elemento;
        if(typeof recursivo=="undefined") recursivo=null;

        var t=this;

        var fn=function(obj,i) {
            //Por el momento, no soporta la actualización en listados anidados, por lo tanto si es recursivo se generan nuevos elementos siempre
            if(recursivo||i>=t.itemsAutogenerados.length)
                return t.generarItem(destino,obj,i,recursivo);
            
            //Actualizar elemento existente
            t.prepararElemento(t.itemsAutogenerados[i],obj,i,recursivo);
            return destino;
        },
        remover=function(i) {
            t.itemsAutogenerados[i].eliminar();
        };

        if(indice!==null&&!isNaN(indice)) {
            fn(listado[indice],indice);
        } else {
            if(recursivo) {
                //Inicializar objeto para el primer nivel (solo `propiedad` es requerido)
                if(typeof recursivo.nivel!="number") recursivo.nivel=0;
                if(typeof recursivo.ruta!="object") recursivo.ruta=[];
            }

            if(!listado) return this;
            
            listado.forEach(function(obj,indice) {
                var elemento=fn(obj,indice);

                //Si corresponde, avanzar recursivamente
                if(recursivo) {
                    if(obj.hasOwnProperty(recursivo.propiedad)) {
                        var copiaRecursivo=Object.assign({},recursivo);
                        copiaRecursivo.nivel=recursivo.nivel+1;
                        copiaRecursivo.ruta=recursivo.ruta.concat(indice);

                        //TODO Implementar util.recorrerSinRecursion()
                        t.generarItems(null,obj[recursivo.propiedad],elemento,copiaRecursivo);
                    }
                
                    //Agregar una clase CSS si el elemento no tiene descendencia
                    if(!obj.hasOwnProperty(recursivo.propiedad)||!util.esArray(obj[recursivo.propiedad])||!obj[recursivo.propiedad].length)
                        elemento.agregarClase("ultimo-nivel");
                }
            });

            //Remover items excedentes (excepto cuando el listado es anidado, ya que por el momento no soporta la actualización de elementos existentes)
            if(!recursivo&&listado.length<this.itemsAutogenerados.length) {
                for(var i=listado.length;i<this.itemsAutogenerados.length;i++)
                    remover(i);
                this.itemsAutogenerados.splice(listado.length);
            }
        }

        return this;
    };

    /**
     * Evento invocado por el componente iterativo en cada uno de los componentes autogenerados durante la actualización de su origen de datos.
     * @returns {componente}
     */
    this.actualizandoPadre=function() {
        this.obtenerHijos().forEach(function(comp) {
            comp.actualizandoPadre();
        });
        return this;
    };

    /**
     * Evento invocado por el componente iterativo en cada uno de los componentes autogenerados *luego* de finalizada la actualización de su
     * origen de datos.
     * @returns {componente}
     */
    this.actualizacionPadreCompleta=function() {
        this.obtenerHijos().forEach(function(comp) {
            comp.actualizacionPadreCompleta();
        });
        return this;
    };
};

window["componente"]=componente;
