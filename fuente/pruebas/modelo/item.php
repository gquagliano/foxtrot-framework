<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modelo;

class item extends \entidad {
    protected static $nombreModelo='items';
    
    /**
     * @tipo cadena(200)
     * @publico
     */
    public $titulo;

    /**
     * @tipo texto
     * @publico
     */
    public $texto;

    /**
     * @tipo decimal(10.2)
     * @publico
     */
    public $precio;

    /**
     * @tipo logico
     * @publico
     */
    public $activo;

    /**
     * @tipo entero
     * @publico
     */
    public $duracion;

    /**
     * @tipo cadena(20)
     * @publico
     */
    public $usuario;

    /**
     * @contrasena
     */
    public $contrasena;

    /**
     * @tipo cadena(50)
     */
    public $secreto;

    /**
     * @tipo entero
     * @publico
     */
    public $id_tipo;

    /**
     * @tipo relacional
     * @relacion 1:0
     * @entidad tipo
     * @campo id_tipo
     * @simple
     */
    public $tipo;

    /**
     * @tipo entero
     * @publico
     */
    public $id_subtipo;

    /**
     * @tipo relacional
     * @relacion 1:0
     * @entidad tipo
     * @campo id_subtipo
     * @publico
     */
    public $subtipo;

    /**
     * @tipo relacional
     * @relacion 1:n
     * @entidad comentario
     * @campo id_item
     * @publico
     */
    public $comentarios;

    /**
     * @tipo relacional
     * @relacion 1:n
     * @entidad imagen
     * @campo id_item
     * @publico
     * @eliminar
     */
    public $imagenes;

    /**
     * @tipo entero
     * @publico
     */
    public $procesado;

    /**
     * @tipo relacional
     * @relacion 1:0
     * @entidad extra
     * @campoForaneo id_item
     * @publico
     */
    public $extras;

    public function prepararValores($op) {
        $this->procesado=[
            'uno'=>1,
            'dos'=>2,
            'tres'=>3
        ][$this->procesado];

        return parent::prepararValores($op);
    }

    public function procesarValores($op) {
        $this->procesado=[
            1=>'uno',
            2=>'dos',
            3=>'tres'
        ][$this->procesado];

        return parent::procesarValores($op);
    }
}