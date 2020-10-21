<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

error_reporting(E_ERROR | E_WARNING);

/**
 * Clase principal del sistema (prototipo).
 */
class foxtrot {
    protected static $enrutador=null;
    protected static $enrutadorApl=null;
    protected static $aplicacion=null;
    protected static $jsonAplicacion=null;
    protected static $instanciaAplicacion=null;
    protected static $instanciaAplicacionPublico=null;
    protected static $bd=null;

    public function __destruct() {
        foxtrot::destructor();
    }

    public static function destructor() {
    }

    public static function obtenerUrl() {
        return configuracion::$url;
    }

    public static function esHttps() {
        return (!empty($_SERVER['REQUEST_SCHEME'])&&$_SERVER['REQUEST_SCHEME']== 'https')||
            (!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']=='on')||
            (!empty($_SERVER['SERVER_PORT'])&&$_SERVER['SERVER_PORT']=='443');
    }

    public static function establecerEnrutador($obj) {
        self::$enrutador=$obj;
    }

    public static function obtenerEnrutador() {
        return self::$enrutador;
    }

    public static function establecerEnrutadorAplicacion($obj) {
        self::$enrutadorApl=$obj;
    }

    /**
     * Devuelve la instancia de la clase de aplicación.
     * @return \aplicacion
     */
    public static function obtenerAplicacion() {
        return self::$instanciaAplicacion;
    }

    /**
     * Alias de obtenerAplicacion().
     * @return \aplicacion
     */
    public static function aplicacion() {
        return self::obtenerAplicacion();
    }

    /**
     * Devuelve la instancia de la clase pública de aplicación.
     * @return \aplicacion
     */
    public static function obtenerAplicacionPublica() {
        return self::$instanciaAplicacionPublico;
    }

    /**
     * Devuelve el objeto de parámetros de la aplicación ("JSON").
     * @return object
     */
    public static function obtenerJsonAplicacion() {
        return self::$jsonAplicacion;
    }

    /**
     * Devuelve el nombre de la aplicación.
     * @return string
     */
    public static function obtenerNombreAplicacion() {
        return _apl;
    }

    protected static function definirConstantes() {
        //TODO Las rutas, a excepción de _raiz, deberían consultarse con métodos, en lugar de usar constantes
        define('_raiz',realpath(__DIR__.'/..').'/');
        define('_servidor',_raiz.'servidor/');
        define('_aplicaciones',_raiz.'aplicaciones/');
        define('_componentes',_servidor.'componentes/');
        define('_temporales',_raiz.'temp/');
        define('_temporalesPrivados',_temporales.'temp-privado/');
        define('_modulos',_servidor.'modulos/');
    }

    protected static function definirConstantesAplicacion() {
        //TODO Las rutas deberían consultarse con métodos, en lugar de usar constantes
        define('_apl',self::$aplicacion);
        define('_raizAplicacion',_aplicaciones._apl.'/');
        define('_servidorAplicacion',_raizAplicacion.'servidor/');
        define('_controladoresServidorAplicacion',_raizAplicacion.'servidor/controladores/');
        define('_modeloAplicacion',_raizAplicacion.'servidor/modelo/');
        define('_clienteAplicacion',_raizAplicacion.'cliente/');
        define('_controladoresClienteAplicacion',_raizAplicacion.'cliente/controladores/');
        define('_vistasAplicacion',_raizAplicacion.'cliente/vistas/');
        define('_recursosAplicacion',_raizAplicacion.'recursos/');
    }

    protected static function incluirArchivos() {
        include(_servidor.'funciones.php');
        include(_servidor.'util.php');
        include(_servidor.'configuracion.php');
        include(_servidor.'cliente.php');
        include(_servidor.'sesion.php');
        include(_servidor.'controlador.php');
        include(_servidor.'aplicacion.php');
        include(_servidor.'solicitud.php');
        include(_servidor.'enrutador.php');
        include(_servidor.'enrutadorAplicacion.php');
        include(_servidor.'entidad.php');
        include(_servidor.'modelo.php');
        include(_servidor.'componente.php');
        include(_servidor.'modulo.php');
        include(_servidor.'http.php');
        include(_servidor.'almacenamiento.php');

        //TODO Hacer configurable. En teoría, debería poderse implementar cualquier motor de base de datos o repositorio (archivo, API) implementando clases compatibles con bd
        include(_servidor.'mysql.php');
        include(_servidor.'mysql-resultado.php');

        include(_servidor.'enrutadores/enrutadorPredeterminado.php');
        include(_servidor.'enrutadores/enrutadorAplicacionPredeterminado.php');
        include(_servidor.'enrutadores/enrutadorUnaPagina.php');
    }

    public static function cargarAplicacion($aplicacion=null) {
        //Si no se especifica $aplicacion, determinar automáticamente
        if(!$aplicacion) {
            //Es posible saltearse el enrutador de aplicación con el parámetro __apl
            if($_REQUEST['__apl']) {
                $aplicacion=util::limpiarValor($_REQUEST['__apl']);
                self::$aplicacion=$aplicacion;
            } else {
                self::$aplicacion=self::$enrutadorApl->determinarAplicacion();
            }
        } else {
            self::$aplicacion=$aplicacion;
        }
		
		if(self::$aplicacion) {
	        self::definirConstantesAplicacion();

            if(!file_exists(_raizAplicacion)) self::error();
            
            self::$jsonAplicacion=json_decode(file_get_contents(_raizAplicacion.'aplicacion.json'));

	        configuracion::cargarConfigAplicacion();

	        //Resetear conexión a la base da datos ya que las credenciales pueden haber cambiado
	        if(self::$bd) {
	            self::$bd->desconectar();
	            self::$bd=null;
	        }
	        
	        include(_servidorAplicacion.'aplicacion.php');

	        //Modelo de datos (importar completo)
	        $archivos=glob(_modeloAplicacion.'*.php');
	        foreach($archivos as $archivo) include($archivo);

	        //Controladores privados (importar completo)
	        $archivos=glob(_controladoresServidorAplicacion.'*.php');
	        foreach($archivos as $archivo)
	            if(!preg_match('/\.pub\.php$/',$archivo)) include($archivo);

	        if(configuracion::$enrutador) {
	            $ruta=_servidorAplicacion.configuracion::$enrutador.'.php';
	            if(file_exists($ruta)) {
	                include(_servidorAplicacion.configuracion::$enrutador.'.php');            
	                $cls='\\aplicaciones\\'._apl.'\\enrutadores\\'.configuracion::$enrutador;
	            } else {
	                //Enrutador del sistema
	                $cls='\\'.configuracion::$enrutador;
	            }
	            self::$enrutador=new $cls;
	        }
	    }
        
        //Si la aplicación no definió un enrutador, utilizar el predeterminado
        if(!self::$enrutador) self::$enrutador=new enrutadorPredetermiando;

		if(self::$aplicacion) {
	        if(file_exists(_servidorAplicacion.'aplicacion.php')) {
	            $cls='\\aplicaciones\\'._apl.'\\aplicacion';
	            self::$instanciaAplicacion=new $cls;
	        }

	        if(file_exists(_servidorAplicacion.'aplicacion.pub.php')) {
	            include(_servidorAplicacion.'aplicacion.pub.php');
	            $cls='\\aplicaciones\\'._apl.'\\publico\\aplicacion';
	            self::$instanciaAplicacionPublico=new $cls;
	        }
	    }
    }

    public static function inicializar($aplicacion=null) {
        //TODO Registro de errores

        self::definirConstantes();
        self::incluirArchivos();

        configuracion::cargar();

        //Establecer url por defecto
        if(!configuracion::$url) configuracion::$url=(self::esHttps()?'https':'http').'://'.$_SERVER['HTTP_HOST'].configuracion::$rutaBase;

        //foxtrot::inicializar(false) saltea la carga de una aplicación
        //foxtrot::inicializar() carga la aplicación utilizando el enrutador
        if($aplicacion!==false) self::cargarAplicacion($aplicacion);
        
        //Inicializar sesión luego de cargar la aplicación en caso de que haya objetos almacenados en ella
        sesion::inicializar();
    }

    public static function error() {
        $url=configuracion::$urlError?
            configuracion::$urlError:
            configuracion::$rutaBase.configuracion::$rutaEror;

        //Si ya estamos en la página de error, detener
        if($_SERVER['REQUEST_URI']==$url) exit;
        
        redir($url);
    }

    public static function ejecutar() {
        $uri=self::prepararUri($_SERVER['REQUEST_URI']);
        self::$enrutador->establecerSolicitud($uri,$_REQUEST);
        
        if(self::$enrutador->obtenerError()) self::error();

        $redir=self::$enrutador->obtenerRedireccionamiento();
        if($redir) {
            header('Location: '.self::obtenerUrl().$redir->ruta,true,$redir->codigo?$redir->codigo:302);
            exit;
        }

        $recurso=self::$enrutador->obtenerRecurso();
        if($recurso) {
            $recurso->ejecutar();

            //Volver a verificar errores
            if(self::$enrutador->obtenerError()) self::error();

            self::detener(); 
        } else {
            self::error();
        }        
    }

    public static function detener() {
        exit;
    }

    ////Seguridad y métodos útiles

    /**
     * Limpia una URI.
     * @var string $uri Ruta a procesar.
     * @return string
     */
    public static function prepararUri($uri) {
        $uri=util::limpiarValor($uri,true,true,'?');

        //Remover base
        $uri=substr($uri,strlen(\configuracion::$rutaBase));

        //Separar la URL
        $uri=parse_url($uri)['path'];

        //Limpiar espacios y barra inicial y final
        $uri=trim(trim($uri),'/');

        return $uri;
    }    

    /**
     * Valida y corrije un nombre de clase, devolviendo un objeto con las propiedades 'nombre' y 'espacio' con el nombre de la clase y el espacio
     * de nombres relativo respectivamente. Removerá caracteres inválidos y convertirá los nombres con guión (ejemplo:
     * espacio/consulta-producto -> [nombre=>consultaProducto,espacio=>\espacio).
     * @var string $nombre Nombre a procesar.
     * @return object
     */
    public static function prepararNombreClase($nombre) {
        $nombre=\util::limpiarValor($nombre,true);
        $nombre=trim($nombre,'/');
        $partes=\util::separarRuta($nombre);

        $espacio=trim($partes->ruta,'/');
        if($espacio!='') $espacio='\\'.str_replace('/','\\',$espacio);

        return (object)[
            'nombre'=>$partes->nombre,
            'espacio'=>$espacio
        ];
    }

    /**
     * Valida y corrije un nombre de método. Removerá caracteres inválidos y convertirá los nombres con guión (ejemplo: consulta-producto -> consultaProducto).
     * @var string $nombre Nombre a procesar.
     * @return string
     */
    public static function prepararNombreMetodo($nombre) {
        return \util::limpiarValor($nombre);
    }

    ////Base de datos y modelo de datos

    /**
     * Devuelve la instancia de la clase \bd, creándola si es necesario.
     * @return \bd
     */
    public static function obtenerInstanciaBd() {
        if(!self::$bd) {
            //El conector cambiará según qué clase `db` esté implementada
            self::$bd=new bd(true);
        }
        return self::$bd;
    }

    /**
     * Crea y deuvelve una instancia de un modelo de datos.
     * @var string $nombre Nombre del modelo a crear.
     * @return \modelo
     */
    public static function obtenerInstanciaModelo($nombre) {
        $clase='\\aplicaciones\\'._apl.'\\modelo\\'.$nombre;
        return new $clase;
    }

    ////Módulos

    /**
     * Crea y deuvelve una instancia de un módulo dado su nombre.
     * @var string $nombre Nombre del módulo a crear.
     * @var bool $publico Determina si debe devolver la clase pública (true) o la clase privada (false).
     * @return \modulo
     */
    public static function obtenerInstanciaModulo($nombre,$publico=false) {
        $ruta=_modulos.$nombre.'/'.$nombre.($publico?'.pub':'').'.php';
        if(!file_exists($ruta)) return null;
        include_once($ruta);
        
        $clase='\\modulos'.($publico?'\\publico':'').'\\'.$nombre;
        if(!class_exists($clase)) return null;        
        return new $clase;
    }

    ////Componentes

    /**
     * Crea y deuvelve una instancia de un componente dado su nombre.
     * @var string $nombre Nombre del componente a crear.
     * @var bool $publico Determina si debe devolver la clase pública (true) o la clase privada (false).
     * @return \modulo
     */
    public static function obtenerInstanciaComponente($nombre,$publico=false) {
        $ruta=_componentes.$nombre.($publico?'.pub':'').'.php';
        if(!file_exists($ruta)) return null;
        include_once($ruta);
        
        $clase='\\componentes'.($publico?'\\publico':'').'\\'.$nombre;
        if(!class_exists($clase)) return null;        
        return new $clase;
    }

    ////Gestión de vistas

    /**
     * Devuelve un objeto los parámetros y el cuerpo de una vista.
     * @var string $nombre Nombre de la vista.
     * @return object
     */
    public static function obtenerVista($nombre) {
        $nombre=preg_replace('#[^a-z0-9_/_]+#','',$nombre);

        $vista=self::$jsonAplicacion->vistas->$nombre;
        if(!$vista) return null;

        //Anexar cuerpo y URLs de recursos
        
        $ruta=_vistasAplicacion.$nombre;
        $esPhp=file_exists($ruta.'.php');

        $html=null;
        $json=null;

        //TODO ¿Validaciones?

        if(file_exists($ruta.'.'.($esPhp?'php':'html'))) { //Las vistas embebibles pueden no existir en producción
            //Solo vamos a devolver código HTML
            //TODO Evaluar las implicaciones de seguridad para ejecutar vistas PHP
            $html=file_get_contents($ruta.'.'.($esPhp?'php':'html'));
        }

        if(file_exists($ruta.'.json')) { //El JSON solo existirá para vistas embebibles
            $json=file_get_contents($ruta.'.json');
        }
            
        $enrutador=self::obtenerEnrutador();
        
        $vista->html=$html;
        $vista->json=$json;
        $vista->urlJs=$enrutador->obtenerUrlControlador($nombre);
        $vista->urlCss=$enrutador->obtenerUrlEstilosVista($nombre);

        return $vista;
    }

    public static function devolverVista($nombre) {
        cliente::responder(self::obtenerVista($nombre));
    }
}

//Crear una instancia de foxtrot para poder contar con un destructor global
$foxtrot=new foxtrot;