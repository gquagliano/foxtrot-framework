<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Métodos útiles para realizar consultas HTTP.
 */
class http {
    protected static $curl;
    protected static $curlAbierto=false;
    protected static $codigo=null;
    protected static $error=null;

    /**
     * Devuelve la última instancia de CURL.
     * @return resource
     */
    public static function obtenerInstanciaCurl() {
        return self::$curl;
    }

    /**
     * Devuelve el código HTTP de retorno de la última solicitud.
     * @return int
     */
    public static function obtenerCodigoHttp() {
        return self::$codigo;
    }

    /**
     * Devuelve el error de la última solicitud.
     * @return string
     */
    public static function obtenerError() {
        return self::$error;
    }

    /**
     * Realiza una solicitud HTTP y devuelve el cuerpo de la respuesta
     * @var string $tipo Tipo de solicitud, `'get'` o `'post'`.
     * @var string $url URL.
     * @var array|string $campos Array asociativo de campos o cuerpo crudo (cadena) de la solicitud `POST`.
     * @var array $encabezados Array de encabezados adicionales.
     * @var array $opciones Array de opciones de CURL adicionales.
     * @var bool $mantener Si es true, no se cerrará la instancia de CURL luego de realizar la solicitud.
     * @return string|bool
     */
    protected static function solicitud($tipo,$url,$campos=null,$encabezados=null,$opciones=null,$mantener=false) {			
        if(!self::$curlAbierto) self::$curl=curl_init();
        self::$curlAbierto=true;

        if(!is_array($opciones)) $opciones=[];
        if(!is_array($campos)&&!is_string($campos)) $campos=[];
        if(!is_array($encabezados)) $encabezados=[];

        if(is_array($campos)) {
            $campos=http_build_query($campos);

            if($tipo=='get') {
                if(strpos($url,'?')===false) $url.='?'; else $url.='&';
                $url.=$campos;
            }
        }

        $arrayOpciones=[
            CURLOPT_URL=>$url,
            CURLOPT_SSL_VERIFYPEER=>false,
            CURLOPT_POST=>$tipo=='post',
            CURLOPT_RETURNTRANSFER=>true,
            CURLOPT_POSTFIELDS=>$tipo=='post'?$campos:null,
            CURLOPT_HTTPHEADER=>$encabezados,
            CURLOPT_HTTP_VERSION=>CURL_HTTP_VERSION_1_1
        ];
        foreach($opciones as $clave=>$valor) $arrayOpciones[$clave]=$valor;
        
        curl_setopt_array(self::$curl,$arrayOpciones);

        $res=curl_exec(self::$curl);

        self::$codigo=curl_getinfo(self::$curl,CURLINFO_HTTP_CODE);
        self::$error=curl_error(self::$curl);
        //TODO Extraer otros parámetros útiles        

        if(!$mantener) {
            curl_close(self::$curl);
            self::$curlAbierto=false;
        }

        return $res;
    }

    /**
     * Realiza una solicitud HTTP GET y devuelve el cuerpo de la respuesta
     * @var string $url URL.
     * @var array|string $campos Array asociativo de campos o cuerpo crudo (como cadena).
     * @var array $encabezados Array de encabezados adicionales.
     * @return string|bool
     */
    public static function post($url,$campos,$encabezados=null) {
        return self::solicitud('post',$url,$campos,$encabezados);
    }

    /**
     * Realiza una solicitud HTTP POST y devuelve el cuerpo de la respuesta
     * @var string $url URL.
     * @var array $campos Array asociativo de campos.
     * @var array $encabezados Array de encabezados adicionales.
     * @return string|bool
     */
    public static function get($url,$campos,$encabezados=null) {
        return self::solicitud('get',$url,$campos,$encabezados);
    }

    //TODO Otros métodos
    //TODO Optimizar para consultas múltiples consecutivas (mantener cookies, etc.)
}