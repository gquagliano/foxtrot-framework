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
    <link rel="stylesheet" href="editor.css">
    <title>Editor de vistas</title>
  </head>
  <body>
    <div id="foxtrot-barra-principal" class="foxtrot-barra-herramientas">
        <button class="btn btn-sm" onclick="editor.guardar()" title="Guardar"><img src="img/guardar.png"></button>
        <button class="btn btn-sm" onclick="editor.previsualizar()" title="Previsualizar la vista en una nueva ventana (sin guardar los cambios)"><img src="img/previsualizar.png"></button>
        <button class="btn btn-sm" onclick="editor.deshacer()" disabled id="foxtrot-btn-deshacer" title="Deshacer"><img src="img/deshacer.png"></button>
        <button class="btn btn-sm" onclick="editor.rehacer()" disabled id="foxtrot-btn-rehacer" title="Rehacer"><img src="img/rehacer.png"></button>
        <img src="img/cargando.svg" id="foxtrot-cargando">
    </div>
    <div id="foxtrot-barra-componentes" class="foxtrot-barra-herramientas-flotante">
        <div class="foxtrot-asa-arrastre"></div>
        <div class="foxtrot-contenidos-barra-herramientas"></div>
    </div>
    <div id="foxtrot-barra-propiedades" class="foxtrot-barra-herramientas-flotante">
        <div class="foxtrot-asa-arrastre"></div>
        <div class="foxtrot-contenidos-barra-herramientas"></div>
    </div>

    <div id="foxtrot-cuerpo"></div>

    <!-- Eventualmente, todo esto estará compilado en un solo script con Closure -->
    <script src="util.js"></script>
    <script src="dom.js"></script>
    <script src="ajax.js"></script>
    <script src="arrastra.js"></script>
    <script src="ui.js"></script>
    <script src="componente.js"></script>
    <script src="componentes/contenedor.js"></script>
    <script src="componentes/texto.js"></script>
    <script src="componentes/fila.js"></script>
    <script src="componentes/columna.js"></script>
    <script src="editor.js"></script>
    <script src="test.js"></script>
    
  </body>
</html>