<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace aplicaciones\ejemplo\modelo;

defined('_inc') or exit;

/**
 * Entidad del modelo de datos.
 */
class usuario extends \entidad {
    protected $tipoModelo=usuarios::class;

    //id y e (campo de baja lógica) son automáticos, no requieren propiedad ni comentario
    
    /**
     * @etiqueta Nombre
     * @tamano 3
     * @requerido
     * @tipo cadena(100)
     */
    public $nombre;
    
    /** 
     * @etiqueta Nivel de acceso
     * @tamano 3
     * @requerido
     * @tipo entero
     */
    public $nivel;

    /**
     * @etiqueta Nombre de usuario
     * @tamano 3
     * @requerido
     * @tipo cadena(50)
     * @indice
     */
    public $usuario; //El índice no es único ya que ante baja lógica debe poder reutilizarse el nombre de usuario

    /**
     * @etiqueta Contraseña
     * @tamano 3
     * @tipo cadena(255)
     */
    public $contrasena;
    
    /** 
     * @etiqueta E-mail
     * @tamano 6
     * @requerido
     * @tipo cadena(255)
     */
    public $email;    
    
    /** 
     * @etiqueta Teléfono
     * @tamano 6
     * @tipo cadena(50)
     */
    public $telefono;
}