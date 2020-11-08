<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//NOTA: Esta clase está siendo migrada desde Foxtrot 6. Hay mucho que debe revisarse en cuanto a eficiencia, código limpio, documentación, spanglish y seguridad/visibilidad.

defined('_inc') or exit;

/**
 * Clase base de los repositorios del modelo de datos.
 */
class entidad {
    /**
     * @var string $tipoModelo Tipo del modelo de datos (asignar `modelo::class`).
     * @var int $id ID.
     * @var int $e Baja lógica (`1` = Registro *e*liminado).
     */
    protected $tipoModelo;
    public $id;
    public $e;

    /**
     * Constructor.
     * @param object|array $valores Valores a asignar en las propiedades de la instancia.
     */
    function __construct($valores=null) {
        if($valores) $this->establecerValores($valores);
    }

    /**
     * Asigna los elementos o propiedades en las propiedades de esta instancia.
     * @param object|array $valores Valores a asignar en las propiedades de la instancia.
     * @return \entidad
     */
    public function establecerValores($valores) {
        foreach($valores as $clave=>$valor) {
            if(property_exists($this,$clave)) $this->$clave=$valor;
        }
        $this->procesarValores();
        return $this;
    }

    /**
     * Asigna los elementos o propiedades provistos en las propiedades de esta instancia que cuenten con la etiqueta @publico. Cuando se reciban datos desde el cliente,
     * debe utilizarse este método en lugar de establecerValores().
     * @param object|array $valores Valores a asignar en las propiedades de la instancia.
     * @return \entidad
     */
    public function establecerValoresPublicos($valores) {
        if(!is_object($valores)&&!is_array($valores)) return $this;

        //Crear un nuevo objeto que tome de $valores solo los elementos válidos y establecer

        $esObj=is_object($valores);
        $nuevosValores=(object)[];
        $campos=$this->obtenerCampos();

        foreach($campos as $nombre=>$campo) {
            if(!$campo->publico) continue;

            $valor=$esObj?$valores->$nombre:$valores[$nombre];
            if($valor!==null) $nuevosValores->$nombre=$valor;
        }

        return $this->establecerValores($nuevosValores);
    }

    /**
     * Método para sobreescribir a ser invocado tras asignarse las propiedades de la instancia, a fin de realizar cualquier postproceso que requiera
     * la entidad concreta.
     * @return \entidad
     */
    public function procesarValores() {
        return $this;
    }

    /**
     * Fabrica y devuelve una instancia del modelo o repositorio de este tipo de entidades.
     * @param \bd $bd Instancia de la interfaz de la base de datos (por defecto, se utilizará la conexión abierta, no se iniciará una nueva instancia).
     * @return \modelo
     */
    public function fabricarModelo($bd=null) {
        return new $this->tipoModelo($bd);
    }

    /**
     * Devuelve un objeto estándar con los valores de la instancia.
     * @param bool $incluirOcultos Si es false, omitirá los campos ocultos (`@oculto`) y privados (`@privado`).
     * @return object
     */
    public function obtenerObjeto($incluirOcultos=false) {
        $obj=(object)get_object_vars($this);
        
        //Como estamos invocando get_object_vars() desde un método de la instancia, se han incluido propiedades protegidas y privadas; Remover
        unset($obj->tipoModelo);

        foreach($this->obtenerCampos() as $nombre=>$campo) {
            //Remover campos ocultos y privados
            if(!$incluirOcultos&&($campo->oculto||$campo->privado)) unset($obj->$nombre);

            //Reemplazar entidades relacionadas por su objeto
            if($obj->$nombre instanceof entidad) $obj->$nombre=$obj->$nombre->obtenerObjeto($incluirOcultos);

            //Lo mismo con los listados de entidades
            //Un nivel es suficiente, no hace falta hacerlo recursivamente
            if(is_array($obj->$nombre)) {
                foreach($obj->$nombre as $item)
                    if($item instanceof entidad) $item=$item->obtenerObjeto($incluirOcultos);
            }
        }

        return $obj;
    }

    /**
     * Procesa los campos relacionales que no hayan sido asignados.
     * @return \entidad
     */
    public function procesarRelaciones() {
        $modelo=$this->fabricarModelo();

        foreach($modelo->obtenerCampos() as $nombre=>$campo) {
            if($campo->tipo=='relacional'&&(!$this->$nombre||is_numeric($this->$nombre))) {
                $modeloRelacionado=\foxtrot::obtenerInstanciaModelo($campo->modelo);
                if($campo->relacion=='1:n') {
                    $this->$nombre=$modeloRelacionado->donde([$campo->columna=>$this->id])
                        ->obtenerListado();
                } else {
                    $this->$nombre=$modeloRelacionado->donde(['id'=>$this->$nombre])
                        ->obtenerUno();
                }
            }
        }

        return $this;
    }

    /**
     * Devuelve el listado de campos con la configuración de cada uno.
     * @return object[] Objeto nombre->parametros.
     */
    public static function obtenerCampos() {
        //Posibles valores de las etiquetas en los comentarios de las propiedades:
        //@tipo (texto|cadena(longitud)|entero(longitud)|decimal(longitud)|logico|relacional|fecha)
        //@relacion (1:1|1:0|1:n)
        //@indice
        //@indice unico
        //@modelo *
        //@relacion *
        //@columna *
        //@predeterminado *
        //@requerido
        //@tamano
        //@etiqueta *
        //@omitir
        //@oculto
        //@busqueda campos
        //@orden campo (asc|desc)
        //@publico
        //@privado
        //@html

        $campos=(object)[
            'id'=>(object)[],
            'e'=>(object)['oculto'=>true]
        ];

        $propiedades=get_class_vars(static::class);
        foreach($propiedades as $propiedad=>$v) {
            $comentario=(new ReflectionProperty(static::class,$propiedad))->getDocComment();
            if(preg_match_all("/@(tipo|relacion|indice|modelo|relacion|columna|privado|predeterminado|requerido|tamano|etiqueta|omitir|oculto|busqueda|orden|publico|html)( (.+?))?(\r|\n|\*\/)/s",$comentario,$coincidencias)) {
                $campos->$propiedad=(object)[];
                foreach($coincidencias[1] as $i=>$etiqueta) {
                    $etiqueta=strtolower(trim($etiqueta));
                    $valor=trim($coincidencias[2][$i]);
                    if($valor=='') $valor=true;

                    //Valores que no diferencian mayusc/minusc
                    if(is_string($valor)&&in_array($etiqueta,['tipo','relacion','relacion'])) $valor=strtolower($valor);

                    $campos->$propiedad->$etiqueta=$valor;
                }
            }
        }

        return $campos;
    }
}