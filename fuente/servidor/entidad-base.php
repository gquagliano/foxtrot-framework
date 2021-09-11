<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base para la clase `entidad`
 */
class entidadBase {
    protected static $nombreModelo;
    protected static $tablaModelo;
    protected static $tipoModelo;
    protected static $omitirFechas=false;

    protected static $campos;
    protected $_nombreEntidad;

    /**
     * Constructor.
     * @param array|object $datos Valores a asignar a las propiedades de la nueva instancia.
     */
    function __construct($datos=null) {
        $clase=\foxtrot::obtenerDatosClase($this,'modelo');
        
        $this->_nombreEntidad=$clase->ruta.$clase->nombre;

        if(is_object($datos)||is_array($datos)) $this->asignarObjeto($datos);
    }

    /**
     * Devuelve el nombre de la entidad.
     * @return string
     */
    public function obtenerNombre() {
        return $this->_nombreEntidad;
    }

    /**
     * Asigna los valores a las propiedades de la instancia.
     * @param array|object $objeto Objeto u array asociativo de valores.
     * @param bool $aceptarPrivados Solo si es `true`, se admitirá la asignación de propiedades privadas (`@privado`).
     * @param bool $soloPublicos Si es `true`, únicamente se procesarán los campos públicos (`@publico`).
     * @return \entidadBase
     */
    public function asignarObjeto($objeto,$aceptarPrivados=false,$soloPublicos=false) {
        if(is_array($objeto)) $objeto=(array)$objeto;

        foreach(static::obtenerCampos() as $campo) {
            if(($campo->privado&&!$aceptarPrivados)||
                (!$campo->publico&&$soloPublicos)) continue;

            $propiedad=$campo->nombre;

            if($campo->relacional&&$campo->relacion=='1:n') {
                $this->propiedad=[];
            } else {
                $this->$propiedad=null;
            }

            if(isset($objeto->$propiedad)) $this->$propiedad=$objeto->$propiedad;
        }

        return $this;
    }

    /**
     * Devuelve un objeto estándar con las propiedades públicas de esta instancia y sus respectivos valores.
     * @param bool $incluirOcultos Solo si es `true`, se incluirán las propiedades ocultas (`@oculto`).
     * @return object
     */
    public function obtenerObjeto($incluirOcultos=false) {
        $objeto=(object)[];

        foreach(static::obtenerCampos() as $campo) {
            if($campo->privado||($campo->oculto&&!$incluirOcultos)) continue;

            $propiedad=$campo->nombre;
            $objeto->$propiedad=$this->$propiedad;
        }

        //Sumar otras propiedades públicas
        $propiedades=(new ReflectionObject($this))->getProperties(ReflectionProperty::IS_PUBLIC);
        foreach($propiedades as $propiedad) {
        	$nombre=$propiedad->name;
        	$objeto->$nombre=$this->$nombre;
        }

        return $objeto;
    }

    /**
     * Procesa los campos relacionales de esta instancia.
     * @param bool $actualizar Solo si es `true` se volverán a procesar los campos que ya tengan su valor asignado.
     * @return \entidadBase
     */
    public function procesarRelaciones($actualizar=false) {
        foreach(static::obtenerCampos() as $campo) {
            $propiedad=$campo->nombre;

            if(!$campo->relacional||($this->$propiedad&&!$actualizar)) continue;

            if($campo->entidad) {
                $modelo=\foxtrot::fabricarModeloPorEntidad($campo->entidad);
            } else {
                $modelo=\foxtrot::fabricarModelo($campo->modelo);
            }
            
            $modelo->omitirRelaciones();

            if($campo->relacion=='1:n') {
                //if(is_array($this->$propiedad)) {
                //    $ids=[];
                //    foreach($this->$propiedad as $item)
                //        if(is_numeric($item)) {
                //            $ids[]=$item;
                //        } elseif(is_object($item)) {
                //            $ids[]=$item->id;
                //        } elseif(is_array($item)) {
                //            $ids[]=$item['id'];
                //        }
                //    }
                //    $this->$propiedad=$modelo
                //        ->dondeEn('id',$ids)
                //        ->obtenerListado();
                //} else {
                    //@campo o @campoForaneo es indistinto en 1:n
                    $columna=$campo->campo?$campo->campo:$campo->campoforaneo;

                    if(!$this->id) {
                        $this->propiedad=null;
                        continue;
                    }

                    $this->$propiedad=$modelo
                        ->donde([
                            $columna=>$this->id
                        ])
                        ->obtenerListado();
                //}
            } else {
                $columna='id';
                $valor=null;

                if($campo->campo) {
                    //@campo, foranea.id=campo
                    $campoValor=$campo->campo;
                    $valor=$this->$campoValor;
                    //Si el valor es nulo, intentar usar el valor del campo relacional como ID
                    if(!$valor&&is_numeric($this->$propiedad)) $valor=$this->$propiedad;
                } else {
                    //@campoForaneo, foranea.campo=id
                    $columna=$campo->campoforaneo;
                    $valor=$this->id;
                }

                if(!$valor) {
                    $this->propiedad=null;
                    continue;
                }

                $this->$propiedad=$modelo
                    ->donde([
                        $columna=>$valor
                    ])
                    ->obtenerUno();
            }
        }

        return $this;
    }
    
    /**
     * Fabrica y devuelve una instancia del modelo o repositorio de este tipo de entidades.
     * @param \datos\bd $bd Instancia de la interfaz de la base de datos (por defecto, se utilizará la conexión abierta, no se iniciará una nueva instancia).
     * @return \modelo
     */
    public static function fabricarModelo($bd=null) {
        if(!static::$tipoModelo) return new modelo($bd,static::$nombreModelo,static::class,static::$tablaModelo);
        return new static::$tipoModelo;
    }

    /**
     * Devuelve el nombre del modelo de datos. Cuando exista el modelo concreto, devolverá el nombre completo de la clase (con espacio de nombres).
     * @return string
     */
    public static function obtenerNombreModelo() {        
        if(static::$tipoModelo) return '\\'.static::$tipoModelo;
        return static::$nombreModelo;
    }
    
    /**
     * Devuelve el listado de campos con la configuración de cada uno.
     * @return object
     */
    public static function obtenerCampos() {
        //Posibles valores de las etiquetas en los comentarios de las propiedades:
        //@tipo (texto|cadena(longitud)|entero(longitud)|entero sin signo(longitud)|decimal(longitud)|decimal sin signo(longitud)|logico|relacional|fecha)
        //@relacion (1:1|1:0|1:N|1:n)
        //@indice
        //@indice unico
        //@modelo *
        //@entidad *
        //@relacion *
        //@columna * o @campo
        //@predeterminado *
        //@requerido
        //@tamano
        //@etiqueta *
        //@omitir
        //@oculto
        //@contrasena
        //@busqueda campos
        //@orden campo (asc|desc)
        //@publico
        //@privado
        //@html
        //@alias *
        //@eliminar
        //@recursion *
        //@campoForaneo *

        $campos=(object)[
            'id'=>(object)[
                'nombre'=>'id',
                'tipo'=>'entero sin signo'
            ],
            'e'=>(object)[
                'nombre'=>'e',
                'tipo'=>'logico'
            ]
        ];

        if(!static::$omitirFechas) {
            $campos->fecha_alta=(object)[
                'nombre'=>'fecha_alta',
                'tipo'=>'entero',
                'longitud'=>'4',
                'indice'=>true
            ];
            $campos->fecha_actualizacion=(object)[
                'nombre'=>'fecha_actualizacion',
                'tipo'=>'entero',
                'longitud'=>'4',
                'indice'=>true
            ];
            $campos->fecha_baja=(object)[
                'nombre'=>'fecha_baja',
                'tipo'=>'entero',
                'longitud'=>'4',
                'indice'=>true
            ];
        }

        $propiedades=get_class_vars(static::class);
        foreach($propiedades as $propiedad=>$v) {
            $comentario=(new ReflectionProperty(static::class,$propiedad))->getDocComment();
            if(preg_match_all("/@(tipo|relacion|alias|eliminar|contrasena|indice|simple|modelo|entidad|relacion|columna|campo|privado|predeterminado|recursion|requerido|tamano|etiqueta|omitir|oculto|busqueda|orden|publico|html|campoForaneo)( (.+?))?(\r|\n|\*\/)/s",$comentario,$coincidencias)) {
                $campos->$propiedad=(object)[
                    'nombre'=>$propiedad
                ];
                foreach($coincidencias[1] as $i=>$etiqueta) {
                    $etiqueta=strtolower(trim($etiqueta));
                    $valor=trim($coincidencias[2][$i]);
                    if($valor=='') $valor=true;

                    //Valores que no diferencian mayusc/minusc
                    if(is_string($valor)&&in_array($etiqueta,['tipo','relacion'])) $valor=strtolower($valor);

                    if($etiqueta=='tipo'&&preg_match('/^(.+?)\((.+?)\)$/',$valor,$coincidencias2)) {
                        $valor=trim($coincidencias2[1]);
                        $campos->$propiedad->longitud=trim($coincidencias2[2]);
                    }

                    $campos->$propiedad->$etiqueta=$valor;
                }
                if(!$campos->$propiedad->campo&&$campos->$propiedad->columna) $campos->$propiedad->campo=$campos->$propiedad->columna;
                if($campos->$propiedad->tipo=='relacional') $campos->$propiedad->relacional=true;
            }
        }

        return $campos;
    }
}