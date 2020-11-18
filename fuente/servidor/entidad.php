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
     * @var bool $omitirFechas Establecer a `true` para omitir la creación y el mantenimiento de los campos de fecha.
     */
    protected $tipoModelo;
    public static $omitirFechas=false;

    /**
     * @var int $id ID.
     * @var int $e Baja lógica (`1` = Registro *e*liminado).
     * @var int $fecha_alta Fecha de alta, en tiempo Epoch.
     * @var int $fecha_actualizacion Fecha de alta, en tiempo Epoch.
     * @var int $fecha_baja Fecha de alta, en tiempo Epoch.
     */
    public $id;
    public $e;
    public $fecha_alta;
    public $fecha_actualizacion;
    public $fecha_baja;

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
     * debe utilizarse este método en lugar de `establecerValores()`.
     * @param object|array $valores Valores a asignar en las propiedades de esta instancia.
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
     * En caso de sobreescribir el método, generalmente *debe* invocarse `parent::procesarValores()`.
     * @return \entidad
     */
    public function procesarValores() {
        return $this;
    }

    /**
     * Método para sobreescribir a ser invocado previo a almacenarse los valores de la instancia, a fin de realizar cualquier preproceso que requiera
     * la entidad concreta.  
     * En caso de sobreescribir el método, generalmente *debe* invocarse `parent::prepararValores($operacion)`.
     * @param string $operacion Operación en curso: `insertar` o `actualizar`
     * @return \entidad
     */
    public function prepararValores($operacion) {
        if(!self::$omitirFechas) {
            if($operacion=='insertar') $this->fecha_alta=time();
            if($this->e) $this->fecha_baja=time();
            $this->fecha_actualizacion=time();
        }
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
     * @param array $campos Nombres de los campos a procesar. Si se omite, se procesarán todos aquellos campos relacionales sin asignar.
     * @return \entidad
     */
    public function procesarRelaciones(...$campos) {
        foreach($this->obtenerCampos() as $nombre=>$campo) {
            if(count($campos)&&!in_array($nombre,$campos)) continue;
            
            if($campo->tipo=='relacional'&&(!$this->$nombre||is_numeric($this->$nombre))) {
                $modeloRelacionado=\foxtrot::obtenerInstanciaModelo($campo->modelo);
                $columna=$campo->columna;
                if($campo->relacion=='1:n') {
                    $this->$nombre=$modeloRelacionado->donde([$columna=>$this->id])
                        ->obtenerListado();
                } else {
                    $this->$nombre=$modeloRelacionado->donde(['id'=>$this->$columna])
                        ->obtenerUno();
                }
            }
        }

        return $this;
    }

    /**
     * Procesa una cadena de relaciones recursivamente desde la instancia actual en forma ascendente. Este método sirve para procesar explícitamente relaciones
     * recursivas, las cuales son omitidas por el modelo ante el riesgo de una relación cíclica infinita, o relaciones no recursivas pero donde todos los modelos
     * compartan el mismo nombre de campo para la relación padre-hijo.
     * @param string $nombreCampo Nombre del campo relacional.
     * @return \entidad
     */
    public function procesarAscendencia($nombreCampo='superior') {
        $campos=$this->obtenerCampos();
        $campo=$campos->$nombreCampo;

        $columna=$campo->columna;
        $nombreModelo=$campo->modelo;

        if(!$this->$columna) {
            $this->$nombreCampo=null;
            return $this;
        }

        if(!$this->$nombreCampo) {
            $modelo=\foxtrot::obtenerInstanciaModelo($nombreModelo);
            $this->$nombreCampo=$modelo->obtenerItem($this->$columna);
        }

        //Avanzar recursivamente
        if($this->$nombreCampo) $this->$nombreCampo->procesarAscendencia($nombreCampo);

        return $this;
    }
    
    /**
     * Procesa una cadena de relaciones recursivamente desde la instancia actual en forma descendente. Este método sirve para procesar explícitamente relaciones
     * recursivas, las cuales son omitidas por el modelo ante el riesgo de una relación cíclica infinita, o relaciones no recursivas pero donde todos los modelos
     * compartan el mismo nombre de campo para la relación padre-hijo.
     * @param string $nombreCampo Nombre del campo relacional.
     * @param string $orden Ordenamiento del listado.
     * @param string $destino Nombre de una propiedad donde almacenar el resultado. No es necesario que sea un campo.
     * @return array
     */
    public function procesarDescendencia($nombreCampo,$orden='`id` asc',$destino=null) {
        if(!$this->id) {
            if($destino) $this->$destino=null;
            return null;
        }

        $campos=$this->obtenerCampos();
        $campo=$campos->$nombreCampo;

        $columna=$campo->columna;
        $nombreModelo=$campo->modelo;

        $modelo=\foxtrot::obtenerInstanciaModelo($nombreModelo);

        $listado=$modelo
            ->donde([$columna=>$this->id])
            ->ordenadoPor($orden)
            ->obtenerListado();

        if($destino) $this->$destino=$listado;

        //Avanzar recursivamente
        foreach($listado as $hijo) $hijo->procesarDescendencia($nombreCampo,$orden,$destino);

        return $listado;
    }

    /**
     * Devuelve la ruta ascendente de relaciones hacia la instancia actual.Este método sirve para procesar explícitamente relaciones recursivas, las cuales son
     * omitidas por el modelo ante el riesgo de una relación cíclica infinita, o relaciones no recursivas pero donde todos los modelos compartan el mismo nombre de
     * campo para la relación padre-hijo.
     * @param string $campo Nombre del campo relacional.
     * @param string $asignar Nombre de la propiedad donde asignar el resultado.
     * @param bool $comoCadena Si es `true` devolverá una cadena; en caso contrario, un array de entidades.
     * @param callable|string $titulo Si `$comoCadena` es `true`, propiedad a utilizar como título de cada parte de la ruta o función que devuelva el mismo dados la entidad
     * y el nivel como parámetros.
     * @param string $union Si `$comoCadena` es `true`, especifica el caracter a utilizar como separador de títulos.
     * @return string|array
     */
    public function obtenerRuta($campo='superior',$asignar=null,$comoCadena=false,$titulo='titulo',$union=' › ') {
        $this->procesarAscendencia($campo);

        $ruta=[$this];
        $obj=$this->$campo;
        while($obj) {
            $ruta[]=$obj;
            $obj=$obj->$campo;
        }

        $ruta=array_reverse($ruta);

        if($comoCadena) {
            foreach($ruta as $i=>$parte) {
                if(is_callable($titulo)) {
                     $tituloParte=call_user_func($titulo,$parte,$i);
                } else {
                    $tituloParte=$parte->$titulo;
                }
                $ruta[$i]=$tituloParte;
            }
            $ruta=implode($union,$ruta);
        }

        if($asignar) $this->$asignar=$ruta;

        return $ruta;
    }

    /**
     * Devuelve el listado de campos con la configuración de cada uno.
     * @return object Objeto nombre->parametros.
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

        if(!static::$omitirFechas) {
            $campos->fecha_alta=(object)[
                'tipo'=>'entero(6)',
                'indice'=>true
            ];
            $campos->fecha_actualizacion=(object)[
                'tipo'=>'entero(6)',
                'indice'=>true
            ];
            $campos->fecha_baja=(object)[
                'tipo'=>'entero(6)',
                'indice'=>true
            ];
        }

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