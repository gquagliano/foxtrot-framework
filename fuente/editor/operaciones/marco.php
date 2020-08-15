<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para mostrar vistas embebibles en el marco del editor

include(__DIR__.'/funciones.php');

prepararVariables();

foxtrot::inicializar($nombreApl);

$json=file_get_contents($rutaJson);

$html=file_get_contents($rutaHtml);
?>
<!doctype html>
<html lang="es">
  <head>
    <base href="<?=\foxtrot::obtenerUrl()?>">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="recursos/css/foxtrot.css">
    <link rel="stylesheet" href="recursos/css/<?=$aplicacion->tema?>.css">
    <link rel="stylesheet" href="aplicacion/recursos/css/estilos.css">
    <link rel="stylesheet" href="<?=$urlCss?>">
    <title>Marco del editor de vistas</title>
  </head>
  <body>
    <div id="foxtrot-cuerpo"><?=$html?></div>
    <script src="cliente/foxtrot.js"></script>
    <script>
    var jsonFoxtrot='<?=json_encode($json)?>';
    ui.inicializar("<?=$nombreVista?>")
        .establecerJson(jsonFoxtrot)
        .ejecutar();
    </script>
  </body>
</html>