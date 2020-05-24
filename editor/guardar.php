<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */ 

define('_inc',1);

include(__DIR__.'/../backend/foxtrot.php');
foxtrot::inicializar();

//Script de prueba para guardar los datos provenientes del editor

/*
El guardado funcionará de la siguiente manera:
- Se almacenará el html en un archivo completo independiente, o bien solo el cuerpo de la vista si se cargará en forma dinámica
- Se almacenará el css en el archivo de estilos de la aplicación
- Se almacenará el json con la definición de la vista y sus componentes dentro del archivo html (para que se cargue en una única solicitud)
- Se almacenará un archivo json con una copia del html, el css y el json para poder recuperarlo fácilmente en el editor
*/

//TODO Debemos determinar cómo definir la url. Recordemos que debe poder abrirse desde Cordova.
$url=configuracion::$url;

$previsualizar=$_POST['previsualizar']=='1';
$cordova=$_POST['cordova']=='1';

if($previsualizar) {
    //TODO
} else {
    $ruta=__DIR__.'/../'.$_POST['ruta'];
    $nombre=basename($ruta);
    $rutaHtml=$ruta.'.html';
    $rutaCss=$ruta.'.css';
    $rutaJson=$ruta.'.json';
}

$modo=$_POST['modo'];
$html=$_POST['html'];
$css=$_POST['css'];
$json=$_POST['json'];
$jsonHtml=str_replace('\'','\\\'',$json);

if($modo!='embebible') {
    if($cordova) {
        $inicializacionCordova='.cordova(true)';
        $base='';
        $rutaSistema='/';
        $rutaApp='/aplicaciones/'.$nombre.'/';
        //Lógicamente, cuando todo se compile, también removeremos los archivos externos (cdn)
    } else {
        $inicializacionCordova='';
        $base='<base href="'.$url.'">';
        $rutaSistema='';
        $rutaApp='aplicacion/';
    }    

    $resultado=<<<RE
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    $base
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="${rutaSistema}recursos/css/foxtrot.css">
    <link rel="stylesheet" href="${rutaApp}recursos/estilos.css">
    <link rel="stylesheet" href="${rutaApp}frontend/$nombre.css">
    <meta name="generator" content="Foxtrot 7">
    <link rel="icon" href="recursos/img/favicon.png">
    <title></title>
    <style id="foxtrot-estilos"></style>
  </head>
  <body>
    $html
    
    <script src="${rutaSistema}frontend/util.js"></script>
    <script src="${rutaSistema}frontend/dom.js"></script>
    <script src="${rutaSistema}frontend/ajax.js"></script>
    <script src="${rutaSistema}frontend/arrastra.js"></script>
    <script src="${rutaSistema}frontend/componente.js"></script>
    <script src="${rutaSistema}frontend/controlador.js"></script>    
    <script src="${rutaSistema}frontend/ui.js"></script>
    
    <script src="${rutaSistema}frontend/componentes/contenedor.js"></script>
    <script src="${rutaSistema}frontend/componentes/texto.js"></script>
    <script src="${rutaSistema}frontend/componentes/imagen.js"></script>
    <script src="${rutaSistema}frontend/componentes/boton.js"></script>
    <script src="${rutaSistema}frontend/componentes/icono.js"></script>
    <script src="${rutaSistema}frontend/componentes/espaciador.js"></script>

    <script src="${rutaSistema}rontend/componentes/fila.js"></script>
    <script src="${rutaSistema}rontend/componentes/columna.js"></script>
    <script src="${rutaSistema}rontend/componentes/form.js"></script>
    <script src="${rutaSistema}rontend/componentes/dialogo.js"></script>
    <script src="${rutaSistema}rontend/componentes/menu-lateral.js"></script>
    <script src="${rutaSistema}rontend/componentes/pestanas.js"></script>
    <script src="${rutaSistema}rontend/componentes/pestana.js"></script>
    <script src="${rutaSistema}rontend/componentes/deslizable.js"></script>
    <script src="${rutaSistema}rontend/componentes/navegacion.js"></script>
    <script src="${rutaSistema}rontend/componentes/arbol.js"></script>

    <script src="${rutaSistema}frontend/componentes/etiqueta.js"></script>
    <script src="${rutaSistema}frontend/componentes/condicional.js"></script>
    <script src="${rutaSistema}frontend/componentes/bucle.js"></script>
    <script src="${rutaSistema}frontend/componentes/codigo.js"></script>
    <script src="${rutaSistema}frontend/componentes/importar.js"></script>

    <script src="${rutaSistema}frontend/componentes/campo.js"></script>
    <script src="${rutaSistema}frontend/componentes/desplegable.js"></script>
    <script src="${rutaSistema}frontend/componentes/buscador.js"></script>
    <script src="${rutaSistema}frontend/componentes/checkbox.js"></script>
    <script src="${rutaSistema}frontend/componentes/opciones.js"></script>
    <script src="${rutaSistema}frontend/componentes/alternar.js"></script>
    <script src="${rutaSistema}frontend/componentes/fecha.js"></script>
    <script src="${rutaSistema}frontend/componentes/hora.js"></script>
    <script src="${rutaSistema}frontend/componentes/agenda.js"></script>
    <script src="${rutaSistema}frontend/componentes/menu.js"></script>
    <script src="${rutaSistema}frontend/componentes/archivo.js"></script>

    <script src="${rutaSistema}frontend/componentes/tabla.js"></script>    
    <script src="${rutaSistema}frontend/componentes/tabla-columna.js"></script>
    <script src="${rutaSistema}frontend/componentes/tabla-fila.js"></script>

    <script src="${rutaSistema}frontend/componentes/vista.js"></script>

    <script src="${rutaSistema}frontend/backend.js"></script>

    <script src="${rutaApp}frontend/$nombre.js"></script>
    <script>
    ui$inicializacionCordova.establecerJson('$json').ejecutar();
    </script>
  </body>
</html>
RE;
    file_put_contents($rutaHtml,$resultado);
}

file_put_contents($rutaCss,$css);

file_put_contents($rutaJson,json_encode([
    'html'=>$html,
    'css'=>$css,
    'json'=>$json
]));

echo json_encode([
    'estado'=>'ok'
]);