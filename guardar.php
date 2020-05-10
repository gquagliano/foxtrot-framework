<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de prueba para guardar los datos provenientes del editor

/*
El guardado funcionará de la siguiente manera:
- Se almacenará el html en un archivo completo independiente, o bien solo el cuerpo de la vista si se cargará en forma dinámica
- Se almacenará el css en el archivo de estilos de la aplicación
- Se almacenará el json con la definición de la vista y sus componentes dentro del archivo html (para que se cargue en una única solicitud)
- Se almacenará un archivo json con una copia del html, el css y el json para poder recuperarlo fácilmente en el editor
*/


//Lógicamente, esto tiene que cambiar, es solo una prueba
$url='http://localhost/experimental-foxtrot-framework/';

$previsualizar=$_POST['previsualizar']=='true';

if($previsualizar) {
    $ruta='temp/';
    $nombre=basename(tempnam($ruta,'p')).'.html';
    $nombreCss=basename(tempnam($ruta,'e')).'.css';
} else {
    $ruta='salida/';
    $nombre=preg_replace('/[^a-z]/i','',$_POST['nombre']).'.html';
    $nombreCss='sitio.css';
    $nombreJson=preg_replace('/[^a-z]/i','',$_POST['nombre']).'.json';
}

$html=$_POST['html'];
$css=$_POST['css'];
$json=$_POST['json'];
$jsonHtml=str_replace('\'','\\\'',$json);

$resultado=<<<RE
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <base href="$url">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="$ruta$nombreCss">
    <title></title>
    <style id="foxtrot-estilos"></style>
  </head>
  <body>
    $html
    
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
    <script>
    ui.establecerJson('$json').ejecutar();
    </script>
  </body>
</html>
RE;

file_put_contents(__DIR__.'/'.$ruta.$nombre,$resultado);

//En la versión real, debe incorporarse el css a la hoja de estilos de la aplicación
file_put_contents(__DIR__.'/'.$ruta.$nombreCss,$css);

if(!$previsualizar) {
    file_put_contents(__DIR__.'/'.$ruta.$nombreJson,json_encode([
        'html'=>$html,
        'css'=>$css,
        'json'=>json_decode($json)
    ]));
}

echo json_encode([
    'nombre'=>$nombre,
    'url'=>$url.$ruta.$nombre 
]);