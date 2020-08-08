<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

define('_inc',1);

include(__DIR__.'/../servidor/foxtrot.php');
foxtrot::inicializar();
?>
<!doctype html>
<html lang="es">
  <head>
    <base href="<?=\foxtrot::obtenerUrl()?>">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="recursos/css/foxtrot.css">
    <link rel="stylesheet" href="editor/editor.css">
    <title>Marco del editor de vistas</title>
  </head>
  <body class="foxtrot-mostrar-invisibles">
    <div id="foxtrot-cuerpo"></div>
    <style id="foxtrot-estilos"></style>
        
    <script src="cliente/foxtrot.js"></script>
    <script>
    "use strict";
    var ui,editor;
    window.evento("load",function() {
        ui=window.parent.ui;
        editor=window.parent.editor;
        ui.ejecutar(document);
        editor.activar();
    });
    </script>
  </body>
</html>