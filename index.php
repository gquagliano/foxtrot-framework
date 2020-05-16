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
  <body class="foxtrot-editor">

    <div id="foxtrot-barra-principal" class="foxtrot-editor foxtrot-barra-herramientas">
        <button class="btn btn-sm" onclick="editor.abrir()" title="Abrir"><img src="img/abrir.png"></button>
        <button class="btn btn-sm" onclick="editor.guardar()" title="Guardar"><img src="img/guardar.png"></button>
        <button class="btn btn-sm" onclick="editor.previsualizar()" title="Previsualizar la vista en una nueva ventana (sin guardar los cambios)"><img src="img/previsualizar.png"></button>
        <button class="btn btn-sm" onclick="editor.deshacer()" disabled id="foxtrot-btn-deshacer" title="Deshacer"><img src="img/deshacer.png"></button>
        <button class="btn btn-sm" onclick="editor.rehacer()" disabled id="foxtrot-btn-rehacer" title="Rehacer"><img src="img/rehacer.png"></button>
        <div class="float-right text-nowrap">
            <img src="img/cargando.svg" id="foxtrot-cargando">
            <button class="btn btn-sm" onclick="editor.alternarBordes()" id="foxtrot-btn-alternar-bordes" title="Activar / desactivar bordes"><img src="img/bordes.png"></button>
            <select class="custom-select" title="Tamaño de pantalla" onchange="editor.tamanoMarco(this.valor())">
                <option value="g">Global</option>
                <option value="xl">Extra grande</option>
                <option value="lg">Grande</option>
                <option value="md">Medio</option>
                <option value="sm">Pequeño</option>
                <option value="xs">Extra pequeño</option>
            </select>
        </div>
    </div>
    <div id="foxtrot-barra-componentes" class="foxtrot-editor foxtrot-barra-herramientas-flotante">
        <div class="foxtrot-asa-arrastre"></div>
        <div class="foxtrot-contenidos-barra-herramientas"></div>
    </div>
    <div id="foxtrot-barra-propiedades" class="foxtrot-editor foxtrot-barra-herramientas-flotante foxtrot-barra-propiedades-vacia">
        <div class="foxtrot-asa-arrastre"></div>
        <div class="foxtrot-contenidos-barra-herramientas">Ningún componente seleccionado</div>
    </div>
    
    <!-- Eventualmente, todo esto estará compilado en un solo script con Closure -->

    <script src="util.js"></script>
    <script src="dom.js"></script>
    <script src="ajax.js"></script>
    <script src="arrastra.js"></script>
    <script src="ui.js"></script>
    <script src="componente.js"></script>

    <script src="componentes/contenedor.js"></script>
    <link rel="stylesheet" href="componentes/css/contenedor.edicion.css">

    <script src="componentes/texto.js"></script>
    <script src="componentes/fila.js"></script>
    <script src="componentes/columna.js"></script>

    <script src="editor.js"></script>    
    
    <iframe id="foxtrot-marco" src="marco.html"></iframe>
    <div id="foxtrot-menu"></div>
  </body>
</html>