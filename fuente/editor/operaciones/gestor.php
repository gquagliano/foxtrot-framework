<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

define('_inc',1);

include(__DIR__.'/../gestor.php');

header('Content-Type: text/plain; charset=utf-8',true);

asistentes::inicializar();

gestor::procesarSolicitud();