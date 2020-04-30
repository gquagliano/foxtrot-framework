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
    Node.prototype.dato=function() {
        return Object.assign({},this.dataset);
    };

    /**
     * Acceso directo a querySelectorAll(sel).
     */
    Node.prototype.buscar=function(sel) {
        return this.querySelectorAll(sel);
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
     * Busca en la ascendencia el elemento que coincida con el filtro, o devuelve el padre directo si filtro no está definido.
     */
    Node.prototype.padre=function(filtro) {

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
        this[nombre]=valor;
        return this;
    };

    ////// Eventos

    EventTarget.prototype.evento=function(nombre,funcion,captura) {
        //Usamos un ID para poder encapsularla pero aún así poder identificar la función para removerla en removerEvento
        if(util.esIndefinido(funcion._id)) funcion._id=id++;

        var fn=function(ev) {
            funcion.call(this,ev);
        };

        //Almacenar para poder remover todo con removerEvento
        this.inicializarMetadatos();
        var meta=this.metadato("eventos");
        if(!meta.hasOwnProperty(nombre)) meta[nombre]={};
        meta[nombre][funcion._id]=[funcion,fn]; 

        this.addEventListener(nombre,fn,captura);

        return this;
    };

    EventTarget.prototype.removerEvento=function(nombre,funcion) {
        if(util.esIndefinido(nombre)) {
            //Remover todos los eventos registrados mediante evento()

            return this;
        }

        if(util.esIndefinido(funcion)) {
            //Remover todos los eventos nombre registrados mediante evento()

            return this;
        }

        //Buscar la funcion real
        if(util.esIndefinido(funcion._id)) return this;
        var meta=this.metadato("eventos");
        if(!meta.hasOwnProperty(nombre)) return this;
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

    //Métodos de Node y EventTarget que se aplican sobre todos los elementos de la lista
    ["metadato","dato","agregarClase","removerClase","alternarClase","evento","removerEvento","atributo","removerAtributo",
        "propiedad"].forEach(function(m) {
            NodeList.prototype[m]=function() {
                var args=Array.from(arguments);
                this.forEach(function(elem) {
                    elem[m].apply(elem,args);
                });
                return this;
            };
        });

    ////// Otros métodos útiles

    /**
     * Implementación de forEach en objetos.
     */
    Object.prototype.forEach=function(fn) {
        Object.keys(this).forEach(function(clave) {
            fn.call(this,clave,this[clave]);
        });
    };
})();

