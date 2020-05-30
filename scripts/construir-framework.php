<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para construir y compilar los archivos del framework y el editor
//TODO Deben exportarse todos los símbolos para poder utilizar --compilation_level ADVANCED

define('_closure','java -jar closure-compiler-v20200517.jar');

//JS cliente (framework + componentes)

exec(_closure.' --js_output_file "'.escapeshellarg(__DIR__.'/../cliente/foxtrot.min.js').'" "'.escapeshellarg(realpath(__DIR__.'/../cliente').'/**.js').'" "!foxtrot.min.js"');