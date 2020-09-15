<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase principal del sistema (prototipo).
 */
class foxtrot {
    protected static $enrutador=null;
    protected static $enrutadorApl=null;
    protected static $aplicacion=null;
    protected static $instanciaAplicacion=null;
    protected static $instanciaPublicaAplicacion=null;
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

    protected static function definirConstantes() {
        //TODO Las rutas, a excepción de _raiz, deberían consultarse con métodos, en lugar de usar constantes
        define('_raiz',realpath(__DIR__.'/..').'/');
        define('_servidor',_raiz.'servidor/');
        define('_aplicaciones',_raiz.'aplicaciones/');
        define('_componentes',_servidor.'componentes/');
        define('_temporales',_raiz.'temp/');
        define('_temporalesPrivados',_temporales.'temp-privado/');
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
        include(_servidor.'configuracion.php');
        include(_servidor.'cliente.php');
        include(_servidor.'sesion.php');
        include(_servidor.'controlador.php');
        include(_servidor.'aplicacion.php');
        include(_servidor.'enrutador.php');
        include(_servidor.'enrutadorAplicacion.php');
        include(_servidor.'entidad.php');
        include(_servidor.'modelo.php');
        include(_servidor.'componente.php');

        //TODO Hacer configurable. En teoría, debería poderse implementar cualquier motor de base de datos o repositorio (archivo, API) implementando clases compatibles con bd
        include(_servidor.'mysql.php');
        include(_servidor.'mysql-resultado.php');

        include(_servidor.'enrutadores/enrutadorPredeterminado.php');
        include(_servidor.'enrutadores/enrutadorAplicacionPredeterminado.php');
        include(_servidor.'enrutadores/enrutadorUnaPagina.php');
    }

    public static function cargarAplicacion($aplicacion=null) {
        if($aplicacion!==null) self::$aplicacion=$aplicacion;

        self::definirConstantesAplicacion();

        if(!file_exists(_raizAplicacion)) self::error();

        configuracion::cargarConfigAplicacion();
        
        include(_servidorAplicacion.'aplicacion.php');

        //Modelo de datos (importar completo)
        $archivos=glob(_modeloAplicacion.'*.php');
        foreach($archivos as $archivo) include($archivo);

        //Controladores privados (importar completo)
        $archivos=glob(_controladoresServidorAplicacion.'*.php');
        foreach($archivos as $archivo)
            if(!preg_match('/\.pub\.php$/',$archivo)) include($archivo);
        
        //Si la aplicación no definió un enrutador en su configuración, utilizar el predeterminado
        if(!self::$enrutador&&!configuracion::$enrutador) {
            self::$enrutador=new enrutadorPredetermiando;
        } elseif(configuracion::$enrutador) {
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

    public static function inicializar($aplicacion=null) {
        error_reporting(E_ALL^E_NOTICE^E_DEPRECATED);
        //TODO Registro de errores

        self::definirConstantes();
        self::incluirArchivos();

        configuracion::cargar();

        sesion::inicializar();

        //Establecer url por defecto
        if(!configuracion::$url) configuracion::$url=(self::esHttps()?'https':'http').'://'.$_SERVER['HTTP_HOST'].configuracion::$rutaBase;

        //foxtrot::inicializar(false) saltea la carga de una aplicación
        //foxtrot::inicializar() carga la aplicación utilizando el enrutador
        if($aplicacion!==false) {
            if(!$aplicacion) {
                //Es posible saltearse el enrutador de aplicación con el parámetro __apl
                if($_REQUEST['__apl']) {
                    $aplicacion=preg_replace('/[^a-z0-9-]+/i','',$_REQUEST['__apl']);
                    self::$aplicacion=$aplicacion;
                } else {
                    self::$aplicacion=self::$enrutadorApl->determinarAplicacion();
                }
                if(!self::$aplicacion) self::error();
            } else {
                self::$aplicacion=$aplicacion;
            }

            self::cargarAplicacion();
        }
    }

    public static function error() {
        redir(configuracion::$rutaEror);
    }

    public static function ejecutar() {
        $uri=$_SERVER['REQUEST_URI'];
        //Remover la ruta base al sistema
        $uri=substr($uri,strlen(configuracion::$rutaBase));

        self::$enrutador->establecerSolicitud($uri,$_REQUEST);
        
        if(self::$enrutador->obtenerError()) self::error();

        $pagina=self::$enrutador->obtenerPagina();
        $vista=self::$enrutador->obtenerVista();
        $ctl=self::$enrutador->obtenerControlador();
        $metodo=self::$enrutador->obtenerMetodo();
        $params=self::$enrutador->obtenerParametros();
        $recurso=self::$enrutador->obtenerRecurso();
        $foxtrot=self::$enrutador->obtenerFoxtrot();
        $redir=self::$enrutador->obtenerRedireccionamiento();
        $componente=self::$enrutador->obtenerComponente();

        $html=null;
        $res=null;

        if($redir) {
            header('Location: '.self::obtenerUrl().$redir->ruta,true,$redir->codigo?$redir->codigo:302);
            exit;
        }

        if($foxtrot) {
            //Acceso HTTP a funciones internas de Foxtrot

            //Por el momento queda harcodeado ya que es muy limitado y, además, necesitamos tener control preciso de esta funcionalidad. Eventualmente puede implementarse
            //algún mecanismo para abstraerlo adecuadamente.

            header('Content-Type: text/plain; charset=utf-8',true);

            if($foxtrot=='sesion') {
                sesion::responderSolicitud();
            } elseif($foxtrot=='obtenerVista') {
                self::devolverVista($params[0]);
            } elseif($foxtrot=='noop') {
                echo 'ok';
                self::detener();
            } else {
                self::error();
            }
        }

        if($pagina) {
            //Cargar una página independiente

            header('Content-Type: text/html; charset=utf-8',true);

            //TODO Validación configurable de páginas disponibles públicamente.
            $rutas=[
                'error'=>'error.php',
                'index-cordova'=>'index-cordova.html'
            ];
            if(!array_key_exists($pagina,$rutas)) self::error();

            include($rutas[$pagina]);

            exit;
        }

        if($recurso) {
            //Enviar archivos de la aplicación
            $dir=realpath(_raizAplicacion);
            $ruta=realpath($dir.'/'.$recurso);
            if(substr($ruta,0,strlen($dir))!=$dir||!file_exists($ruta)) self::error();

            $mime=\mime($ruta);
            header('Content-Type: '.$mime.'; charset=utf-8',true);       
            
            $f=fopen($ruta,'r');
            fpassthru($f);
            fclose($f);
            exit;
        }

        if($vista) {
            //Devuelve el contenido html de la vista
            
            header('Content-Type: text/html; charset=utf-8',true);

            //Validar que el archivo solicitado exista y no salga del directorio de cliente
            //TODO Verificar tipo de vista en aplicacion.json
            $dir=realpath(_vistasAplicacion);
            $rutaPhp=realpath($dir.'/'.$vista.'.php');
            $rutaHtml=realpath($dir.'/'.$vista.'.html');
            if($rutaPhp) {
                if(substr($rutaPhp,0,strlen($dir))!=$dir) self::error();
                ob_start();
                include($rutaPhp);
                $html=ob_get_clean();
            } elseif($rutaHtml) {
                if(substr($rutaHtml,0,strlen($dir))!=$dir) self::error();
                $html=file_get_contents($rutaHtml);
            } else {
                self::error();
            }
        }

        if($ctl) {
            //Los controladores que presenten /, se buscan en el subdirectorio
            //Esto debería ser seguro ya que no se admiten caracteres que puedan hacer que salga del directorio controladores

            if(preg_match('/[^a-z0-9_\/-]/i',$ctl)) self::error();

            $ruta=_controladoresServidorAplicacion.$ctl.'.pub.php';
            if(!file_exists($ruta)) self::error();

            include($ruta);
            $ctl=self::prepararNombreClase($ctl);
            $cls='\\aplicaciones\\'._apl.'\\publico\\'.$ctl;
            $obj=new $cls;       
        } elseif(self::$instanciaAplicacionPublico) {
            //Si no se definió un controlador, notificaremos la solicitud a la clase pública de la aplicación
            $obj=self::$instanciaAplicacionPublico;
        }

        if($componente) {
            if(preg_match('/[^a-z0-9_-]/i',$componente)) self::error();

            $ruta=_componentes.$componente.'.pub.php';
            if(!file_exists($ruta)) self::error();

            include($ruta);
            $cls='\\componentes\\publico\\'.$componente;
            $obj=new $cls;
        }  

        if($metodo) {
            if(preg_match('/[^a-z0-9_]/i',$metodo)) self::error();

            if(!$obj||!method_exists($obj,$metodo)) self::error();
            $res=call_user_func_array([$obj,$metodo],$params);

            header('Content-Type: text/plain; charset=utf-8',true);
            cliente::responder($res);   
        }

        if($html!==null) {
            //Pasaremos el html por el método html() del controlador para que pueda hacer algún preproceso si lo desea
            $html=$obj->html($html);
            echo $html;
        }
        
        exit;     
    }

    public static function detener() {
        exit;
    }

    ////Seguridad y métodos útiles

    /**
     * Valida y corrije un nombre de clase. Removerá caracteres inválidos y convertirá los nombres con guión (ejemplo: consulta-producto -> consultaProducto).
     * @var string $nombre Nombre a procesar.
     * @return string
     */
    public static function prepararNombreClase($nombre) {
        $nombre=strtolower($nombre);

        if(strpos($nombre,'-')>0) {
            $partes=explode('-',$nombre);
            $nombre='';
            foreach($partes as $parte) $nombre.=ucfirst($parte);
        }

        $nombre=str_replace('/','\\',$nombre);
        $nombre=preg_replace('/[^a-z0-9_]/i','',$nombre);
        
        return $nombre;
    }

    ////Base de datos

    public static function obtenerInstanciaBd() {
        if(!self::$bd) {
            //El conector cambiará según qué clase `db` esté implementada
            self::$bd=new bd(
                true,
                configuracion::$servidorBd,
                configuracion::$usuarioBd,
                configuracion::$contrasenaBd,
                configuracion::$nombreBd,
                configuracion::$prefijoBd,
                configuracion::$puertoBd
            );
        }
        return self::$bd;
    }

    ////Gestión de vistas

    public static function devolverVista($nombre) {
        $nombre=preg_replace('#[^a-z0-9_/_]+#','',$nombre);
        $ruta=_vistasAplicacion.$nombre;

        $esPhp=file_exists($ruta.'.php');

        if(!file_exists($ruta.'.'.($esPhp?'php':'html'))) {
            self::detener();
        }

        //Solo vamos a devolver código HTML
        //TODO Evaluar las implicaciones de seguridad para ejecutar vistas PHP
        $html=file_get_contents($ruta.'.'.($esPhp?'php':'html'));

        $json=file_get_contents($ruta.'.json');

        $enrutador=self::obtenerEnrutador();

        cliente::responder([
            'html'=>$html,
            'json'=>$json,
            'urlJs'=>$enrutador->obtenerUrlControlador($nombre),
            'urlCss'=>$enrutador->obtenerUrlEstilosVista($nombre)
        ]);
    }
}

//Crear una instancia de foxtrot para poder contar con un destructor global
$foxtrot=new foxtrot;