/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

"use strict";

/**
 * Componente concreto.
 * @typedef Componente
 */

/**
 * @class Objeto base de los componentes.
 */
var componente=new function() {
    //Los métodos para sobreescribir en el componente concreto tienen una versión nnnComponente que permiten invocar
    //la funcionalidad por defecto.

    ////Privado
    
    var propiedadesCombinadas=null;

    ////Propiedades

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
    this.nombreVista=null;
    this.datos=null;
    this.oculto=false;
    this.campo=null;

    /**
     * Almacen de valores de parámetros.
     */
    this.valoresPropiedades=null;

    /**
     * Propiedades comunes a todos los componentes.
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
            //    boton (texto del botón en caso de tipo=comando)
            //}
            color:{
                etiqueta:"Color de texto",
                tipo:"color"
            },
            clase:{
                etiqueta:"Clase CSS",
                //TODO En el futuro, sería bueno tener clases adaptativas. Ello puede servir para muchas clases de Bootstrap, donde no tiene sentido reescribirlas con
                //sufijos (-md, -lg, etc.), pero por el momento es preferible evitar la carga de JS que implicaría verificar las clases de todos los componentes cada
                //vez que se redimensiona la pantalla.
                adaptativa:false
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
                }
            },
            margen:{
                etiqueta:"Margen"
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
                }
            },
            flex:{
                etiqueta:"Flex"
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
                }
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
                }
            },
            visibilidad:{
                etiqueta:"Visibilidad",
                tipo:"opciones",
                opciones:{
                    visible:"Visible",
                    invisible:"Invisible",
                    oculto:"Oculto"
                }
            },
            opacidad:{
                etiqueta:"Opacidad",
                tipo:"numero"
            }
        },
        "Dimensiones":{
            ancho:{
                etiqueta:"Ancho"
            },
            anchoMaximo:{
                etiqueta:"Ancho máximo"
            }, 
            anchoMinimo:{
                etiqueta:"Ancho mínimo"
            },            
            alto:{
                etiqueta:"Alto"
            },
            altoMaximo:{
                etiqueta:"Alto máximo"
            },
            altoMinimo:{
                etiqueta:"Alto mínimo"
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
                }
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
                adaptativa:false
            },
            cursiva:{
                etiqueta:"Cursiva",
                tipo:"bool",
                adaptativa:false
            },
            subrayado:{
                etiqueta:"Subrayado",
                tipo:"bool",
                adaptativa:false
            },
            tachado:{
                etiqueta:"Tachado",
                tipo:"bool",
                adaptativa:false
            },
            tamano:{
                etiqueta:"Tamaño de texto",
                tipo:"numero"
            }
        },
        "Eventos":{
            click:{
                etiqueta:"Click",
                adaptativa:false,
                evento:true
            },
            menuContextual:{
                etiqueta:"Menú contextual",
                adaptativa:false,
                ayuda:"Ingresar el nombre de un componente Menú existente en la vista, o una expresión que resuelva a una instancia de un componente Menú.",
                evento:true
            },
            intro:{
                etiqueta:"Intro",
                adaptativa:false,
                evento:true
            },
            modificacion:{
                etiqueta:"Modificación",
                adaptativa:false,
                evento:true
            }
        },
        "Datos":{
            propiedad:{
                etiqueta:"Propiedad",
                adaptativa:false,
                ayuda:"Propiedad del origen de datos. Admite rutas para acceder a propiedades anidadas, separadas por punto."
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
                adaptativa:false
            }
        }
    };

    /**
     * Propiedades del componente concreto (a sobreescribir).
     */
    this.propiedadesConcretas=null;

    ////Acceso a propiedades    

    /**
     * Devuelve el ID de la instancia.
     */
    this.obtenerId=function() {
        return this.id;
    };

    /**
     * Devuelve el nombre de la vista a la cual pertenece.
     */
    this.obtenerNombreVista=function() {
        return this.nombreVista;
    };

    /**
     * Asigna el nombre de la vista a la cual pertenece el componente.
     * @param {string} nombre - Nombre de la vista.
     * @reeturns {Componente}
     */
    this.establecerNombreVista=function(nombre) {
        this.nombreVista=nombre;
        return this;
    };

    /**
     * Devuelve la instancia de la vista (componente) a la cual pertenece.
     */
    this.obtenerVista=function() {
        return ui.obtenerInstanciaVista(this.nombreVista);
    };

    /**
     * Devuelve el nombre de la instancia.
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
     * @returns {Componente}
     */
    this.establecerComponenteOculto=function() {
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
     * @returns {Componente}
     */
    this.establecerSelector=function(nuevo,actualizar) {
        if(typeof actualizar==="undefined") actualizar=true;

        if(this.selector&&actualizar) {
            //Remover clase anterior (si es ID, se mantiene, aunque se eliminarán sus estilos)
            if(this.selector.substring(0,1)==".") this.elemento.removerClase(this.selector.substring(1));

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
            var pc=nuevo.substring(0,1);
            if(pc==".") {
                this.elemento.agregarClase(nuevo.substring(1));
            } else if(pc=="#") {
                this.elemento.atributo("id",nuevo.substring(1));
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
     * @reteurns {HTMLElement}
     */
    this.obtenerCampo=function() {
        return this.campo;
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
        return this.valoresPropiedades;
    };

    /**
     * Determina si el componente debe poder arrastrarse para reposicionarse o no.
     */
    this.esArrastrable=function() {
        return this.arrastrable;
    };

    /**
     * Devuelve el componente padre.
     * @returns {(Object|null)}
     */
    this.obtenerPadre=function() {
        return this.padre;
    };

    /**
     * Establece el origen de datos. El mismo será aplicado a toda la descendencia en forma recursiva (método para sobreescribir).
     * @param {Object} obj - Objeto a asignar.
     * @param {boolean} [actualizar=true] - Actualizar el componente luego de establecer el origen de datos.
     * @returns Componente
     */
    this.establecerDatos=function(obj,actualizar) {
        return this.establecerDatosComponente(obj,actualizar);
    };

    /**
     * Establece el origen de datos. El mismo será aplicado a toda la descendencia en forma recursiva.
     * @param {Object} obj - Objeto a asignar.
     * @param {boolean} [actualizar=true] - Actualizar el componente luego de establecer el origen de datos.
     * @returns Componente
     */
    this.establecerDatosComponente=function(obj,actualizar) {
        if(typeof actualizar==="undefined") actualizar=true;

        this.datos=obj;

        this.obtenerHijos().forEach(function(hijo) {
            hijo.establecerDatos(obj,actualizar);
        });

        if(actualizar) this.actualizar();

        return this;
    };

    /**
     * Devuelve el origen de datos actual.
     * @returns {Object}
     */
    this.obtenerDatos=function() {
        return this.datos;
    };

    /**
     * Busca una propiedad por su nombre y devuelve sus parámetros.
     * @param {strong} nombre - Nombre de la propiedad.
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
     */
    Object.prototype.esComponente=function() {
        return this.cttr()==componente.cttr();
    };    

    /**
     * Fabrica una instancia de un componente concreto dada su función.
     */
    this.fabricarComponente=function(fn) {
        //Heredar prototipo
        fn.prototype=new (this.cttr());

        var obj=new fn;

        //Inicializar las propiedades que son objetos (de otro modo, se copiarán las referencias desde el prototipo)
        obj.hijos=[];
        obj.valoresPropiedades={};

        return obj;
    };

    /**
     * Genera y devuelve un nuevo componente con las mismas propiedades y una copia del elemento del DOM.
     * @param {Componente} padre - Padre del nuevo componente. Puede ser null si se especificará elemento.
     * @param {boolean} [oculto=false] - Determina si el componente debe ser visible o permanecer anónimo aunque tenga un nombre asignado (a nivel API, no interfaz).
     * @param {(Node|Element)} [elemento] - Elemento del DOM. Si se especifica, en lugar de duplicar el actual, se intentará recuperar el mismo.
     * @returns {Componente}
     */
    this.clonar=function(padre,oculto,elemento) {
        if(typeof oculto==="undefined") oculto=false;
        if(typeof elemento==="undefined") elemento=null;

        var nuevoId=ui.generarId();

        if(!elemento) {
            //Duplicar el elemento del DOM
            var elemento=this.elemento.clonar(),
                elemPadre=padre;
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

        var nombre=this.obtenerNombre();

        if(nombre&&!oculto) {
            //Si es visible, vamos a buscar un nombre que esté libre para que no sobreescriba la referencia nuestra en componentes
            var i=1;
            while(componentes.hasOwnProperty(nombre+"-"+i)) i++;
            nombre+="-"+i;
        }
            
        var propiedades={
            id:nuevoId,
            oculto:oculto,
            nombre:nombre,
            selector:this.obtenerSelector(),
            componente:this.obtenerTipo(),
            propiedades:this.obtenerPropiedades()
        };

        var comp=ui.crearComponente(propiedades,this.nombreVista);

        comp.restaurar();

        return comp;
    };

    /**
     * Inicializa la instancia (método para sobreescribir).
     */    
    this.inicializar=function() {
        return this.inicializarComponente();
    };

    /**
     * Inicializa la instancia (método común para todos los componentes).
     * @param {boolean} [omitirEventos=false] - Si es true, se omitirá la asignación de los eventos predefinidos.
     */ 
    this.inicializarComponente=function(omitirEventos) {
        if(this.fueInicializado) return this;

        if(this.elemento) {
            //Las clases css que se mantengan al salir del modo de edición deben ser breves
            this.elemento.agregarClase("componente "+this.componente);
        }

        if(this.contenedor) {
            this.contenedor.agregarClase("contenedor"); //.contenedor hace referencia al elemento que contiene los hijos, a diferencia de
                                                        //.container que es la clase de Bootstrap.
            //if(!this.hijos.length) this.contenedor.agregarClase("vacio");
        }

        if(!this.contenidoEditable) this.elemento.propiedad("contenteditable",false);

        this.establecerId();

        if(typeof omitirEventos==="undefined"||!omitirEventos) this.establecerEventos();
        
        return this;
    };

    /**
     * Verifica y procesa las propiedades al inicializarse la instancia.
     * @returns {Componente}
     */
    this.procesarPropiedades=function() {
        //Vamos a verificar si hay propiedades cuyos valores contengan expresiones y, en esos casos, reasignarlas para que las expresiones sean procesadas.
        if(!this.valoresPropiedades) return this;

        var t=this;

        this.valoresPropiedades.porCada(function(clave,valor) {
            //Únicamente para valores no adaptativos
            if(typeof valor!=="string"||!valor.trim()||!/[\{\}]+/.test(valor)) return;

            //Los eventos tampoco deben procesarse
            var prop=t.obtenerParametrosPropiedad(clave);
            if(!prop||prop.evento) return;

            //Evaluar expresiones con las propiedades del origen de datos definidas como variables
            var resultado=ui.evaluarExpresion(valor,t.datos);

            //Aplicar el nuevo valor
            t.propiedadModificada(clave,resultado,null,valor);
        });

        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia (método para sobreescribir).
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
     * Elimina el componente (método para sobreescribir).
     * @param {boolean} [descendencia] - Si está definido y es true, indica que se está eliminando el componente por ser descendencia de otro componente eliminado. Parámetro de
     * uso interno; omitir al solicitar eliminar este componente.
     * @returns {Componente}
     */
    this.eliminar=function(descendencia) {
        this.eliminarComponente(descendencia);
        return this;
    };

    /**
     * Elimina el componente.
     * @param {boolean} [descendencia] - Si está definido y es true, indica que se está eliminando el componente por ser descendencia de otro componente eliminado.
     * @returns {Componente}
     */
    this.eliminarComponente=function(descendencia) {
        if(typeof descendencia==="undefined") descendencia=false;

        this.elemento.remover();
        if(this.nombre) delete componentes[this.nombre];
        ui.eliminarInstanciaComponente(this.id);

        //Eliminar estilos
        ui.removerEstilos(this.selector);

        //Avanzar recursivamente
        this.obtenerHijos().forEach(function(hijo) {
            hijo.eliminar(true);
        });
        
        return this;
    };

    this.establecerElemento=function(elem) {
        this.elemento=elem;

        this.fueInicializado=false;
        this.inicializar();

        return this;
    };

    /**
     * Inicializa la instancia en base a su ID y sus parámetros (método para sobreescribir).
     */
    this.restaurar=function() {
        this.restaurarComponente();
        return this;
    };

    /**
     * Inicializa la instancia en base a su ID y sus parámetros.
     */
    this.restaurarComponente=function() {
        if(!this.elemento) {
            //El elemento puede haber sido asignado en restaurar() o durante la creación de la instancia
            var body=ui.obtenerDocumento().body;
            this.elemento=body.querySelector("[data-fxid='"+this.id+"']");
        }
        if(this.elemento) {
            this.fueInicializado=false;
            this.inicializar(); 
        }        
        return this;
    };

    /**
     * Establece el ID de la instancia. Si se omite id, intentará configurar el DOM de la instancia con un id previamente asignado (método para sobreescribir).
     */
    this.establecerId=function(id) {
        this.establecerIdComponente(id);
        return this;
    };

    /**
     * Establece el ID de la instancia. Si se omite id, intentará configurar el DOM de la instancia con un id previamente asignado.
     */
    this.establecerIdComponente=function(id) {
        if(typeof id!=="undefined") this.id=id;
        if(this.elemento) this.elemento.dato("fxid",this.id);
        return this;
    };

    /**
     * Establece el nombre de la instancia (método para sobreescribir).
     * @param {string} nombre - Nuevo nombre.
     * @param {boolean} [oculto=false] - Si es true, permanecerá oculto, es decir que no se publicará en componentes.
     * @returns {Componente}
     */
    this.establecerNombre=function(nombre,oculto) {
        if(typeof oculto==="undefined") oculto=false;
        this.oculto=oculto;
        this.establecerNombreComponente(nombre);
        return this;
    };

    /**
     * Establece el nombre de la instancia.
     */
    this.establecerNombreComponente=function(nombre) {
        if(typeof nombre==="undefined") nombre=null;

        //Eliminar de componentes si cambia el nombre
        if((this.nombre!=nombre||this.oculto)&&componentes.hasOwnProperty(this.nombre)) delete componentes[this.nombre];

        this.nombre=nombre;

        if(nombre&&!this.oculto) {
            //Registrar acceso rápido
            if(this.nombreVista==ui.obtenerNombreVistaPrincipal()) {
                //Si pertenece a la vista principal, en window.componentes
                componentes[nombre]=this;
            } else {
                //En caso contrario, en el controlador
                var controlador=ui.obtenerInstanciaControladorVista(this.nombreVista);
                if(controlador) controlador.agregarComponente(this,nombre); //el controlador puede no existir, por ejemplo en el editor
            }
        }

        return this;
    };

    /**
     * Actualiza el componente y sus hijos en forma recursiva (método para sobreescribir.) Este método no redibuja el componente ni reasigna todas sus propiedades. Está diseñado
     * para poder solicitar al componente que se refresque o vuelva a cargar determinadas propiedades, como el origen de datos. Cada componente concreto lo implementa, o no, de
     * forma específica.
     */
    this.actualizar=function() {
        this.actualizarComponente();
        return this;
    };

    /**
     * Actualiza el componente y sus hijos en forma recursiva.
     */
    this.actualizarComponente=function() {
        //Cuando se asigne un origen de datos, esté establecida la propiedad `propiedad` y el componente presente un campo,
        //intentar asignar el valor desde el origen de datos (otros usos de la propiedad deben implementarse en actualizar() en el 
        //componente concreto)        
        if(this.datos&&this.campo) {
            var propiedad=this.propiedad(null,"propiedad");
            if(!propiedad) return this;

            var valor=this.datos[propiedad];
            if(typeof valor!=="undefined") this.valor(valor);
        }

        this.obtenerHijos().forEach(function(hijo) {
            hijo.actualizar();
        });

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

        if(!estilos.length) {
            //Inicializar
            ui.establecerEstilosSelector(this.selector,"",tamano);
            estilos=ui.obtenerEstilos(this.selector,tamano);
        }
        
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
     * Actualiza el componente tras la modificación de una propiedad (método para sobreescribir).
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        this.propiedadModificadaComponente(propiedad,valor,tamano,valorAnterior);
        return this;
    };
    
    /**
     * Actualiza el componente tras la modificación de una propiedad.
     */
    this.propiedadModificadaComponente=function(propiedad,valor,tamano,valorAnterior) {
        if(util.esIndefinido(valor)) valor=this.propiedad(tamano?tamano:"g",propiedad);
        if(util.esIndefinido(tamano)) tamano=null;
        if(util.esIndefinido(valorAnterior)) valorAnterior=null;

        var claseTamano=(tamano!="g"&&tamano!="xs"?"-"+tamano:"");

        var estilos=this.obtenerEstilos(tamano);

        if(propiedad=="color") {
            estilos.color=this.normalizarValorCss(valor,"color");
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
            if(valorAnterior) this.elemento.removerClase(valorAnterior)
            if(valor.trim()!="") this.elemento.agregarClase(valor);
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
            this.elemento.removerClase(new RegExp("^(visible|invisible)"+claseTamano+"$"))
                .removerClase(new RegExp("^d"+claseTamano+"-(block|none)$"));

            if(valor=="invisible") {
                this.elemento.agregarClase("invisible"+claseTamano);
            } else if(valor=="oculto") {
                this.elemento.agregarClase("d"+claseTamano+"-none");
            } else if(valor=="visible") {
                this.elemento.agregarClase("d"+claseTamano+"-block visible"+claseTamano);
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
            if(valor) {
                this.elemento.agregarClase("font-italic");
            } else {
                this.elemento.removerClase("font-italic");
            }
            return this;
        }

        if(propiedad=="subrayado") {
            if(valor) {
                this.elemento.agregarClase("subrayado");
            } else {
                this.elemento.removerClase("subrayado");
            }
            return this;
        }

        if(propiedad=="tachado") {
            if(valor) {
                this.elemento.agregarClase("tachado");
            } else {
                this.elemento.removerClase("tachado");
            }
            return this;
        }

        if(propiedad=="autofoco") {
            if(valor) {
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
            if(valor) {
                this.elemento.agregarClase("deshabilitado")
                    .propiedad("disabled",true);
            } else {
                this.elemento.removerClase("deshabilitado")
                    .removerAtributo("disabled");
            }
            return this;
        }

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

        if(typeof valores!=="object") return valores;

        if(valores.hasOwnProperty(tamano)) return valores[tamano];

        for(var i=0;i<tamanos.length;i++)
            if(valores.hasOwnProperty(tamanos[i])) {
                valor=valores[tamanos[i]];
                break;
            }

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
     */
    /**
     * Establece o devuelve el valor de una propiedad en forma global.
     * @param {string} nombre - Nombre de la propiedad.
     * @param {*} [valor] - Valor a asignar. Si se omite, devolverá el valor de `nombre`.
     */
    this.propiedad=function(a,b,c) {
        var tamano=null,nombre,valor;
        if(typeof c!=="undefined") {
            //Tres argumentos
            tamano=a;
            nombre=b;
            valor=c;
        } else {
            //Dos argumentos
            if(a===null||a=="g"||a=="xl"||a=="lg"||a=="md"||a=="sm"||a=="xs") {
                //Pero el primero es el tamaño
                tamano=a;
                nombre=b;
            } else {
                nombre=a;
                valor=b;
            }
        }
                
        if(nombre=="nombre") return;

        //xs y g son sinónmos, ya que en ambos casos los estilos son globales
        if(!tamano||tamano=="xs") tamano="g";

        //Determinar si la propiedad es adaptativa (por defecto, si)
        var adaptativa=true,
            definicion=this.buscarPropiedad(nombre);
        if(definicion&&definicion.hasOwnProperty("adaptativa")) adaptativa=definicion.adaptativa;

        if(util.esIndefinido(valor)) {
            if(!this.valoresPropiedades.hasOwnProperty(nombre)) return null;

            var obj=this.valoresPropiedades[nombre];

            if(!adaptativa) return obj;

            if(obj.hasOwnProperty(tamano)) return obj[tamano];

            var tamanos=["g","sm","md","lg","xl"],
                i=tamanos.indexOf(tamano)+1; //ya sabemos que el tamaño actual no existe, probamos el siguiente
            if(i<0) return null;
            for(;i<tamanos.length;i++) 
                if(obj.hasOwnProperty(tamano)) return obj[tamano];
            
            return null;
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
                propiedad.valor=t.propiedad(tamano,nombre);
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
     * Devuelve o establece el valor del componente (método para sobreescribir).
     * @param {*} [valor] - Valor a establecer. Si se omite, devolverá el valor actual.
     * @returns {(*|undefined)}
     */
    this.valor=function(valor) {
        if(this.campo) {
            if(typeof valor==="undefined") {
                return this.campo.valor();
            } else {
                this.campo.valor(valor);
            }
        }
    };

    ////Editor de texto WYSIWYG
    
    this.iniciarEdicion=function(pausar) {   
        if(util.esIndefinido(pausar)) pausar=true;

        var elem=this.elementoEditable?this.elementoEditable:this.elemento;
        elem.iniciarEdicion().focus();
        
        this.elemento.agregarClase("foxtrot-editando-texto");
        
        if(pausar) {
            //Deshabilitar arrastre en todo el árbol
            this.elemento.pausarArrastreArbol();
            //Deshabilitar otros eventos del editor
            editor.pausarEventos();
        }

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
     * Establece los eventos predeterminados (método para sobreescribir).
     */
    this.establecerEventos=function() {
        this.establecerEventosComponente();
        return this;
    };
    
    /**
     * Establece los eventos predeterminados.
     */
    this.establecerEventosComponente=function() {
        var t=this,
            elemento=this.elementoEventos?this.elementoEventos:this.elemento;
            
        if(!elemento) return this;

        if(!ui.enModoEdicion()) {
            elemento.removerEventos();

            //Eventos estándar
            var asignaciones={
                click:{},
                contextmenu:{
                    metodo:"menuContextual",
                    propiedad:"menuContextual"
                },
                change:{
                    metodo:"modificacion",
                    propiedad:"modificacion"
                }
            };

            asignaciones.porCada(function(evento,config) {
                var metodo=config.hasOwnProperty("metodo")?config.metodo:evento,
                    propiedad=config.hasOwnProperty("propiedad")?config.propiedad:evento;

                elemento.evento(evento,function(ev) {
                    t.procesarEvento(evento,propiedad,metodo,ev);
                });
            });

            //Intro
            elemento.evento("keydown",function(ev) {
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

                var fn=function(e) {
                    if(e.which==27) {
                        t.finalizarEdicion();
                        ui.obtenerDocumento().removerEvento("keydown",fn);
                        e.stopPropagation();
                        e.preventDefault();
                    }
                };
                ui.obtenerDocumento().evento("keydown",fn);
            });
        }

        this.fueInicializado=true;

        return this;
    };

    /**
     * Procesa una cadena que representa el manejador de un evento, almacenada en las propiedades del componente.
     * @param {string} nombre - Nombre de la propiedad a leer.
     * @param {Object} [evento] - Objeto del evento.
     * @returns {*}
     */
    this.procesarCadenaEvento=function(nombre,evento) {
        if(typeof evento==="undefined") evento=null;

        var valor=this.propiedad(null,nombre);
        if(!valor) return null;
        if(typeof valor!=="string") return valor;

        var vars=Object.assign({
            evento:evento,
            valor:this.valor(),
            //reemplazar controlador por el controlador de esta vista (puede no ser el principal, por ejemplo si es una vista embebible)
            controlador:ui.obtenerInstanciaControladorVista(this.nombreVista)
        },this.datos);
        
        //Evaluar expresiones, si las contiene
        return ui.evaluarExpresion(valor,vars);
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

        //Si está deshabilitado, suprimir el evento
        var deshabilitado=this.propiedad(null,"deshabilitado");
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
            //Los métodos que devuelvan true, detendrán el procesamiento del manejador
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
        parametrosServidor.vista=this.nombreVista;

        //Manejador definido por el usuario
        var manejador=this.procesarCadenaEvento(propiedad,evento);

        var procesado=true;

        var ajax,resultadoLocal;

        if(typeof manejador==="function") {
            resultadoLocal=manejador(this,evento);

            if(retorno) retorno(resultadoLocal);
        } else if(typeof manejador==="boolean"&&manejador) {
            //Si la expresión devolvió true, se asume procesado el evento
            resultadoLocal=manejador;

            if(retorno) retorno(resultadoLocal);
        } else if(typeof manejador==="string") {
            var comando=null,
                p=manejador.indexOf(":");
            if(p>0) {
                comando=manejador.substring(0,p);
                manejador=manejador.substring(p+1);
            }

            var vista=ui.obtenerInstanciaVista(this.nombreVista),
                ctl=ui.obtenerInstanciaControlador(vista.obtenerNombreControlador()),
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
                if(comando=="enviar"||comando=="enviar-apl") args.unshift(ui.obtenerValores());

                //Retorno
                args.unshift(function(respuesta) {
                    if(retorno) retorno(respuesta);
                });

                //Invocar el método
                var metodo=obj.servidor[manejador];
                ajax=metodo.apply(obj.servidor,args);
            } else if(comando=="ir") {
                //Navegación
                ui.irA(manejador,nuevaVentana);
            } else if(comando=="no-ir") {
                //Reemplazar URL sin navegar
                ui.noIrA(manejador,nuevaVentana);
            } else if(comando=="abrir") {
                //Popup
                ui.abrirVentana(manejador);
            } else if(comando=="apl") {
                //Propiedad del controlador de aplicacion
                var obj=ui.aplicacion();
                resultadoLocal=obj[manejador].call(obj,this,evento);

                if(retorno) retorno(resultadoLocal);
            } else if(comando) {
                //Manejador con el formato nombreComponente:valor invocará el método eventoExterno(valor,evento) en el
                //componente. Cada comppnente puede decidir qué hacer con el valor. De esta forma implementamos la navegación
                //en el widget de importación de vista manteniendo loz componentes concretos desacoplados.
                
                //Debemos buscarlo en forma global ya que es por nombre (ui los indiza por ID, TODO debería tener un almacén de vista->componente por nombre)
                var nombre=comando,
                    valor=manejador,
                    obj=componentes[nombre];
                resultadoLocal=obj.eventoExterno.call(obj,valor,evento);

                if(retorno) retorno(resultadoLocal);
            } else if(manejador!="") {
                //Propiedad del controlador
                var resultadoLocal=ctl[manejador].call(ctl,this,evento);

                if(retorno) retorno(resultadoLocal);
            }
            //El acceso a otras funciones o métodos se puede realizar a través de expresiones que devuelvan funciones
            //Nota: No validamos las propiedades ni tipos antes de invocar las funciones intencionalmente, para que produzcan error. Eventualmente debemos implementar
            //      un control de errores interno, que valide estos casos y arroje errores de Foxtrot.
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
     * Recepción de eventos externos (método para sobreescribir).
     * @param {*} valor 
     * @param {Object} evento 
     * @returns {*}
     */
    this.eventoExterno=function(valor,evento) {
    };

    /**
     * Evento Click (método para sobreescribir).
     * @param {Object} evento - Parámetros del evento.
     */
    this.click=function(evento) {
        return this.clickComponente(evento);
    };

    /**
     * Evento Click.
     * @param {Object} evento - Parámetros del evento.
     */
    this.clickComponente=function(evento) {
        return false;
    };

    /**
     * Evento Menú contextual (método para sobreescribir).
     * @param {Object} evento - Parámetros del evento.
     */
    this.menuContextual=function(evento) {
        return this.menuContextualComponente(evento);
    };

    /**
     * Evento Menú contextual.
     * @param {Object} evento - Parámetros del evento.
     */
    this.menuContextualComponente=function(evento) {
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
     * Evento intro (método para sobreescribir).
     * @param {Object} evento - Parámetros del evento.
     */
    this.intro=function(evento) {
        return this.introComponente(evento);
    };

    /**
     * Evento intro.
     * @param {Object} evento - Parámetros del evento.
     */
    this.introComponente=function(evento) {
        return false;
    };

    /**
     * Evento Modificacion (método para sobreescribir).
     * @param {Object} evento - Parámetros del evento.
     */
    this.modificacion=function(evento) {
        return this.modificacionComponente(evento);
    };

    /**
     * Evento keydown.
     * @param {Object} evento - Parámetros del evento.
     */
    this.modificacionComponente=function(evento) {
        return false;
    };

    ////Eventos de la instancia
    
    /**
     * Evento 'Inicializado' (método para sobreescribir).
     */
    this.inicializado=function() {
    };

    //TODO Agregar los métodos ...Componente que falten (inicializadoComponente, insertadoComponetne, etc.)
    
    /**
     * Evento 'Insertado'. El evento Insertado es invocado cuando el component es insertado en el DOM, ya sea tras ser creado o al
     * ser movido, únicamente en modo de edición.
     * @abstract
     */
    this.insertado=function() {
    };

    /**
     * Evento Listo (método para sobreescribir).
     * @returns {Componente}
     */
    this.listo=function() {
        return this.listoComponente();
    };

    /**
     * Evento Listo.
     * @returns {Componente}
     */
    this.listoComponente=function() {
        this.procesarPropiedades();
        return this;
    };

    /**
     * Evento `editor` (método para sobreescribir).
     * @returns {Componente}
     */
    this.editor=function() {
        return this.editorComponente();
    };

    /**
     * Evento `editor`.
     * @returns {Componente}
     */
    this.editorComponente=function() {
        return this;
    };

    /**
     * Evento `editorDesactivado` (método para sobreescribir).
     * @returns {Componente}
     */
    this.editorDesactivado=function() {
        return this.editorDesactivadoComponente();
    };

    /**
     * Evento `editorDesactivado`.
     * @returns {Componente}
     */
    this.editorDesactivadoComponente=function() {
        return this;
    };

    /**
     * Evento 'Seleccionado' (método para sobreescribir).
     * @param {boolean} estado
     * @returns {Componente}
     */
    this.seleccionado=function(estado) {
        return this.seleccionadoComponente(estado);
    };

    /**
     * Evento 'Seleccionado'.
     * @param {boolean} estado
     * @returns {Componente}
     */
    this.seleccionadoComponente=function(estado) {
        return this;
    }; 
    
    /**
     * Evento 'Navegación' (método para sobreescribir).
     * @param {string} nombreVista - Nombre de la vista de destino.
     */
    this.navegacion=function(nombreVista) {
    };
    
    /**
     * Evento 'Volver' (método para sobreescribir).
     * @returns {boolean}
     */
    this.volver=function() {
    };

    ////Utilidades

    /**
     * Intenta enviar el formulario (componente Formulario) al que pertenece el componente.
     * @returns {Componente}
     */
    this.enviarFormulario=function() {
        //Ejecutar evento Click en el botón predeterminado del formulario
        var formulario=this.campo.padre({clase:"formulario"}),
            boton=null;
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
        return this;
    };

    /**
     * Devuelve si el componente se encuentra habilitado.
     * @returns {boolean}
     */
    this.habilitado=function() {
        var deshabilitado=this.propiedad(null,"deshabilitado");
        return !deshabilitado;
    };

    /**
     * Habilita el componente (acceso directo a establecer la propiedad deshabilitado=false).
     * @returns {Componente}
     */
    this.habilitar=function() {
        this.propiedad(null,"deshabilitado",false);
        return this;
    };

    /**
     * Deshabilita el componente (acceso directo a establecer la propiedad deshabilitado=true).
     * @returns {Componente}
     */
    this.deshabilitar=function() {
        this.propiedad(null,"deshabilitado",true);
        return this;
    };

    /**
     * Oculta el componente (acceso directo a establecer la propiedad visibilidad=oculto).
     * @returns {Componente}
     */
    this.ocultar=function() {
        this.propiedad(null,"visibilidad","oculto");
        return this;
    };

    /**
     * Muestra el componente (acceso directo a establecer la propiedad visibilidad=visible).
     * @returns {Componente}
     */
    this.mostrar=function() {
        this.propiedad(null,"visibilidad","visible");
        return this;
    };

    ////Árbol
    
    //La jerarquía estará definida exclusivamente por el DOM, no almacenaremos información de las relaciones entre los componentes en el JSON

    /**
     * Devuelve el componente padre.
     * @returns {Componente}
     */
    this.obtenerPadre=function() {
        var elem=this.elemento.padre({
            clase:"componente"
        });
        if(!elem) return null;
        var comp=ui.obtenerInstanciaComponente(elem);
        return comp;
    };

    /**
     * Devuelve un array de componentes hijos.
     * @returns {Componente[]}
     */
    this.obtenerHijos=function() {
        var hijos=[];
        
        //Los componentes no serán necesariamente hijos directos, por lo tanto debemos profundizar en la descendencia hasta en contrar un componente (no puede utilizarse
        //querySelectorAll para esto ya que seleccionaría *todos* los componentes)
        
        var fn=function(padre) {
            var elementos=padre.hijos();
            for(var i=0;i<elementos.length;i++) {
                if(elementos[i].es({clase:"componente"})) {
                    var comp=ui.obtenerInstanciaComponente(elementos[i]);
                    if(comp) hijos.push(comp);
                } else {
                    fn(elementos[i]);
                }
            }
        };

        fn(this.contenedor||this.elemento);       

        return hijos;
    };

    /**
     * Establece toda la descendencia como oculta.
     * @param {Componente} [comp] - Uso interno.
     * @returns {Componente}
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
        var hijos=this.obtenerHijos(),
            valores={};

        hijos.forEach(function(hijo) {            
            var nombre=hijo.obtenerNombre();
            if(nombre&&!hijo.esComponenteOculto()) {
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
     * @returns {\Componente}
     */
    this.establecerValores=function(valores) {
        var hijos=this.obtenerHijos();

        hijos.forEach(function(hijo) {   
            var nombre=hijo.obtenerNombre();
            if(nombre&&valores.hasOwnProperty(nombre)&&!hijo.esComponenteOculto()) {
                hijo.valor(valores[nombre]);
            }
            
            //Continuar la búsqueda en forma recursiva
            hijo.establecerValores(valores);
        });

        return this;
    };

    /**
     * Limpia los valores de todos los componentes con nombre que desciendan de este componente.
     * @returns {\Componente}
     */
    this.limpiarValores=function() {
        this.obtenerHijos().forEach(function(hijo) {   
            if(hijo.obtenerNombre()) hijo.valor(null);
            //Continuar la búsqueda en forma recursiva
            hijo.limpiarValores();
        });
        return this;
    };
};

window["componente"]=componente;
