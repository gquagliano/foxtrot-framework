/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

 /**
 * Extiende los prototipos del DOM.
 */
(function() {
    "use strict";

    var id=1,
        almacenMetadatos={};

    ////// Métodos para los elementos del DOM

    /**
     * Devuelve el ID del elemento, inicializandolo si es necesario.
     */
    Node.prototype.obtenerId=function() {
        if(util.esIndefinido(this._id)) this._id=id++;
        return this._id;    
    };

    /**
     * Inicializa los metadatos de un elemento del DOM. Trabaja con una instancia de Element (no objetoDom).
     */
    Node.prototype.inicializarMetadatos=function() {
        var obj=this.metadatos(this);
        if(!obj.hasOwnProperty("eventos")) obj.eventos={};
        if(!obj.hasOwnProperty("valores")) obj.valores={};
    };

    /**
     * Establece o devuelve matadatos del elemento. Trabaja con un almacén de metadatos común a todos los elementos.
     */
    Node.prototype.metadato=function(clave,valor) {
        var id=this.obtenerId();

        if(!almacenMetadatos.hasOwnProperty(id)) almacenMetadatos[id]={};
        var obj=almacenMetadatos[id];

        if(!util.esIndefinido(clave)&&!obj.hasOwnProperty(clave)) obj[clave]=null;

        if(util.esIndefinido(clave)) return obj;

        if(util.esIndefinido(valor)) return obj[clave];

        obj[clave]=valor;
        return this;
    };

    /**
     * Devuelve todos los metadatos del elemento.
     */
    Node.prototype.metadatos=function() {
        return this.metadato();
    };

    /**
     * Establece o devuelve datos (dataset) del elemento.
     */
    Node.prototype.dato=function(clave,valor) {
        if(util.esIndefinido(valor)) return this.dataset[clave];
        this.dataset[clave]=valor;
        return this;
    };

    /**
     * Devuelve todos los datos (dataset) del elemento.
     */
    Node.prototype.datos=function() {
        return Object.assign({},this.dataset);
    };

    /**
     * Acceso directo a querySelectorAll(sel).
     */
    Node.prototype.buscar=function(sel) {
        return this.querySelectorAll(sel);
    };

    /**
     * Devuelve o establece el valor del campo.
     */
    Node.prototype.valor=function(valor) {
        //TODO select (valor de la opción seleccionada)
        //TODO checkbox (booleano)
        if(util.esIndefinido(valor)) return this.value?this.value:"";
        this.value=valor;
        return this;
    };

    /**
     * Agrega los elementos especificados a los elementos de esta instancia.
     */
    Node.prototype.anexar=function(elemento) {
        if(typeof elemento==="string") {
            this.anexar(document.crear(elemento));
            return this;
        }

        if(elemento instanceof NodeList||elemento instanceof HTMLCollection) {
            var t=this;
            elemento.forEach(function(elem) {
                t.appendChild(elem);
            });
            return this;
        }

        this.appendChild(elemento);
        return this;
    };

    /**
     * Agrega este elemento a los elementos especificados.
     */
    Node.prototype.anexarA=function(elemento) {
        //TODO Si elemento es un NodeList, ¿clonar?
        elemento.anexar(this);
        return this;
    };

    /**
     * Determina si el elemento coincide con el filtro (¿por qué tiene que ser un selector como string?).
     * Propiedades de filtro:
     * clase            Tiene la(s) clase(s) css. Coincidencia exacta o RegExp.
     * nombre           Atributo name. Coincidencia exacta o RegExp.
     * id               Atributo id. Coincidencia exacta o RegExp.
     * etiqueta         Nombre de tag. Coincidencia exacta o RegExp.
     * atributos        Valor de atributos. Objeto {atributo:valor}. Coincidencia exacta o RegExp.
     * propiedades      Propiedades (readonly, disabled, etc.). Cadena o Array. Coincidencia exacta.
     * datos            Datos (dataset). Objeto {nombre:valor}. Coincidencia exacta o RegExp.
     * metadatos        Metadatos (internos). Objeto. Coincidencia exacta o RegExp.
     * tipo             Tipo de campo {nombre:valor}. Coincidencia exacta o RegExp.
     * Todas las propiedades deben coincidir, pero todos fitros con múltiples elementos se evalúan como OR. Se evalúan como string (no es sensible al tipo).
     */
    Node.prototype.es=function(filtro) {
        var resultado=false;

        function coincide(origen,valor) {
            if(typeof origen!=="string") origen=new Object(origen).toString();
            if(typeof valor!=="string"&&!(valor instanceof RegExp)) valor=new Object(valor).toString();
            return (typeof valor==="string"&&origen.toLowerCase()==valor.toLowerCase())||(valor instanceof RegExp&&valor.test(origen));
        }

        if(filtro.hasOwnProperty("clase")) {
            if(typeof filtro.clase==="string") {
                resultado=this.classList.contains(filtro.clase);
            } else if(filtro.clase instanceof RegExp) {
                for(var i=0;i<this.classList.length;i++) {
                    if(filtro.clase.test(this.classList[i])) {
                        resultado=true;
                        break;
                    }
                }
            }
        }

        if(filtro.hasOwnProperty("nombre")) {
            resultado=coincide(this.name,filtro.nombre);
        }

        if(filtro.hasOwnProperty("id")) {
            resultado=coincide(this.id,filtro.id);
        }

        if(filtro.hasOwnProperty("etiqueta")) {
            resultado=coincide(this.nodeName,filtro.etiqueta);
        }

        /*function buscarObjeto(origen,propiedad,objeto) {
            for(var i=0;i<origen.length;i++) {
                for(var j in objeto) {
                    if(!objeto.hasOwnProperty(j)) continue;
                    
                    var v=origen[i],
                        f=objeto[j];
                    if(propiedad) v=v[propiedad];
                    v=v.toLowerCase();

                    if(coincide(v,f)) return true;
                }            
            }
            return false;
        }*/

        function buscarObjeto(origen,propiedad,objeto) {
            for(var i in objeto) {
                if(!objeto.hasOwnProperty(i)||!origen.hasOwnProperty(i)) continue;
                
                var v=origen[i],
                    f=objeto[i];
                if(propiedad) v=v[propiedad];
                v=v.toLowerCase();

                if(coincide(v,f)) return true;
            }
            return false;
        }

        function buscarArray(origen,propiedad,array) {
            for(var i=0;i<origen.length;i++) {
                for(var j=0;j<array.length;j++) {
                    var v=origen[i],
                        f=array[j];
                    if(propiedad) v=v[propiedad];
                    v=v.toLowerCase();

                    if(coincide(v,f)) return true;
                }            
            }
            return false;
        }

        if(filtro.hasOwnProperty("atributos")) {
            resultado=buscarObjeto(this.attributes,"value",filtro.atributos);
        }

        if(filtro.hasOwnProperty("propiedades")) {
            var p=typeof filtro.propiedades==="string"?[filtro.propiedades]:filtro.propiedades;
            resultado=buscarArray(this.attributes,"name",p);
        }

        if(filtro.hasOwnProperty("datos")) {
            resultado=buscarObjeto(this.dataset,null,filtro.datos);
        }

        if(filtro.hasOwnProperty("metadatos")) {
            resultado=buscarObjeto(this.metadatos(),null,filtro.metadatos);
        }

        if(filtro.hasOwnProperty("tipo")) {
            resultado=coincide(this.nodeType,filtro.tipo);
        }

        return resultado;
    };

    /**
     * Determina si el nodo es un campo de formulario.
     */
    Node.prototype.esCampo=function() {
        return this.es({
            etiqueta:/(input|select|textarea|button)/i
        });
    };

    /**
     * Activa o desactiva el modo de edición.
     */
    Node.prototype.editable=function(estado) {
        if(util.esIndefinido(estado)) estado=true;
        this.propiedad("contentEditable",estado);

        //TODO controles de formato

        return this;
    };

    /**
     * Busca en la ascendencia el elemento que coincida con el filtro, o devuelve el padre directo si filtro no está definido.
     */
    Node.prototype.padre=function(filtro) {
        return this.parentNode;
        //TODO filtro
    };

    /**
     * Agrega una clase css a los elementos. Soporta múltiples clases separadas por espacios.
     */
    Node.prototype.agregarClase=function(clase) {
        var t=this;
        clase=clase.split(" ");
        clase.forEach(function(v) {
            t.classList.add(v);
        });
        return this;
    };

    /**
     * Remueve una clase css de los elementos. Soporta RegExp o múltiples clases separadas por espacios.
     */
    Node.prototype.removerClase=function(clase) {
        var t=this;

        if(clase instanceof RegExp) {
            var remover=[];
            this.classList.forEach(function(v) {
                if(clase.test(v)) remover.push(v);
            });
            remover.map(function(v) {
                t.classList.remove(v);
            });
            return this;
        }

        clase=clase.split(" ");
        clase.forEach(function(v) {
            t.classList.remove(v);
        });
        return this;
    };

    /**
     * Alterna una clase css en los elementos. Soporta RegExp o múltiples clases separadas por espacios.
     */
    Node.prototype.alternarClase=function(clase) {
        var t=this;

        if(clase instanceof RegExp) {
            var alternar=[];
            this.classList.forEach(function(v) {
                if(clase.test(v)) alternar.push(v);
            });
            alternar.map(function(v) {
                t.classList.toggle(v);
            });
            return this;
        }

        clase=clase.split(" ");
        clase.forEach(function(v) {
            t.classList.toggle(v);
        });
        return this;
    };

    /**
     * Establece o devuelve el valor de un atributo.
     */
    Node.prototype.atributo=function(nombre,valor) {
        var atrib;

        if(util.esIndefinido(valor)) {
            atrib=this.attributes.getNamedItem(nombre);
            return atrib?atrib.value:null;
        }

        atrib=document.createAttribute(nombre);
        atrib.value=valor;
        this.attributes.setNamedItem(atrib);

        return this;
    };

    /**
     * Remueve un atributo.
     */
    Node.prototype.removerAtributo=function(nombre) {
        if(!this.attributes.getNamedItem(nombre)) return this;
        this.attributes.removeNamedItem(nombre);
        return this;
    };

    /**
     * Devuelve o asigna una propiedad.
     */
    Node.prototype.propiedad=function(nombre,valor) {
        if(util.esIndefinido(valor)) return this[nombre];
        if(valor===null) {
            this[nombre]=false;
            this.removeAttribute(nombre);
        } else {
            this[nombre]=valor;
        }
        return this;
    };

    /**
     * Devuelve un objeto {x,y} con la posición relativa del elemento.
     */
    Node.prototype.posicion=function() {
        //TODO
        return {
            x: null,
            y: null
        };
    };

    /**
     * Devuelve un objeto {x,y} con la posición del elemento según está establecido en sus estilos.
     */
    Node.prototype.posicionEstilos=function() {
        var estilos=this.estilos();
        return {
            top: parseFloat(estilos.top),
            bottom: parseFloat(estilos.bottom),
            left: parseFloat(estilos.left),
            right: parseFloat(estilos.right)
        };
    };
    
    /**
     * Devuelve un objeto {x,y} con la posición absoluta del elemento.
     */
    Node.prototype.posicionAbsoluta=function() {
        return {
            x: this.offsetLeft,
            y: this.offsetTop
        };
    };

    /**
     * Prepara un valor arbitrario para que pueda ser asignado como valor de un estilo css.
     */
    function normalizarValorCss(valor) {
        if(typeof valor==="number") valor=valor+"px";
        return valor;
    }

    /**
     * Devuelve el valor del estilo, si valor no está definido, o asigna el mismo. Estilo puede ser un objeto para establecer múltiples estilos a la vez.
     */
    Node.prototype.estilos=function(estilo,valor) {
        if(util.esIndefinido(estilo)) return getComputedStyle(this);
        
        if(util.esCadena(estilo)) {
            if(util.esIndefinido(valor)) return getComputedStyle(this)[estilo];
            this.style[estilo]=normalizarValorCss(valor);
            return this;
        }        

        //Objeto de estilos
        var t=this;
        estilo.forEach(function(clave,valor) {
            t.estilos(clave,valor);
        });

        return this;
    };

    /**
     * Alias de estilos(estilo,valor).
     */
    Node.prototype.estilo=function(estilo,valor) {
        return this.estilos(estilo,valor);
    };

    /**
     * Devuelve el ancho del elemento, incluyendo bordes (pero no márgenes). Si el elemento es document, devolverá el ancho de la página. Si el elemento
     * es window, devolverá el ancho de la ventana (viewport).
     */
    Node.prototype.ancho=function() {
        if(this===document) return document.body.offsetWidth;
        if(this===window) return window.innerWidth;
        return this.offsetWidth;
    };

    /**
     * Devuelve el alto del elemento, incluyendo bordes (pero no márgenes). Si el elemento es document, devolverá el alto de la página. Si el elemento
     * es window, devolverá el alto de la ventana (viewport).
     */
    Node.prototype.alto=function() {
        if(this===document) return document.body.offsetHeight;
        if(this===window) return window.innerHeight;
        return this.offsetHeight;
    };

    /**
     * Devuelve a sí mismo. El único propósito es que pueda llamarse obtener(x) en un elemento tal como si fuera NodeList, ahorrando verificar el tipo primero.
     */
    Node.prototype.obtener=function(i) {
        if(i==0) return this;
        return null;
    };

    /**
     * Acceso a innerHTML.
     */
    Node.prototype.html=function(html) {
        if(util.esIndefinido(html)) return this.innerHTML;
        this.innerHTML=html;
        return this;
    };

    /**
     * Acceso a innerText.
     */
    Node.prototype.texto=function(texto) {
        if(util.esIndefinido(texto)) return this.innerText;
        this.innerText=texto;
        return this;        
    };

    /**
     * Clona el elemento.
     */
    Node.prototype.clonar=function(conEventosDatos) {
        var clon=this.cloneNode(true);

        //TODO conEventosDatos

        return clon;
    };

    ////// Eventos

    /**
     * Devuelve todos los eventos con las funciones asignadas.
     */
    EventTarget.prototype.eventos=function() {
        
    };

    function establecerEvento(elem,nombre,funcionInterna,funcion,captura) {
        //Si nombre es el único parámetro, devolvemos todas las funciones asignadas
        if(util.esIndefinido(funcion)) {
            elem.inicializarMetadatos();
            var meta=elem.metadato("eventos");

            if(!meta.hasOwnProperty(nombre)) return [];

            var arr=[];
            //Necesitamos solo las funciones del usario, que están en el índice 0 de cada elemento
            meta[nombre].aArray().forEach(function(e) {
                arr.push(e[0]);
            });            
            return arr;
        }

        //Usamos un ID para poder encapsularla pero aún así poder identificar la función para removerla en removerEvento
        if(util.esIndefinido(funcion._id)) funcion._id=id++;

        //Almacenar para poder remover todo con removerEvento
        elem.inicializarMetadatos();
        var meta=elem.metadato("eventos");
        if(!meta.hasOwnProperty(nombre)) meta[nombre]={};
        meta[nombre][funcion._id]=[funcion,funcionInterna]; 

        elem.addEventListener(nombre,funcionInterna,captura);

        return elem;
    }

    EventTarget.prototype.evento=function(nombre,funcion,captura) {
        //funcion puede ser un array para asignar múltiples listeners a la vez
        if(util.esArray(funcion)) {
            var t=this;
            funcion.forEach(function(fn) {
                t.evento(nombre,fn,captura);
            });
            return this;
        }        

        //nombre puede contener múltiples eventos separados por espacios
        if(nombre.indexOf(" ")>0) {
            var t=this;
            nombre.split(" ").forEach(function(n) {
                t.evento(n,funcion,captura);
            });
            return this;
        }

        var t=this,
            fn=function(ev) {
                //this siempre será el elemento al cual se le asignó el evento
                funcion.call(t,ev);
            };

        return establecerEvento(this,nombre,fn,funcion,captura);
    };

    /**
     * Establece una función que será invocada cuando el evento suceda en los hijos que coincidan con el filtro. Si estricto es true, sólo se invocará cuando el 
     * elemento coincida con el filtro, pero no cuando se produzca en uno de sus hijos (por defecto es false).
     */
    EventTarget.prototype.eventoFiltrado=function(nombre,filtro,funcion,estricto) {
        if(util.esIndefinido(estricto)) estricto=false;

        //funcion puede ser un array para asignar múltiples listeners a la vez
        if(util.esArray(funcion)) {
            var t=this;
            funcion.forEach(function(fn) {
                t.eventoFiltrado(nombre,filtro,fn);
            });
            return this;
        }  

        //nombre puede contener múltiples eventos separados por espacios
        if(nombre.indexOf(" ")>0) {
            var t=this;
            nombre.split(" ").forEach(function(n) {
                t.eventoFiltrado(n,filtro,funcion,estricto);
            });
            return this;
        }

        var t=this,
            fn=function(ev) {
                var elemento=null;

                if(estricto) {
                    elemento=ev.path[0];
                    if(!elemento.es(filtro)) return;                    
                } else {
                    //Buscar en ev.path un elemento que coincida con el filtro
                    var elemento=null;
                    for(var i=0;i<ev.path.length;i++) {
                        var elem=ev.path[i];
                        if(elem instanceof HTMLBodyElement||elem==this) break;
                        if(elem.es(filtro)) {
                            elemento=elem;
                            break;
                        }
                    }
                    if(!elemento) return;
                }

                //this siempre será el elemento en el cual se disparó el evento
                funcion.call(elemento,ev);
            };
            
        return establecerEvento(this,nombre,fn,funcion,true);
    };

    EventTarget.prototype.removerEvento=function(nombre,funcion) {
        //funcion puede ser un array para remover múltiples listeners a la vez
        if(util.esArray(funcion)) {
            var t=this;
            funcion.forEach(function(fn) {
                t.removerEvento(nombre,fn);
            });
            return this;
        }

        //nombre puede contener múltiples eventos separados por espacios
        if(nombre.indexOf(" ")>0) {
            var t=this;
            nombre.split(" ").forEach(function(n) {
                t.removerEvento(n,funcion);
            });
            return this;
        }

        var meta=this.metadato("eventos");

        if(util.esIndefinido(nombre)) {
            //Remover todos los eventos registrados mediante evento()
            var t=this;
            meta.forEach(function(nombre,arr) {
                arr.forEach(function(id,ev) {
                    t.removeEventListener(nombre,ev[1]);
                });
            });
            return this;
        }

        if(!meta.hasOwnProperty(nombre)) return this;

        if(util.esIndefinido(funcion)) {
            //Remover todos los eventos nombre registrados mediante evento()
            var t=this;
            meta[nombre].forEach(function(id,ev) {
                t.removeEventListener(nombre,ev[1]);
            });
            return this;
        }

        //Buscar la funcion asignada al listener (que difiere de la función del usuario ya que es un contenedor)
        if(util.esIndefinido(funcion._id)) return this;
        var fn=meta[nombre][funcion._id][1];
        
        this.removeEventListener(nombre,fn);

        return this;
    };

    ////// Métodos para NodeList

    /**
     * Filtra los elementos y devuelve un nuevo listado.
     */
    NodeList.prototype.filtrar=function(filtro,negado) {
        if(util.esIndefinido(negado)) negado=false;

    };

    /**
     * Devuelve un elemento dado su índice, o null.
     */
    NodeList.prototype.obtener=function(i) {
        if(i<0||i>=this.length) return null;
        return this[i];
    };

    //Métodos de Node y EventTarget que se aplican sobre todos los elementos de la lista
    ["metadato","dato","agregarClase","removerClase","alternarClase","evento","removerEvento","atributo","removerAtributo","propiedad","estilos","estilo",
        "texto","html","anexar","anexarA"].forEach(function(m) {
            NodeList.prototype[m]=function() {
                var args=Array.from(arguments);
                this.forEach(function(elem) {
                    elem[m].apply(elem,args);
                });
                return this;
            };
        });

    //Copiar métodos de Node a Window
    ["obtenerId","inicializarMetadatos","metadato","metadatos","propiedad","ancho","alto"].forEach(function(m) {
        Window.prototype[m]=Node.prototype[m];
    });

    ////// Otros métodos útiles

    /**
     * Implementación de forEach en objetos.
     */
    Object.prototype.forEach=function(fn) {
        var t=this;
        Object.keys(t).forEach(function(clave) {
            fn.call(t,clave,t[clave]);
        });
        return this;
    };

    /**
     * Devuelve un array con los valores del objeto (descartando las propiedades).
     */
    Object.prototype.aArray=function() {
        return Object.values(this);
    };

    /**
     * Determina si el objeto es un objeto vacío.
     */
    Object.prototype.vacio=function() {
        for(var prop in this)
            if(this.hasOwnProperty(prop)) return false;
        return JSON.stringify(this)===JSON.stringify({});
    };

    /**
     * Crea un elemento a partir de su representación HTML. Devuelve un nodo o un NodeList según haya uno o más de un elemento en el primer nivel.
     */
    HTMLDocument.prototype.crear=function(html) {
        var div=document.createElement("div");
        div.innerHTML=html.trim();

        if(div.children.length==1) return div.children[0];
        return div.childNodes;
    };
})();

