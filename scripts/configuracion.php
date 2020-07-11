<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Configuración de los scripts de compilación
//Este es un script de PRUEBA (eventualmente se combinará con el resto del código del IDE)

chdir(__DIR__);

define('_closure','java -jar closure-compiler-v20200517.jar');
define('_fuente',__DIR__.'/../fuente/');
define('_desarrollo',__DIR__.'/../desarrollo/');
define('_produccion',__DIR__.'/../produccion/');
define('_embeber',__DIR__.'/../embeber/');

include(__DIR__.'/funciones.php');
