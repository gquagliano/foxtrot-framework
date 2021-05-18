/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

/**
 * Componente concreto Campo de carga de archivo.
 * @class
 * @extends componente
 */
var componenteArchivo=function() {
    "use strict";

    this.componente="archivo";

    this.etiqueta=null;
    this.barra=null;
    this.boton=null;
    this.archivos=[];
    this.ajax=null;
    this.subidaEnCurso=false;
    this.datosCordova=null;
    this.opcionesCordova={};

    /**
     * Propiedades de Campo.
     */
    this.propiedadesConcretas={
        "Archivo":{
            multiple:{
                etiqueta:"Múltiple",
                tipo:"bool",
                adaptativa:false
            },
            acepta:{
                etiqueta:"Acepta",
                adaptativa:false
            },
            multimedia:{
                etiqueta:"Multimedia",
                tipo:"opciones",
                opciones:{
                    audio:"Audio",
                    video:"Video",
                    videoFrontal:"Video (cámara frontal)",
                    foto:"Foto",
                    fotoFrontal:"Foto (cámara frontal)"
                },
                adaptativa:false
            },
            subirInmediatamente:{
                etiqueta:"Subir inmediatamente",
                tipo:"bool",
                adaptativa:false
            },
            etiqueta:{
                etiqueta:"Etiqueta",
                adaptativa:false
            },
            ocultarNombre:{
                etiqueta:"Ocultar nombre de archivo",
                tipo:"bool",
                adaptativa:false
            }
        },
        "Eventos":{
            listo:{
                etiqueta:"Archivos listos",
                adaptativa:false,
                evento:true
            }
        }
    };

    /**
     * Inicializa la instancia tras ser creada o restaurada.
     */
    this.inicializar=function() {
        if(this.fueInicializado) return this; 

        this.campo=this.elemento.querySelector("input");
        this.etiqueta=this.elemento.querySelector("label");
        this.boton=this.elemento.querySelector(".custom-file-command");

        this.clasesCss.push("custom-file");

        this.prototipo.inicializar.call(this);
        return this;
    };

    /**
     * Crea el elemento del DOM para esta instancia.
     */
    this.crear=function() {
        this.elemento=document.crear("<div class='custom-file'>");

        this.campo=document.crear("<input type='file' class='custom-file-input'>");
        this.elemento.anexar(this.campo);

        this.etiqueta=document.crear("<label class='custom-file-label'>");
        this.elemento.anexar(this.etiqueta);

        this.boton=document.crear("<span class='custom-file-command'>Seleccionar</span>");
        this.elemento.anexar(this.boton);

        this.prototipo.crear.call(this);
        return this;
    };

    /**
     * Establece los eventos predeterminados.
     */
    this.establecerEventos=function() {
        var t=this;

        this.campo.removerEventos();

        var fn=function(ev) {
            if(typeof ev==="undefined") ev=null;

            t.archivos=[];
            t.abortar(false)
                .procesarArchivos()
                .procesarEvento("change","modificacion","modificacion",ev,null);

            var subir=t.propiedad("subirInmediatamente"); //por defecto, true
            if(typeof subir==="undefined"||subir===null||subir) t.subirArchivos();
        };
        
        this.campo.evento("change",fn);

        //Integración con cordova-plugin-camera
        if(ui.esCordova()) {
            this.elemento.removerEventos("click").evento("click",function(ev) {
                var multimedia=t.propiedad("multimedia");
                if(multimedia=="video"||multimedia=="videoFrontal"||multimedia=="foto"||multimedia=="fotoFrontal") {
                    ev.preventDefault();
                    
                    var opciones=Object.assign({
                        quality:"50",
                        destinationType:0, //DATA_URL
                        encodingType:0, //JPEG
                        correctOrientation:true,
                        saveToPhotoAlbum:false,
                        mediaType:multimedia=="video"||multimedia=="videoFrontal"?1:0, //VIDEO:PICTURE
                        cameraDirection:multimedia=="videoFrontal"||multimedia=="fotoFrontal"?1:0 //FRONT:BACK
                    },t.opcionesCordova);

                    navigator.camera.getPicture(function(datos) {
                        //Listo                        
                        if(typeof datos==="string") {
                            if(opciones.destinationType==0) { //DATA_URL
                                t.datosCordova={
                                    tipo:"data_url",
                                    datos:"data:image/jpeg;base64,"+datos
                                };
                            } else if(opciones.destinationType==1) { //FILE_URI
                                t.datosCordova={
                                    tipo:"file_uri",
                                    datos:datos
                                };
                            }
                        }
                        fn();
                    },function() {
                        //Error/cancelado, deseleccionar
                        t.datosCordova=null;
                        fn();
                    },opciones);
                }                
            });
        }

        return this;
    };

    /**
     * Permite sobreescribir las opciones predeterminadas para la integración con el plugin `cordova-plugin-camera` que tiene lugar cuando
     * la aplicación se está ejecutando en un dispositivo y la propiedad `multimedia` es `video`, `videoFrontal`, `foto` o `fotoFrontal`.
     * @param {Object} opciones - Opciones. Ver [https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-camera/index.html](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-camera/index.html).
     * @returns {componente}
     */
    this.establecerOpcionesCordova=function(opciones) {
        this.opcionesCordova=opciones;
        return this;
    };

    /**
     * Reestablece el componente al finalizar la carga.
     */
    var finalizarSubida=(function() {
        this.subidaEnCurso=false;
        if(this.barra) this.barra.remover();
        this.barra=null;
    }).bind(this);

    /**
     * Aborta la carga en curso.
     * @param {boolean} [limpiar=true] - Si es true, limpiará el valor del componente y del campo de archivo.
     * @returns {componente}
     */
    this.abortar=function(limpiar) {
        if(this.ajax) this.ajax.abortar();

        if(typeof limpiar==="undefined"||limpiar) {
            this.archivos=[];
            this.datosCordova=null;
            this.campo.value=null;
            this.etiqueta.establecerHtml("");
        }

        finalizarSubida();

        return this;
    };

    /**
     * Envía los archivos seleccionados al servidor.
     * @returns {componente}
     */
    this.subirArchivos=function() {
        if(!this.archivos.length) return this;

        this.subidaEnCurso=true;

        var params={};
        this.archivos.forEach(function(archivo,i) {
            if(archivo.nativo) {
                params["archivo-"+i]=archivo.nativo;
            } else if(archivo.datos) {
                params["archivo-"+i]=archivo.datos;
            }
        });

        this.barra=document.crear("<span class='progreso'><span class='progreso-barra'></span></span>");
        this.barra.anexarA(this.elemento);
        
        var t=this;
        this.ajax=servidor.invocarMetodo({
            controlador:null, //Dejarlo sin definir resultará en que se utilice el controlador principal
            componente:"archivo",
            metodo:"recibirArchivos",
            parametros:params,
            formulario:true,
            precarga:false,
            tiempo:0,
            progreso:function(p) {
                if(t.barra) t.barra.querySelector(".progreso-barra").estilos("width",Math.round(p*100)+"%");
            },
            retorno:function(ret) {
                if(ret) {
                    ret.porCada(function(clave,valor) {
                        var indice=parseInt(clave.substring(clave.indexOf("-")+1));
                        if(isNaN(indice)) return;

                        if(typeof valor!=="object") {
                            ui.alerta("Falló la carga de los archivos.");
                        } else if(typeof valor.error==="undefined") {
                            t.archivos[indice].archivo=valor.nombre;
                        } else if(valor.error==1) {
                            ui.alerta("El archivo "+valor.origen+" es demasiado grande.");
                        } else {
                            ui.alerta("Falló la carga del archivo "+valor.origen+".");
                        }
                    });
                }
                finalizarSubida();
                t.procesarEvento("listo","listo");
            },
            error:function() {
                ui.alerta("Falló la carga de los archivos.");
                finalizarSubida();
            }
        });

        return this;
    };

    /**
     * Genera el valor de archivos. Nótese que en caso de toma de contenido multimedia en dispositivos (Cordova), los datos del archivo estarán
     * establecidos en la propiedad `datos` como Base64 si `destinationType` era `0` o `DATA_URL` (predeterminado), o en `nativo` si `destinationType`
     * era `1` o `FILE_URI`.
     * @returns {Componente}
     */
    this.procesarArchivos=function() {
        if(this.archivos.length) return this;

        this.archivos=[];
        var nombres=[];

        if(this.datosCordova) {
            var datos=null,nativo=null;
            if(this.datosCordova.tipo=="data_url") datos=this.datosCordova.datos;
            if(this.datosCordova.tipo=="file_uri") nativo=this.datosCordova.datos;
            this.archivos=[
                {
                    nativo:nativo,
                    nombre:"fotografia.jpg",
                    tamano:null,
                    tipo:"image/jpeg",
                    archivo:null,
                    datos:datos
                }
            ];

            this.etiqueta.establecerHtml("(Fotografía)");

            return this;
        }

        var t=this,
            archivos=this.campo.files;
        if(archivos) archivos.porCada(function(i,archivo) {
            t.archivos.push({
                nativo:archivo,
                nombre:archivo.name,
                tamano:archivo.size,
                tipo:archivo.type,
                archivo:null,
                datos:null
            });
            nombres.push(archivo.name);
        });

        this.etiqueta.establecerHtml(nombres.join(", "));

        return this;
    };

    /**
     * Devuelve true si la carga de archivos se encuentra en curso.
     * @returns {boolean}
     */
    this.subiendo=function() {
        return this.subidaEnCurso;
    };

    /**
     * Devuelve el listado de archivos con todas sus propiedades, incluyendo la instancia nativa de File y el contenido del archivo en base 64 (luego de,
     * haber invocado obtenerBase64()), a diferencia de valor() que devuelve un listado de objetos resumidos para la carga en el servidor.
     * @returns {Object[]}
     */
    this.obtenerArchivos=function() {
        return this.archivos;
    };

    /**
     * Devuelve a la función de retorno un array de objetos {nombre,datos}, donde nombre es el nombre local del archivo y datos es el contenido codificado en Base64.
     * @param {function} funcion
     * @returns {Object[]}
     */
    this.obtenerBase64=function(funcion) {
        this.procesarArchivos();
        if(this.archivos.length) {
            var promesas=[];

            this.archivos.forEach(function(archivo) {
                promesas.push(new Promise(function(resolver,rechazar) {
                    if(archivo.datos) {
                        resolver();
                        return;
                    }

                    if(!archivo.nativo) {
                        resolver();
                        return;
                    }

                    var lector=new FileReader();
                    lector.onload=(function(l,a) {
                        return function() {
                            a.datos=l.result;
                            resolver();
                        };
                    })(lector,archivo);
                    lector.readAsDataURL(archivo.nativo);
                }));
            });

            var t=this;
            Promise.all(promesas).then(function() {
                funcion(t.archivos);
            });
        }
    };

    /**
     * Actualiza el componente.
     */
    this.propiedadModificada=function(propiedad,valor,tamano,valorAnterior) {
        if(typeof valor==="undefined") valor=null;

        //Las propiedades con expresionesse ignoran en el editor (no deben quedar establecidas en el html ni en el css)
        if(expresion.contieneExpresion(valor)&&ui.enModoEdicion()) valor=null;

        if(propiedad=="multiple") {
            if(valor===true||valor===1||valor==="1") {
                this.campo.atributo("multiple",true);
            } else {
                this.campo.removerAtributo("multiple");
            }
            return this;
        }

        if(propiedad=="acepta") {
            this.campo.atributo("accept",valor);
            return this;
        } 
        
        if(propiedad=="multimedia") {
            if(!valor) {
                this.campo.removerAtributo("capture");
            } else {
                if(valor=="audio"||valor=="videoFrontal"||valor=="fotoFrontal") {
                    this.campo.atributo("capture","user");
                } else {
                    this.campo.atributo("capture","environment");
                }
                
                if(valor=="audio") {
                    this.campo.atributo("accept","user");
                } else if(valor=="video"||valor=="videoFrontal") {
                    this.campo.atributo("accept","video/*");
                } else if(valor=="foto"||valor=="fotoFrontal") {
                    this.campo.atributo("accept","image/*");
                }
            }
            return this;
        }

        if(propiedad=="etiqueta") {
            this.boton.establecerHtml(valor);
            return this;
        }

        if(propiedad=="ocultarNombre") {
            if(!valor) {
                this.elemento.removerClase("ocultar-nombre");
            } else {
                this.elemento.agregarClase("ocultar-nombre");
            }
        }

        this.prototipo.propiedadModificada.call(this,propiedad,valor,tamano,valorAnterior);
        return this;
    };

    /**
     * Devuelve o establece el valor del componente.
     * @param {null} [valor] - Valor a establecer. Si se omite, devolverá el valor actual. Nótese que el único valor admitido es null para reestablecer el campo.
     * @returns {(*|Componente)}
     */
    this.valor=function(valor) {
        if(typeof valor==="undefined") {
            var retorno=[];
            for(var i=0;i<this.archivos.length;i++) retorno.push({
                    nombre:this.archivos[i].nombre,
                    archivo:this.archivos[i].archivo
                });
            return retorno;
        }

        if(!valor) {
            this.abortar();
        }
        //Cualquier otro valor es ignorado
        return this;
    };
};

ui.registrarComponente("archivo",componenteArchivo,configComponente.clonar({
    descripcion:"Campo de carga de archivo",
    etiqueta:"Archivo",
    grupo:"Formulario",
    icono:"archivo.png"
}));