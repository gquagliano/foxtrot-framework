<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace enrutadores;

defined('_inc') or exit;

/**
 * Enrutador de solicitudes predeterminado para.
 */
class api extends \enrutador {
    /**
     * Constructor.
     */
    function __construct() {
        //Importar solo algunos tipos de solicitud (el resto no se admite)
        $this->tipos=[
            'recurso',
            'pagina',
            'controladorApi'
        ];
        foreach($this->tipos as $tipo) include_once(_servidor.'enrutadores/tipos/'.$tipo.'.php');
    }
}