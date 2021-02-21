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
     * @var string $nombreModelo Nombre del modelo. Se utiliza para generar un modelo en blanco en tiempo de ejecución cuando la clase concreta
     * del modelo no existe. Es ignorado si `$tipoModelo` está definido.
     */
    protected static $tipoModelo;
    protected static $nombreModelo;
    public static $omitirFechas=false;
    
    /** @var \aplicacion $aplicacion Instancia de la clase privada de la aplicación. */
    protected $aplicacion;    

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
     * @param object|array $valores Valores a asignar en las propiedades de la instancia. **Importante:** Los valores son asignados mediante `establecerValores()`. Utilizá
     * `(new entidad)->establecerValoresPublicos($valores)` si el objeto proviene del cliente.
     */
    function __construct($valores=null) {
        $this->aplicacion=foxtrot::obtenerAplicacion();
        if($valores) $this->establecerValores($valores);
    }

    /**
     * Asigna los elementos o propiedades en las propiedades de esta instancia.
     * @param object|array $valores Valores a asignar en las propiedades de la instancia.
     * @param boolean $publicos Filtrar el objeto manteniendo solo los valores públicos.
     * @return \entidad
     */
    public function establecerValores($valores,$publicos=false) {
        if(!is_object($valores)&&!is_array($valores)) return $this;

        $campos=$this->obtenerCampos();

        foreach($valores as $clave=>$valor) {
            if(!property_exists($this,$clave)) continue;
            
            $campo=$campos->$clave;
            if($publicos&&!$campo->publico) continue;

            $this->$clave=$valor;

            //Convertir relacionales en entidades
            if($campo->tipo=='relacional') {
                $modelo=$this->fabricarModeloCampo($campo);
                if(!$modelo) continue;

                if($campo->relacion=='1:n') {
                    if(is_array($valor)) {
                        $this->$clave=[];
                        foreach($valor as $item)
                            if(is_object($item)) {
                                $obj=$modelo->fabricarEntidad();
                                $obj->establecerValores($item,$publicos);
                                $this->$clave[]=$obj;
                            }
                    }
                } elseif(is_object($valor)) {
                    $obj=$modelo->fabricarEntidad();
                    $obj->establecerValores($valor,$publicos);
                    $this->$clave=$obj;
                }
            }
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
        return $this->establecerValores($valores,true);
    }

    /**
     * Método para sobreescribir a ser invocado tras asignarse las propiedades de la instancia, a fin de realizar cualquier postproceso que requiera
     * la entidad concreta.  
     * En caso de sobreescribir el método, generalmente *debe* invocarse `parent::procesarValores()`.
     * @return \entidad
     */
    public function procesarValores() {
        foreach($this->obtenerCampos() as $nombre=>$campo) {
            if($this->$nombre===null) continue;
            if(preg_match('/^entero/',$campo->tipo)) {
                $this->$nombre=intval($this->$nombre);
            } elseif(preg_match('/^decimal/',$campo->tipo)) {
                $this->$nombre=floatval($this->$nombre);
            }
        }
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
        if(!static::$omitirFechas) {
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
    public static function fabricarModelo($bd=null) {
        if(!isset(static::$tipoModelo))
            return new modelo($bd,static::$nombreModelo,static::class);

        return new static::$tipoModelo($bd);
    }

    /**
     * Devuelve un objeto estándar con los valores de la instancia.
     * @param bool $incluirOcultos Si es `false`, se omitirán los campos ocultos (`@oculto`) y privados (`@privado`).
     * @return object
     */
    public function obtenerObjeto($incluirOcultos=false) {
        $obj=(object)get_object_vars($this);
        
        //Como estamos invocando get_object_vars() desde un método de la instancia, se han incluido propiedades protegidas y privadas; Remover
        //unset(...);

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
     * Similar a `obtenerObjeto()`, devuelve un objeto estándar con los valores de la instancia pero incluyendo únicamente con las propiedades especificadas, sin tener en cuenta
     * si los campos son ocultos o privados.
     * @param mixed[] $campos Listado de campos a incluir. Pueden utilizarse elementos asociativos para campos relacionales, por ejemplo: `['nombre','apellido','ciudad'=>['nombre','provincia']]`.
     * @param mixed[] $excluir Listado de campos a excluir. Para utilizar esta opción, `$campos` debe ser `null` (se incluirán todos los campos *excepto* los
     * especificados). Pueden utilizarse elementos asociativos para campos relacionales.
     * @return object
     */
    public function filtrarObjeto($campos=null,$excluir=null) {
        $obj=(object)get_object_vars($this);
        
        //Como estamos invocando get_object_vars() desde un método de la instancia, se han incluido propiedades protegidas y privadas; Remover
        //unset(...);

        foreach($this->obtenerCampos() as $nombre=>$campo) {
            //Remover si se especificó $campos y no está en el array ni es una clave del array (elemento asociativo)
            if($campos!=null&&!in_array($nombre,$campos)&&!array_key_exists($nombre,$campos)) unset($obj->$nombre);

            //En campos relacionales, utilizar los listados de campos relacionados, si se especificaron
            $relacionCampos=null;
            $relacionExcluir=null;
            if($campos&&array_key_exists($nombre,$campos)) $relacionCampos=$campos[$nombre];
            if($excluir&&array_key_exists($nombre,$excluir)) $relacionExcluir=$excluir[$nombre];

            //Reemplazar entidades relacionadas por su objeto
            if($obj->$nombre instanceof entidad) {
                $obj->$nombre=$obj->$nombre->filtrarObjeto($relacionCampos,$relacionExcluir);
            }

            //Lo mismo con los listados de entidades
            //Un nivel es suficiente, no hace falta hacerlo recursivamente
            if(is_array($obj->$nombre)) {
                foreach($obj->$nombre as $item)
                    if($item instanceof entidad) $item=$item->obtenerObjeto($relacionCampos,$relacionExcluir);
            }
        }

        return $obj;
    }

    /**
     * Fabrica el modelo correspondiente a un campo relacional. Método de uso interno (no realiza validaciones).
     * @param object $campo Campo.
     * @return \modelo
     */
    protected function fabricarModeloCampo($campo) {
        if($campo->modelo) return foxtrot::obtenerInstanciaModelo($campo->modelo);
        if($campo->entidad) return foxtrot::obtenerInstanciaModeloPorEntidad($campo->entidad);
        return null;
    }

    /**
     * Procesa los campos relacionales que no hayan sido asignados.
     * @param array $campos Nombres de los campos a procesar. Si se omite, se procesarán todos aquellos campos relacionales sin asignar.
     * @return \entidad
     */
    public function procesarRelaciones(...$campos) {
        if(count(debug_backtrace(0))>50) return;

        //Si el primer argumento es un array, asumir que es la cadena de relaciones
        $cadenaRelaciones=null;
        if(is_array($campos[0])) $cadenaRelaciones=$campos[0];
        if($cadenaRelaciones) {
            if(in_array(static::$tipoModelo,$cadenaRelaciones)) return $this;
            $cadenaRelaciones[]=static::$tipoModelo;
        }

        foreach($this->obtenerCampos() as $nombre=>$campo) {
            if(count($campos)&&!in_array($nombre,$campos)) continue;
            
            if($campo->tipo=='relacional'&&!is_object($this->$nombre)) {
                $modeloRelacionado=$this->fabricarModeloCampo($campo);
                if(!$modeloRelacionado) continue;

                $columna=$campo->columna;
                if($campo->relacion=='1:n') {
                    $this->$nombre=$modeloRelacionado->donde([$columna=>$this->id])
                        ->obtenerListado();

                    if($this->$nombre)
                        foreach($this->$nombre as $obj)
                            if($obj) $obj->procesarRelaciones($cadenaRelaciones?$cadenaRelaciones:[]);
                } else {
                    $this->$nombre=$modeloRelacionado->donde(['id'=>$this->$columna])
                        ->obtenerUno();

                    if($this->$nombre) $this->$nombre->procesarRelaciones($cadenaRelaciones?$cadenaRelaciones:[]);
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

        if(!$this->$columna) {
            $this->$nombreCampo=null;
            return $this;
        }

        if(!$this->$nombreCampo) {
            $modelo=$this->fabricarModeloCampo($campo);
            if(!$modelo) return $this;
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

        $modelo=$this->fabricarModeloCampo($campo);
        if(!$modelo) return [];

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
        //@entidad *
        //@relacion *
        //@columna *
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

        $campos=(object)[
            'id'=>(object)['publico'=>true],
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
            if(preg_match_all("/@(tipo|relacion|alias|contrasena|indice|simple|modelo|entidad|relacion|columna|privado|predeterminado|requerido|tamano|etiqueta|omitir|oculto|busqueda|orden|publico|html)( (.+?))?(\r|\n|\*\/)/s",$comentario,$coincidencias)) {
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