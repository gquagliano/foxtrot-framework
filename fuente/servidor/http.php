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
    protected $curl;
    protected $curlAbierto=false;
    protected $codigo;

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
     * Realiza una solicitud HTTP y devuelve el cuerpo de la respuesta
     * @var string $tipo Tipo de solicitud, 'get' o 'post'.
     * @var string $url URL.
     * @var array $campos Array asociativo de campos.
     * @var array $encabezados Array de encabezados adicionales.
     * @var array $opciones Array de opciones de CURL adicionales.
     * @var bool $mantener Si es true, no se cerrará la instancia de CURL luego de realizar la solicitud.
     * @return string|bool
     */
    protected static function solicitud($tipo,$url,$campos,$encabezados=null,$opciones=null,$mantener=false) {			
        if(!self::$curlAbierto) self::$curl=curl_init();
        self::$curlAbierto=true;

        if(!is_array($opciones)) $opciones=[];
        if(!is_array($campos)) $campos=[];
        if(!is_array($encabezados)) $encabezados=[];

        if(count($campos)) {
            $campos=http_build_query($campos);

            if($tipo=='get') {
                if(strpos($url,'?')===false) $url.='?'; else $url.='&';
                $url.=$campos;
            }
        }

        $opciones=array_merge([
            CURLOPT_URL=>$url,
            CURLOPT_SSL_VERIFYPEER=>false,
            CURLOPT_POST=>$tipo=='post',
            CURLOPT_RETURNTRANSFER=>true,
            CURLOPT_POSTFIELDS=>$tipo=='post'?$campos:null,
            CURLOPT_HTTPHEADER=>$encabezados
        ],$opciones);

        curl_setopt_array(self::$curl,$opciones);

        $res=curl_exec(self::$curl);

        self::$codigo=curl_getinfo(self::$curl,CURLINFO_HTTP_CODE);
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
     * @var array $campos Array asociativo de campos.
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