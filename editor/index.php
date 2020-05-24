<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */
?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="../recursos/css/foxtrot.css">
    <link rel="stylesheet" href="editor.css">
    <title>Editor de vistas</title>
  </head>
  <body class="foxtrot-editor">

    <div id="foxtrot-barra-principal" class="foxtrot-editor foxtrot-barra-herramientas">
        <button class="btn btn-sm" onclick="editor.abrir()" disabled title="Abrir" ><img src="img/abrir.png"></button>
        <button class="btn btn-sm" onclick="editor.guardar()" title="Guardar"><img src="img/guardar.png"></button>
        <button class="btn btn-sm" onclick="editor.previsualizar()" disabled title="Previsualizar la vista en una nueva ventana (sin guardar los cambios)"><img src="img/previsualizar.png"></button>
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

    <!-- Esto es provisorio, hasta que tengamos el gestor de archivos o al menos diálogos de abrir/guardar -->
    <script>
        window.editorListo=function() {
            editor.abrir({
                ruta:"<?=$_GET['vista']?>",
                modo:"<?=$_GET['modo']?$_GET['modo']:'independiente'?>",
                cordova:<?=$_GET['cordova']=='1'?'true':'false'?>
            });
        };
    </script>
    
    <!-- Eventualmente, todo esto estará compilado en un solo script con Closure, y los css combinados en un solo archivo -->

    <script src="../frontend/util.js"></script>
    <script src="../frontend/expresion.js"></script>
    <script src="../frontend/ajax.js"></script>
    <script src="../frontend/dom.js"></script>
    <script src="../frontend/arrastra.js"></script>
    <script src="../frontend/editable.js"></script>
    <script src="../frontend/componente.js"></script>
    <script src="../frontend/controlador.js"></script>
    <script src="../frontend/ui.js"></script>
    
    <script src="../frontend/componentes/contenedor.js"></script>
    <script src="../frontend/componentes/texto.js"></script>
    <script src="../frontend/componentes/imagen.js"></script>
    <script src="../frontend/componentes/boton.js"></script>
    <script src="../frontend/componentes/icono.js"></script>
    <script src="../frontend/componentes/espaciador.js"></script>

    <script src="../frontend/componentes/fila.js"></script>
    <script src="../frontend/componentes/columna.js"></script>
    <script src="../frontend/componentes/form.js"></script>
    <script src="../frontend/componentes/dialogo.js"></script>
    <script src="../frontend/componentes/menu-lateral.js"></script>
    <script src="../frontend/componentes/pestanas.js"></script>
    <script src="../frontend/componentes/pestana.js"></script>
    <script src="../frontend/componentes/deslizable.js"></script>
    <script src="../frontend/componentes/navegacion.js"></script>
    <script src="../frontend/componentes/arbol.js"></script>

    <script src="../frontend/componentes/etiqueta.js"></script>
    <script src="../frontend/componentes/condicional.js"></script>
    <script src="../frontend/componentes/bucle.js"></script>
    <script src="../frontend/componentes/codigo.js"></script>
    <script src="../frontend/componentes/importar.js"></script>

    <script src="../frontend/componentes/campo.js"></script>
    <script src="../frontend/componentes/desplegable.js"></script>
    <script src="../frontend/componentes/buscador.js"></script>
    <script src="../frontend/componentes/checkbox.js"></script>
    <script src="../frontend/componentes/opciones.js"></script>
    <script src="../frontend/componentes/alternar.js"></script>
    <script src="../frontend/componentes/fecha.js"></script>
    <script src="../frontend/componentes/hora.js"></script>
    <script src="../frontend/componentes/agenda.js"></script>
    <script src="../frontend/componentes/menu.js"></script>
    <script src="../frontend/componentes/archivo.js"></script>

    <script src="../frontend/componentes/tabla.js"></script>    
    <script src="../frontend/componentes/tabla-columna.js"></script>
    <script src="../frontend/componentes/tabla-fila.js"></script>
    
    <script src="../frontend/componentes/vista.js"></script>
    
    <script src="editor.js"></script>
    
    <iframe id="foxtrot-marco" src="marco.html"></iframe>
    <div id="foxtrot-menu"></div>
  </body>
</html>