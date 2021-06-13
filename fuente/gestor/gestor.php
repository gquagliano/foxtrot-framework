<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

include(__DIR__.'/funciones.php');
include(_raizGlobal.'desarrollo/servidor/foxtrot.php');
include(__DIR__.'/asistentes/asistente.php');

foxtrot::inicializar(false);
gestor::inicializar();
asistentes::inicializar();

/**
 * Procesa las solicitudes del gestor de aplicaciones.
 */
class gestor {
    /** @var string $aplicacion Nombre de la aplicación activa. */
    protected static $aplicacion;
    /** @var object $jsonApl JSON de la aplicación actual. */
    protected static $jsonApl;
    /** @var string[] $aplicaciones Listado de aplicaciones. */
    protected static $aplicaciones;

    //TODO *Desharcodear* rutas

    /**
     * Devuelve el nombre de la aplicación activa.
     * @return string
     */
    public static function obtenerNombreAplicacion() {
        return self::$aplicacion;
    }

    /**
     * Devuelve el espacio de nombres de la aplicación activa.
     * @return string
     */
    public static function obtenerEspacioAplicacion() {
        return 'aplicaciones\\'.\foxtrot::prepararNombreClase(self::$aplicacion,true).'\\';
    }

    /**
     * Devuelve el listado de nombres de aplicaciones.
     * @return string[]
     */
    public static function obtenerAplicaciones() {
        return self::$aplicaciones;
    }

    /**
     * Devuelve el JSON de la aplicación activa.
     * @return object
     */
    public static function obtenerJsonAplicacion() {
        return self::$jsonApl;
    }

    /**
     * Almacena el objeto en el JSON de la aplicación activa.
     * @var object $json Objeto a almacenar.
     */
    public static function actualizarJsonAplicacion($json) {
        file_put_contents(_raizAplicacion.'aplicacion.json',formato::formatearJson($json));
    }

    /**
     * Inicializa la clase.
     */
    public static function inicializar() {
        //TODO Esto debe venir de foxtrot
        self::$aplicaciones=[];
        foreach(glob(_aplicaciones.'*',GLOB_ONLYDIR) as $ruta) self::$aplicaciones[]=basename($ruta);
        
        if(count(self::$aplicaciones)) {
            $aplicacion=$_SESSION['_gestorAplicacion'];
            
            if(!$aplicacion||!in_array($aplicacion,self::$aplicaciones)) self::seleccionarAplicacion(self::$aplicaciones[0]);

            define('_gestorAplicacion',$_SESSION['_gestorAplicacion']);
            self::$aplicacion=$_SESSION['_gestorAplicacion'];

            foxtrot::cargarAplicacion(_gestorAplicacion);
        
            //TODO Esto debe venir de foxtrot
            self::$jsonApl=json_decode(file_get_contents(_raizAplicacion.'aplicacion.json'));
        }
    }

    /**
     * Analiza y procesa la solicitud actual.
     */
    public static function procesarSolicitud() {
        if($_REQUEST['eliminarVista']) {
            //TODO Debería obtenerse desde los asistentes
            self::eliminarVista($_REQUEST['eliminarVista']);
        } elseif($_REQUEST['seleccionarAplicacion']) {
            self::seleccionarAplicacion($_REQUEST['seleccionarAplicacion']);            
        } elseif($_REQUEST['duplicarVista']) {    
            //TODO Debería obtenerse desde los asistentes
            self::duplicarVista($_REQUEST['duplicarVista']);    
        } elseif($_REQUEST['renombrarVista']) {
            //TODO Debería obtenerse desde los asistentes
            self::renombrarVista($_REQUEST['renombrarVista'],$_REQUEST['nuevoNombre']);
        } elseif($_REQUEST['asistente']) {
            self::ejecutarAsistente($_REQUEST['asistente']);
        }
        self::ok();
    }

    /**
     * Cambia la aplicación activa.
     * @var string $nombre Nombre de la aplicación.
     */
    public static function seleccionarAplicacion($nombre) {
        $_SESSION['_gestorAplicacion']=$nombre;

        //Intentar actualizar la configuración para el dominio actual; esto solo funcionaría con la configuración por defecto
        $config=file_get_contents(_raiz.'config.php');
        $dominio=$_SERVER['HTTP_HOST'];
        $dominio=str_replace('.','\.',$dominio);
        if(preg_match('/(\'|")('.$dominio.'|\.\+)\1\s*?=>\s*?(\'|").+?\3/m',$config,$coincidencias)) {
            $config=str_replace($coincidencias[0],'\''.$coincidencias[2].'\'=>\''.$nombre.'\'',$config);
            file_put_contents(_raiz.'config.php',$config);
        }
    }

    /**
     * Elimina una vista.
     * @var string $nombre Nombre de la vista.
     */
    protected static function eliminarVista($nombre) {
        asistentes::obtenerAsistente('vistas')
            ->eliminar($nombre);
    }

    /**
     * Duplica una vista.
     * @var string $nombre Nombre de la vista.
     */
    protected static function duplicarVista($nombre) {
        asistentes::obtenerAsistente('vistas')
            ->duplicar($nombre);
    }

    /**
     * Renombra una vista.
     * @var string $nombre Nombre de la vista.
     * @var string $nuevoNombre Nombre a asignar.
     */
    protected static function renombrarVista($nombre,$nuevoNombre) {
        asistentes::obtenerAsistente('vistas')
            ->renombrar($nombre,$nuevoNombre);
    }

    /**
     * Ejecuta un asistente tomando los datos del formulario.
     * @var string $nombre Nombre del asistente.
     */
    protected static function ejecutarAsistente($nombre) {
        asistentes::obtenerAsistente($nombre)
            ->ejecutar(json_decode($_REQUEST['parametros']));
    }

    /**
     * Redirecciona al gestor, cuando no se trate de una solicitud AJAX.
     */
    protected static function volver() {
        header('Location: ../');
        exit;
    }

    /**
     * Responde un OK.
     * @var mixed $datos Información a enviar.
     */
    public static function ok($datos=null) {
        echo json_encode(['r'=>'ok','d'=>$datos]);
        exit;
    }

    /**
     * Responde un mensaje de error.
     * @var mixed $datos Información a enviar.
     */
    public static function error($datos=null) {
        echo json_encode(['r'=>'error','d'=>$datos]);
        exit;
    }
    
    /**
     * Devuelve el modelo de datos de la aplicación activa.
     * @return object[] Devuelve un array de objetos [nombre,clase], donde 'clase' es el nombre completo de la misma (no la instancia).
     */
    public static function obtenerModelos() {
        return \foxtrot::obtenerModelos();
    }
    
    /**
     * Devuelve la URL de la vista dado su nombre.
     * @param string $nombre
     * @return string
     */
    protected static function obtenerUrlVista($nombre) {
        $vistas=gestor::obtenerJsonAplicacion()->vistas;
        if($vistas->$nombre->tipo=='embebible') return null;
        if($vistas->$nombre->cliente=='cordova') return '../desarrollo/simular-cordova.php?vista='.$nombre.'&aplicacion='.self::$aplicacion;
        return '../desarrollo/'.$nombre;
    }

    /**
     * Construye y devuelve el árbol de vistas.
     * @return object[]
     */
    public static function obtenerArbolVistas() {
        //Construir árbol por subdirectorios
        $arbol=[];
        foreach(gestor::obtenerJsonAplicacion()->vistas as $nombre=>$vista) {
            if(strpos($nombre,'/')===false) {
                //Agregar directamente en la raíz
                $arbol[]=(object)['item'=>$nombre,'ruta'=>$nombre,'vista'=>$vista,'url'=>self::obtenerUrlVista($nombre)];
            } else {
                $ruta=explode('/',$nombre);
                $vista=array_pop($ruta);

                //Buscar o crear la ruta, comenzando por la raíz del árbol
                $lista=&$arbol;
                foreach($ruta as $parte) {
                    $existe=false;

                    //Buscar item [directorio=parte]
                    foreach($lista as $item) {
                        if($item->directorio==$parte) {
                            //Si lo encontramos, buscaremos la siguiente parte dentro de los hijos
                            $lista=&$item->hijos;
                            $existe=true;
                            break;
                        }
                    }

                    //Si no existe, se agrega
                    if(!$existe) {
                        $item=(object)['directorio'=>$parte,'ruta'=>implode('/',$ruta),'hijos'=>[]];
                        $lista[]=$item;
                        //E insertamos dentro de hijos
                        $lista=&$item->hijos;
                    }
                }

                //Agregar la vista en los hijos
                $lista[]=(object)['item'=>$vista,'ruta'=>$nombre,'vista'=>$vista,'url'=>self::obtenerUrlVista($nombre)];
            }
        }
        return $arbol;
    }
}
