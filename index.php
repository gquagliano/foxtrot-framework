<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="test.css">
    <title>Test</title>
  </head>
  <body>
    <div id="foxtrot-barra-componentes" class="foxtrot-barra-herramientas">
        <div class="foxtrot-asa-arrastre"></div>
        <div class="foxtrot-contenidos-barra-herramientas"></div>
    </div>
    <div id="foxtrot-cuerpo"></div>
    

    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"></script>

    <!-- Eventualmente, todo esto estará compilado en un solo script con Closure -->
    <script src="util.js"></script>
    <script src="dom.js"></script>
    <script src="arrastra.js"></script>
    <link rel="stylesheet" href="dom.css">
    <script src="ui.js"></script>
    <script src="componente.js"></script>
    <script src="componentes/texto.js"></script>
    <script src="componentes/contenedor.js"></script>
    <script src="test.js"></script>
    
  </body>
</html>