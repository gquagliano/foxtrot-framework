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

    function __construct() {
        //Importar los tipos de solicitud
        $this->tipos=[
            'foxtrot'=>null,
            'recurso'=>null,
            'pagina'=>null,
            'controlador'=>null,
            'aplicacion'=>null,
            'componente'=>null,
            'modulo'=>null,
            'vista'=>null
        ];
        foreach($this->tipos as $tipo=>$v) {
            $this->tipos[$tipo]='\\solicitud\\tipos\\'.$tipo;
            include_once(_servidor.'enrutadores/tipos/'.$tipo.'.php');
        }
    }

    public function establecerSolicitud($uri,$params) {
        $this->url=$uri;
        if(is_array($params)) $params=(object)$params;        
        $this->solicitud=$params;
        $this->analizar();
        return $this;
    }

    public function obtenerUrlVista($vista) {
        return foxtrot::obtenerUrl().$vista.'/';
    }

    public function obtenerUrlRecursosAplicacion() {
        return foxtrot::obtenerUrl().'aplicacion/recursos/';
    }

    public function obtenerUrlEstilosVista($nombre) {
        return foxtrot::obtenerUrl().'aplicacion/cliente/vistas/'.$nombre.'.css';
    }

    public function obtenerUrlControlador($nombre) {
        return foxtrot::obtenerUrl().'aplicacion/cliente/controladores/'.$nombre.'.js';
    }

    /**
     * Analiza la URL provista, estableciendo las propiedades del entutador.
     * @return \enrutador
     */
    public function analizar() {
        //Analizaremos los parámetros internos de Foxtrot y acceso a archivos públicos. La clase concreta debería completar el análisis, o puede sobreescribir
        //por completo este método.

        //No hace falta validar estos parámetros, ya que Foxtrot lo hará a continuación

        //Parámetros
        $this->parametros=json_decode($this->solicitud->__p);

        //Remover los parámetros GET de la URL
        $p=strpos($this->url,'?');
        if($p!==false) $this->url=substr($this->url,0,$p);

        //Remover barra inicial
        if(substr($this->url,0,1)=='/') $this->url=substr($this->url,1);

        //Buscar a qué tipo corresponde la solicitud
        foreach($this->tipos as $tipo) {
            if(call_user_func($tipo.'::es',$this->url,$this->solicitud)) {
                //Si la solicitud corresponde a este tipo, generar la instancia
                $this->recurso=new $tipo($this,$this->url,$this->solicitud);
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

    public function obtenerParametros() {
        return $this->parametros;
    }

    public function obtenerError() {
        return $this->error;
    }

    public function obtenerRecurso() {
        return $this->recurso;
    }

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