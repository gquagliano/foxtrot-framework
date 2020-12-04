<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modulos;

use \PHPMailer\PHPMailer\PHPMailer;
use \PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

include_once(__DIR__.'/src/Exception.php');
include_once(__DIR__.'/src/PHPMailer.php');
include_once(__DIR__.'/src/SMTP.php');

defined('_inc') or exit;

/**
 * Módulo concreto email. Implementa PHPMailer versión 6.1.8.
 */
class email extends \modulo {
    /**
     * @var bool $usarMail Fuerza el uso de la función mail() de php. Mantener en false para usar la configuración SMTP de Foxtrot.
     * @var bool $usarSendmail Fuerza el uso de sendmail ($usarMail=true tiene prioridad). Mantener en false para usar la configuración SMTP de Foxtrot.
     */
    public $usarMail=false;
    public $usarSendmail=false;

    /**
     * Envía un mensaje de email.
     * @var string|array $destinatarios Destinatario, listado de destinatarios separados por comas, o array de destinatarios.
     * @var string $asunto Asunto.
     * @var string $cuerpo Cuerpo.
     * @var object|array $parametros Parámetros adicionales.
     * @var string $parametros->remitente Dirección del remitente.
     * @var string $parametros->nombreRemitente Nombre del remitente.
     * @var string $parametros->responder Dirección de respuesta.
     * @var string $parametros->retorno Dirección de retorno.
     * @var string $parametros->plantilla Plantilla (actualmente el único valor que acepta es `falso` para enviar el uso de la plantilla HTML básica y enviar el cuerpo tal cual
     * fue provisto).
     * @var bool $parametros->depuracion Habilita la salida de depuración por HTTP.
     * @var array $parametros->embeber Listado de imagenes a embeber. Array de objetos [ruta,cid].
     * @var string $parametros->alternativo Texto alternativo.
     * @return bool
     */
    public function enviar($destinatarios,$asunto,$cuerpo,$parametros=null) {
        //TOOD Implementar un sistema de plantillas

        if(!$parametros) {
            $parametros=[];
        } elseif(is_object($parametros)) {
            $parametros=(array)$parametros;
        }

        //Predeterminados
        $parametros=(object)array_merge([
            'remitente'=>\configuracion::$usuarioSmtp?\configuracion::$usuarioSmtp:'no-responder@foxtrotcloud.com',
            'nombreRemitente'=>null,
            'responder'=>null,
            'retorno'=>null,
            'plantilla'=>null,
            'depuracion'=>false,
            'embeber'=>null,
            'alternativo'=>null
        ],$parametros);
            
        if($parametros->plantilla===false) {
            $html=$cuerpo;
        } else {
            $html=file_get_contents(__DIR__.'/email.html');
            $cuerpo=str_replace_array([
                '{cuerpo}'=>$cuerpo
            ],$html);
        }

        $mail=new PHPMailer($parametros->depuracion);

        if($parametros->embeber) {
            foreach($parametros->embeber as $item) {
                if(!is_object($item)) $item=(object)$item;
                $mail->addEmbeddedImage($item->ruta,$item->cid);
                //Uso en el HTML: <img src="cid:logo">
            }
        }
            
        if($parametros->responder) $mail->addReplyTo($parametros->responder);

        ini_set('sendmail_from',$parametros->remitente);
        $mail->setFrom($parametros->remitente,$parametros->nombreRemitente);
                    
        if(!is_array($destinatarios)) $destinatarios=explode(';',str_replace(',',';',$destinatarios));
        foreach($destinatarios as $destinatario) {
            if(trim($destinatario)) $mail->addAddress($destinatario);
        }
            
        $mail->Subject=$asunto;
                
        $mail->CharSet='UTF-8';

        $mail->AltBody=$parametros->alternativo?$parametros->alternativo:$this->generarAlternativo($cuerpo);
            
        $mail->Body=$cuerpo;
        $mail->isHTML(true);

        if($this->usarMail) {
            $mail->isMail();
        } elseif($this->usarSendmail) {
            $mail->isSendmail();
        } else {
            $mail->isSMTP();
            $mail->Host=\configuracion::$servidorSmtp;
            $mail->SMTPAuth=\configuracion::$autenticacionSmtp;
            $mail->SMTPSecure=\configuracion::$seguridadSmtp;
            $mail->SMTPAutoTLS=false; //TODO Configurable
            $mail->Port=\configuracion::$puertoSmtp;
            $mail->Username=\configuracion::$usuarioSmtp;
            $mail->Password=\configuracion::$contrasenaSmtp;

            if($parametros->depuracion) $mail->SMTPDebug=SMTP::DEBUG_SERVER; 
        }
            
        return $mail->send();
    }

    /**
     * Genera y devuelve el texto alternativo a partir del código HTML.
     * @var string $html
     * @return string
     */
    protected function generarAlternativo($html) {
        $alt=html_entity_decode($html);
        $alt=preg_replace('/<br[^>]*>/si',"\n",$alt);
        $alt=preg_replace('/<hr[^>]*>/si',"\n----\n\n",$alt);
        $alt=preg_replace('/<head>.*?<\/head>/si','',$alt);
        $alt=strip_tags($alt);
        return $alt;
    }
}