<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

error_reporting(0);

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
    protected static $cli=false;
    protected static $listadoModelos=[];
    
    //TODO Hacer configurable.
    protected static $origenDatos='mysqli';

    /**
     * 
     */
    public function __destruct() {
        foxtrot::destructor();
    }

    /**
     * 
     */
    public static function destructor() {
    }

    /**
     * 
     */
    public static function obtenerUrl() {
        return configuracion::$url;
    }

    /**
     * Alias de `obtenerUrl()`.
     * @return string
     */
    public static function url() {
        return self::obtenerUrl();
    }

    /**
     * Devuelve true si la solicitud proviene de la línea de comandos.
     * @return bool
     */
    public static function esCli() {
        return self::$cli;
    }

    /**
     * 
     */
    public static function esHttps() {
        return (!empty($_SERVER['REQUEST_SCHEME'])&&$_SERVER['REQUEST_SCHEME']== 'https')||
            (!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']=='on')||
            (!empty($_SERVER['SERVER_PORT'])&&$_SERVER['SERVER_PORT']=='443');
    }

    /**
     * 
     */
    public static function establecerEnrutador($obj) {
        self::$enrutador=$obj;
    }

    /**
     * 
     */
    public static function obtenerEnrutador() {
        return self::$enrutador;
    }

    /**
     * 
     */
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
     * Alias de `obtenerAplicacion()`.
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
     * Alias de `obtenerAplicacionPublica()`.
     * @return \aplicacion
     */
    public static function publica() {
        return self::obtenerAplicacionPublica();
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

    /**
     * 
     */
    protected static function definirConstantes() {
        //TODO Las rutas, a excepción de _raiz, deberían consultarse con métodos, en lugar de usar constantes
        define('_raiz',realpath(__DIR__.'/..').'/');
        define('_servidor',_raiz.'servidor/');
        define('_aplicaciones',_raiz.'aplicaciones/');
        define('_componentes',_servidor.'componentes/');
        define('_temporales',_raiz.'temp/');
        define('_temporalesPrivados',_temporales.'temp-privado/');
        define('_modulos',_servidor.'modulos/');
        define('_idiomas',_servidor.'idiomas/');
    }

    /**
     * 
     */
    protected static function definirConstantesAplicacion() {
        //TODO Las rutas deberían consultarse con métodos, en lugar de usar constantes
        define('_apl',self::$aplicacion);
        define('_espacioApl','\\aplicaciones\\'.self::prepararComponenteEspacio(_apl).'\\');
        define('_raizAplicacion',_aplicaciones._apl.'/');
        define('_servidorAplicacion',_raizAplicacion.'servidor/');
        define('_controladoresServidorAplicacion',_raizAplicacion.'servidor/controladores/');
        define('_modeloAplicacion',_raizAplicacion.'servidor/modelo/');
        define('_clienteAplicacion',_raizAplicacion.'cliente/');
        define('_controladoresClienteAplicacion',_raizAplicacion.'cliente/controladores/');
        define('_vistasAplicacion',_raizAplicacion.'cliente/vistas/');
        define('_recursosAplicacion',_raizAplicacion.'recursos/');
    }

    /**
     * 
     */
    protected static function incluirArchivos() {
        include(_servidor.'funciones.php');
        include(_servidor.'util.php');
        include(_servidor.'configuracion.php');
        include(_servidor.'cliente.php');
        include(_servidor.'sesion.php');
        include(_servidor.'controlador.php');
        include(_servidor.'aplicacion.php');
        include(_servidor.'solicitud.php');
        include(_servidor.'tipo-solicitud.php');
        include(_servidor.'enrutador.php');
        include(_servidor.'enrutador-aplicacion.php');
        include(_servidor.'entidad-base.php');
        include(_servidor.'entidad.php');
        include(_servidor.'modelo-base.php');
        include(_servidor.'modelo.php');
        include(_servidor.'componente.php');
        include(_servidor.'modulo.php');
        include(_servidor.'http.php');
        include(_servidor.'almacenamiento.php');
        include(_servidor.'controlador-eventos.php');
        include(_servidor.'eventos.php');
        include(_servidor.'idioma-base.php');
        include(_servidor.'idioma.php');

        include(_servidor.'datos/nulo.php');
        include(_servidor.'datos/bd.php');
        include(_servidor.'datos/resultado.php');
        include(_servidor.'datos/constructor.php');
        include(_servidor.'datos/condicion.php');
        include(_servidor.'datos/relacion.php');

        include(_servidor.self::$origenDatos.'/bd.php');
        include(_servidor.self::$origenDatos.'/resultado.php');
        include(_servidor.self::$origenDatos.'/constructor.php');
        include(_servidor.self::$origenDatos.'/condicion.php');
        include(_servidor.self::$origenDatos.'/relacion.php');

        include(_servidor.'enrutadores/aplicacion/predeterminado.php');
        include(_servidor.'enrutadores/predeterminado.php');
        include(_servidor.'enrutadores/unaPagina.php');
        include(_servidor.'enrutadores/api.php');
    }

    /**
     * 
     */
    public static function cargarAplicacion($aplicacion=null) {
        if(!$aplicacion) {            
            //Si no se especifica $aplicacion, determinar automáticamente
            if(self::$cli) {
                //Desde CLI, parámetro -apl
                self::$aplicacion=solicitud::obtenerParametros()->apl;
                if(!self::$aplicacion) {
                    echo 'El parámetro -apl es requerido.'.PHP_EOL.PHP_EOL;
                    exit;
                }
            } elseif($_REQUEST['__apl']) {
                //Es posible saltearse el enrutador de aplicación con el parámetro __apl
                $aplicacion=util::limpiarValor($_REQUEST['__apl']);
                self::$aplicacion=$aplicacion;
            } else {
                //Utilizar el enrutador de aplicaciones
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

            idioma::establecerIdioma(configuracion::obtener('idioma'));
	        
	        include(_servidorAplicacion.'aplicacion.php');

            //Modelo de datos (importar completo)
            $archivos=self::incluirDirectorio(_modeloAplicacion);

            //Extraer los modelos de entre los archivos incluidos

            $archivosValidos=[];
            foreach($archivos as $archivo) {
                $ruta=substr($archivo,strlen(_modeloAplicacion)); //Ruta relativa
                $ruta=substr($ruta,0,-4); //Sin extensión
                $clase=self::prepararNombreClase(_espacioApl.'modelo\\'.$ruta,true);
                if(class_exists($clase))
                    $archivosValidos[]=(object)[
                        'ruta'=>$ruta,
                        'clase'=>$clase
                    ];
            }
            
            self::$listadoModelos=[];
            $nombresModelos=[];
            foreach($archivosValidos as $archivo) {
                if(is_subclass_of($archivo->clase,'\\modelo')) {
                    self::$listadoModelos[]=(object)[
                        'nombre'=>$archivo->ruta,
                        'clase'=>$archivo->clase
                    ];
                    $nombresModelos[]=$archivo->clase;
                }
            }
            //Buscar entidades sin modelo concreto
            foreach($archivosValidos as $archivo) {
                if(is_subclass_of($archivo->clase,'\\entidad')) {
                    $modelo=call_user_func([$archivo->clase,'obtenerNombreModelo']);
                    if(!in_array($modelo,$nombresModelos)) {                        
                        self::$listadoModelos[]=(object)[
                            'nombre'=>$archivo->ruta,
                            'entidad'=>$archivo->clase,
                            'clase'=>null
                        ];
                    }
                }
            }

	        //Controladores privados (importar completo)
            self::incluirDirectorio(_controladoresServidorAplicacion);
            
	        if(file_exists(_servidorAplicacion.'aplicacion.pub.php'))
	            include(_servidorAplicacion.'aplicacion.pub.php');
        }
    }

    /**
     * 
     */
    protected static function instanciarAplicacion() {
		if(self::$aplicacion) {
            $cls=_espacioApl.'aplicacion';
            if(class_exists($cls)) self::$instanciaAplicacion=new $cls;

	        $cls=_espacioApl.'publico\\aplicacion';
	        if(class_exists($cls)) self::$instanciaAplicacionPublico=new $cls;
	    }
    }

    /**
     * 
     */
    private static function incluirDirectorio($ruta,$excluirPub=true) {
        $incluidos=[];
        $archivos=glob($ruta.'*');
        foreach($archivos as $archivo) {
            if(is_dir($archivo)) {
                $incluidos=array_merge($incluidos,self::incluirDirectorio($archivo.'/',$excluirPub));
            } elseif(preg_match('/\.php$/',$archivo)&&(!$excluirPub||!preg_match('/\.pub\.php$/',$archivo))) {
                include($archivo);
                $incluidos[]=$archivo;
            }
        }
        return $incluidos;
    }

    /**
     * Crea la instancia del enrutador. Devuelve la URI final, en caso de que haya sido removida la base (prefijo).
     * @param mixed $enrutador Nombre del enrutador, array [base=>nombre] o función.
     * @param string $uri URI actual.
     * @param mixed $params Parámetros de la solicitud actual.
     * @return string
     */
    public static function fabricarEnrutador($enrutador,$uri,$params) {
        if(is_string($enrutador)) {            
            $ruta=_servidorAplicacion.$enrutador.'.php';
            if(file_exists($ruta)) {
                //Enrutador personalizado
                include(_servidorAplicacion.$enrutador.'.php');            
                $cls=_espacioApl.'enrutadores\\'.$enrutador;
            } else {
                //Enrutador del sistema
                $cls='\\enrutadores\\'.$enrutador;
            }
            self::$enrutador=new $cls;
            return;
        }

        if(is_array($enrutador)) {
            foreach($enrutador as $base=>$nombre) {
                if(preg_match('#^'.$base.'#',$uri)) {
                    self::fabricarEnrutador($nombre,$uri,$params);
                    return;
                }
            }
        }

        if(is_callable($enrutador)) {
            self::$enrutador=$enrutador($uri,$params);
        }

        self::$enrutador=null;
        return;
    }

    /**
     * Devuelve un objeto `[uri,parametros]` con la URI actual y los parámetros de la solicitud, respectivamente.
     * @return object
     */
    protected static function obtenerSolicitud() {
        $res=(object)[];

        $res->uri=null;
        if(!self::$cli) $res->uri=self::prepararUri($_SERVER['REQUEST_URI']);

        $res->params=self::$cli?solicitud::obtenerParametros():solicitud::obtenerCuerpo();

        return $res;
    }

    /**
     * Prepara de enrutador para la ejecución.
     */
    protected static function inicializarEnrutador() {
        $sol=self::obtenerSolicitud();
        
        //Crear el enrutador
        self::fabricarEnrutador(configuracion::$enrutador,$sol->uri,$sol->params);
	    //Si no quedó definido, utilizar el predeterminado
        if(!self::$enrutador) self::$enrutador=new \enrutadores\predeterminado;
    }

    /**
     * 
     */
    public static function inicializar($aplicacion=null) {
        //TODO Registro de errores

        self::definirConstantes();
        self::incluirArchivos();

        solicitud::incializar();

        configuracion::cargar();

        //Establecer url por defecto
        if(!configuracion::$url&&!self::$cli) configuracion::$url=(self::esHttps()?'https':'http').'://'.$_SERVER['HTTP_HOST'].configuracion::$rutaBase;

        //foxtrot::inicializar(false) saltea la carga de una aplicación
        //foxtrot::inicializar() carga la aplicación utilizando el enrutador, o el parámetro -apl si es CLI
        if($aplicacion!==false) self::cargarAplicacion($aplicacion);

        self::procesarConfiguracion();
        
        //Inicializar sesión luego de cargar la aplicación en caso de que haya objetos almacenados en ella 
        if(!self::$cli) sesion::inicializar();

        self::inicializarEnrutador();

        if($aplicacion!==false) {
            self::instanciarAplicacion();
            self::$instanciaAplicacion->listo();
        }
    }

    /**
     * Inicializa el framework desde la línea de comandos.
     */
    public static function inicializarCli() {
        if(php_sapi_name()!=='cli') {
            header('Location: error/');
            exit;
        }

        self::$cli=true;
        self::inicializar();
    }

    /**
     * 
     */
    public static function error() {
        if(self::$cli) {
            echo 'Solicitud inválida.'.PHP_EOL.PHP_EOL;
            exit;
        }

        if(!class_exists('configuracion')) {
            $url='error/';
        } else {
            $url=configuracion::$urlError?
                configuracion::$urlError:
                configuracion::$rutaBase.configuracion::$rutaEror;
        }

        //Si ya estamos en la página de error, detener
        if($_SERVER['REQUEST_URI']==$url) exit;
        
        redir($url);
    }

    /**
     * Procesa los valores de configuración establecidos.
     */
    protected static function procesarConfiguracion() {
        date_default_timezone_set(configuracion::obtener('zonaHoraria'));
        
        if(configuracion::$depuracion) {
            error_reporting(E_ALL ^ E_NOTICE ^ E_DEPRECATED);
        }
    }

    /**
     * 
     */
    public static function ejecutar() {
        $sol=self::obtenerSolicitud();
        self::$enrutador->establecerSolicitud($sol->uri,$sol->params);

        if(self::$enrutador->obtenerError()) self::error();

        $redir=self::$enrutador->obtenerRedireccionamiento();
        if($redir) {
            \solicitud::establecerEncabezado('Location',self::obtenerUrl().$redir->ruta,$redir->codigo?$redir->codigo:302);
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

    /**
     * Aborta la ejecución de la solicitud.
     */
    public static function detener() {
        exit;
    }

    ////Seguridad y métodos útiles

    /**
     * Limpia una URI.
     * @param string $uri Ruta a procesar.
     * @return string
     */
    public static function prepararUri($uri) {
        $uri=util::limpiarValor($uri,true,true,'?');

        //Remover base
        $uri=substr($uri,strlen(\configuracion::$rutaBase));

        //Separar la URL
        $uri=parse_url($uri)['path'];

        //Estimar si se trata de un archivo o un directorio
        $partes=\util::separarRuta($uri);
        $esArchivo=strpos($partes->nombre,'.')!==false;

        //Limpiar espacios
        $uri=trim($uri);

        //Agregar barra inicial y final
        if(substr($uri,0,1)!='/') $uri='/'.$uri;
        if(!$esArchivo&&substr($uri,-1)!='/') $uri.='/';
        if($esArchivo&&substr($uri,-1)=='/') $uri=substr($uri,0,strlen($uri)-1);

        return $uri;
    }    

    /**
     * Valida y corrije un nombre de clase, devolviendo un objeto con las propiedades 'nombre' y 'espacio' con el nombre de la clase y el espacio
     * de nombres relativo respectivamente. Removerá caracteres inválidos y convertirá las barras y los nombres con guión (ejemplo:
     * `espacio/sub-espacio/consulta-producto` -> `[nombre=>consultaProducto,espacio=>\espacio\subEspacio\]`.
     * @param string $nombre Nombre a procesar.
     * @param boolean $comoCadena Por defecto, el método devuelve un objeto `[nombre,espacio]`. Si `$comoCadena` es `true`, devolverá el espacio de nombre como cadena, sanitizado. 
     * @param boolean $namespace Su es `true`, devolverá una cadena compatible con la sentencia `namespace` (sin `\` inicial ni final).
     * @return object|string
     */
    public static function prepararNombreClase($nombre,$comoCadena=false,$namespace=false) {
        $nombre=\util::limpiarValor($nombre,true);
        $nombre=trim($nombre,'/\\');

        $partes=\util::separarRuta($nombre);
        
        $clase=\util::convertirGuiones($partes->nombre);

        $espacio=trim(str_replace('/','\\',$partes->ruta),'\\');
        if($espacio!='') {
            $partes=preg_split('#[/\\\\]#',$espacio);
            $espacio='\\';
            foreach($partes as $parte) $espacio.=\util::convertirGuiones($parte).'\\';
        }

        if($comoCadena||$namespace) {
            $res=$espacio.$clase;
            if($namespace) $res=trim($res,'\\');
            return $res;
        }

        return (object)[
            'nombre'=>$clase,
            'espacio'=>$espacio
        ];
    }

    /**
     * Valida y corrije un nombre de método. Removerá caracteres inválidos y convertirá los nombres con guión (ejemplo: `consulta-producto` -> `consultaProducto`).
     * @param string $nombre Nombre a procesar.
     * @return string
     */
    public static function prepararNombreMetodo($nombre) {
        return \util::convertirGuiones(\util::limpiarValor($nombre));
    }

    /**
     * Valida y corrije una cadena a utilizar en un espacio de nombres. Removerá caracteres inválidos y convertirá los nombres con guión (ejemplo: `consulta-producto` -> `consultaProducto`).
     * @param string $parte Nombre a procesar.
     * @return string
     */
    public static function prepararComponenteEspacio($parte) {
        return \util::convertirGuiones(\util::limpiarValor($parte));
    }

    /**
     * Obtiene y devuelve el nombre, la ruta relativa y la clase a partir de una instancia de un objeto, o `null` si no corresponde.
     * @param mixed $this Objeto a analizar.
     * @param string $base Espacio base relativo a `\aplicacion\nombreApl\`.
     * @return object|null
     */
    public static function obtenerDatosClase($obj,$base) {
        $clase=get_class($obj);
        
        $espacio='aplicaciones\\'._apl.'\\'.$base.'\\';        
        if(!preg_match('#^'.str_replace('\\','\\\\',$espacio).'#',$clase)) return null;
        $ruta=substr($clase,strlen($espacio));

        $archivo=(new ReflectionClass($obj))->getFileName();

        $partes=\util::separarRuta($ruta);        
        $nombre=$partes->nombre;
        $ruta=$partes->ruta;
        
        return (object)[
            'archivo'=>$archivo,
            'ruta'=>$ruta,
            'clase'=>$clase,
            'nombre'=>$nombre
        ];
    }

    ////Base de datos y modelo de datos

    /**
     * Devuelve la instancia de la clase \bd, creándola si es necesario.
     * @return \datos\bd
     */
    public static function obtenerBd() {
        if(!self::$bd) {
            $clase='\\'.self::$origenDatos.'\\bd';
            self::$bd=new $clase(true);
        }
        return self::$bd;
    }

    /**
     * Alias de `obtenerBd()`.
     * @return \datos\bd
     */
    public static function bd() {
        return self::obtenerBd();
    }

    /**
     * Devuelve el listado de las clases de modelo de datos cargadas. Cada elemento del listado es un objeto `[nombre,clase]`.
     * @return object[]
     */
    public static function obtenerModelos() {
        return self::$listadoModelos;
    }

    /**
     * Crea y deuvelve una instancia de un modelo de datos.
     * @param string $nombre Nombre del modelo a crear.
     * @param \datos\bd $bd Instancia de la base de datos.
     * @return \modelo
     */
    public static function fabricarModelo($nombre,$bd=null) {
        //Las clases ya fueron incluidas
        
        //Cuando presenten /, cambia su espacio
        $clase=self::prepararNombreClase(_espacioApl.'modelo\\'.$nombre,true); 

        if(!class_exists($clase)||!is_subclass_of($clase,'\\modelo')) {
            //Clase inexistente, intentar crear asumiendo que $nombre es el nombre de la entidad
            return self::fabricarModeloPorEntidad($nombre,$bd);
        }

        return new $clase;
    }

    /**
     * Crea y deuvelve una instancia de una entidad del modelo de datos.
     * @param string $nombre Nombre de la entidad a crear.
     * @return \entidad
     */
    public static function fabricarEntidad($nombre) {
        //Las clases ya fueron incluidas
        
        //Cuando presenten /, cambia su espacio
        $clase=self::prepararNombreClase(_espacioApl.'modelo\\'.$nombre,true);
        if(!class_exists($clase)||!is_subclass_of($clase,'\\entidad')) return null;

        return new $clase;
    }

    /**
     * Crea y deuvelve una instancia de un modelo de datos correspondiente a una entidad.
     * @param string $nombre Nombre de la entidad cuyo modelo se desea crear.
     * @param \datos\bd $bd Instancia de la base de datos.
     * @return \modelo
     */
    public static function fabricarModeloPorEntidad($nombre,$bd=null) {
        //Las clases ya fueron incluidas
        
        $clase=self::prepararNombreClase(_espacioApl.'modelo\\'.$nombre,true); 
        if(!class_exists($clase)||!is_subclass_of($clase,'\\entidad')) return null;

        return call_user_func([$clase,'fabricarModelo'],$bd);
    }

    ////Módulos

    /**
     * Crea y deuvelve una instancia de un módulo dado su nombre.
     * @param string $nombre Nombre del módulo a crear.
     * @param bool $publico Determina si debe devolver la clase pública (true) o la clase privada (false).
     * @return \modulo
     */
    public static function fabricarModulo($nombre,$publico=false) {
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
     * @param string $nombre Nombre del componente a crear.
     * @param bool $publico Determina si debe devolver la clase pública (true) o la clase privada (false).
     * @return \modulo
     */
    public static function fabricarComponente($nombre,$publico=false) {
        $ruta=_componentes.$nombre.($publico?'.pub':'').'.php';
        if(!file_exists($ruta)) return null;
        include_once($ruta);
        
        $clase='\\componentes'.($publico?'\\publico':'').'\\'.$nombre;
        if(!class_exists($clase)) return null;        
        return new $clase;
    }

    ////Controladores

    /**
     * Crea y devuelve una instancia de un controlador dado su nombre.
     * @param string $nombre Nombre del controlador a crear.
     * @param bool $publico Determina si debe devolver la clase pública (`true`) o privada (`false`).
     * @return \controlador
     */
    public static function fabricarControlador($nombre,$publico=false) {
        $partes=\util::separarRuta($nombre);

        //Los controladores que presenten /, se buscan en el subdirectorio
        $ruta=_controladoresServidorAplicacion.$nombre.($publico?'.pub':'').'.php';
        if(!file_exists($ruta)) return null;
        include_once($ruta);

        //Cuando presenten /, además, cambia su espacio
        $clase=self::prepararNombreClase(_espacioApl.$partes->ruta.($publico?'publico\\':'').$partes->nombre,true);
        if(!class_exists($clase)) return null;

        return new $clase;
    }

    ////Gestión de vistas

    /**
     * Devuelve un objeto los parámetros y el cuerpo de una vista.
     * @param string $nombre Nombre de la vista.
     * @return object
     */
    public static function obtenerVista($nombre) {
        $nombre=preg_replace('#[^a-zA-Z0-9_/-]+#','',$nombre);

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

    /**
     * 
     */
    public static function devolverVista($nombre) {
        cliente::responder(self::obtenerVista($nombre));
    }
}

//Crear una instancia de foxtrot para poder contar con un destructor global
$foxtrot=new foxtrot;