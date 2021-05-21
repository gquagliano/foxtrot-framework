<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Clase base de los enrutadores.
 */
class enrutador {
    protected $tipos;
    protected $uri=null;
    protected $solicitud=null;
    protected $parametros=null;
    protected $error=false;
    protected $redireccionar=null;
    protected $codigoRedireccion=null;
    protected $recurso=null;

    /**
     * Constructor.
     */
    function __construct() {
        //Importar los tipos de solicitud
        $this->tipos=[
            'foxtrot',
            'recurso',
            'controlador',
            'aplicacion',
            'componente',
            'modulo',
            'vista',
            'pagina'
        ];
        foreach($this->tipos as $tipo) {
            include_once(_servidor.'enrutadores/tipos-solicitud/'.$tipo.'.php');
        }
    }

    /**
     * Establece la solicitud a analizar.
     * @var string $uri URI.
     * @var object|array $params Parámetros.
     * @return \enrutador
     */
    public function establecerSolicitud($uri,$params) {
        $this->url=$uri;
        if(is_array($params)) $params=(object)$params;        
        $this->solicitud=$params;
        $this->analizar();
        return $this;
    }

    /**
     * Determina la URL de una vista.
     * @var string $vista Nombre de la vista.
     * @return string
     */
    public function obtenerUrlVista($vista) {
        return foxtrot::obtenerUrl().$vista.'/';
    }

    /**
     * Devuelve la URL de recursos de la aplicación.
     * @return string
     */
    public function obtenerUrlRecursosAplicacion() {
        return foxtrot::obtenerUrl().'aplicacion/recursos/';
    }

    /**
     * Determina la URL del archivo CSS de una vista.
     * @var string $vista Nombre de la vista.
     * @return string
     */
    public function obtenerUrlEstilosVista($nombre) {
        return foxtrot::obtenerUrl().'aplicacion/cliente/vistas/'.$nombre.'.css';
    }

    /**
     * Determina la URL del controlador de una vista.
     * @var string $vista Nombre de la vista.
     * @return string
     */
    public function obtenerUrlControlador($nombre) {
        return foxtrot::obtenerUrl().'aplicacion/cliente/controladores/'.$nombre.'.js';
    }

    /**
     * Devuelve el nombre de la vista principal.
     * @return string
     */
    public function obtenerNombreVistaPrincipal() {
        return 'inicio';
    }

    /**
     * Analiza la URL provista, estableciendo las propiedades del entutador.
     * @return \enrutador
     */
    public function analizar() {
        //Analizaremos los parámetros internos de Foxtrot y acceso a archivos públicos. La clase concreta debería completar el análisis o bien sobreescribir
        //por completo este método.

        $this->parametros=json_decode($this->solicitud->__p);
        
        //Buscar a qué tipo corresponde la solicitud
        foreach($this->tipos as $tipo) {
            if(call_user_func('\\solicitud\\tipos\\'.$tipo.'::es',$this->url,$this->solicitud)) {
                //Si la solicitud corresponde a este tipo, generar la instancia
                $this->fabricarRecurso($tipo);
                return $this;
            }
        }

        $this->error=true;

        return $this;
    }

    /**
     * Determina si el último análisis resultó en una solicitud válida.
     * @return bool
     */
    protected function solicitudValida() {
        return !$this->error&&($this->recurso||$this->redireccionar);
    }

    /**
     * Devuelve la URI actual.
     * @return string
     */
    public function obtenerUri() {
        return $this->url;
    }

    /**
     * Devuelve los parámetros actuales.
     * @return object
     */
    public function obtenerParametros() {
        return $this->parametros;
    }

    /**
     * Devuelve si el análisis resultó o no en un error.
     * @return bool
     */
    public function obtenerError() {
        return $this->error;
    }

    /**
     * Devuelve el recurso establecido.
     * @return \tipoSolicitud
     */
    public function obtenerRecurso() {
        return $this->recurso;
    }

    /**
     * Establece el recurso que responderá a la solicitud.
     * @var \tipoSolicitud $recurso Instancia del recurso.
     * @return \enrutador
     */
    public function establecerRecurso($recurso) {
        $this->recurso=$recurso;
        return $this;
    }

    /**
     * Crea una instancia del recurso y lo establece como el que responderá a la solicitud. Devuelve la instancia del recurso creada. Nota: Este valor no será
     * sanitizado, no debe pasarse un valor obtenido desde el cliente.
     * @var string $tipo Nombre del tipo de recurso.
     * @return \tipoSolicitud
     */
    public function fabricarRecurso($tipo) {
        $tipo='\\solicitud\\tipos\\'.$tipo;
        $this->recurso=new $tipo($this,$this->url,$this->solicitud);
        return $this->recurso;
    }

    /**
     * Devuelve un objeto con el redireccionamiento a realizar, o null.
     * @return object
     */
    public function obtenerRedireccionamiento() {
        if(!$this->redireccionar) return null;
        return (object)[
            'ruta'=>$this->redireccionar,
            'codigo'=>$this->codigoRedireccion
        ];
    }
    
    /**
     * Establece un redireccionamiento. Únicamente válido durante la etapa de análisis.
     * @param string $destino
     * @param string $codigo
     * @return \enrutador
     */
    public function establecerRedireccionamiento($destino,$codigo='301') {
        $this->redireccionar=$destino;
        $this->codigoRedireccion=$codigo;
        return $this;
    }

    /**
     * Establece que la solicitud es errónea. Únicamente válido durante la etapa de análisis.
     * @return \enrutador
     */
    public function establecerError() {
        $this->error=true;
        return $this;
    }
}