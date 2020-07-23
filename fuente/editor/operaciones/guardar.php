<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */ 

//Script de PRUEBA para guardar los datos provenientes del editor

define('_inc',1);

include(__DIR__.'/../../servidor/foxtrot.php');
foxtrot::inicializar();

/*
El guardado funcionará de la siguiente manera:
- Se almacenará el html en un archivo completo independiente, o bien solo el cuerpo de la vista si se cargará en forma dinámica
- Se almacenará el css en el archivo de estilos de la aplicación
- Se almacenará el json con la definición de la vista y sus componentes dentro del archivo html (para que se cargue en una única solicitud)
- Se almacenará un archivo json con una copia del html, el css y el json para poder recuperarlo fácilmente en el editor
- Resta agregar un archivo de definiciones de la aplicación que almacene, entre otras cosas, el listado de vistas
*/

$previsualizar=$_POST['previsualizar']=='1'; //TODO
$ruta=$_POST['ruta'];
$modo=$_POST['modo'];
$cliente=$_POST['cliente'];

if(!$modo) $modo='independiente';
if(!$cliente) $cliente='web';

$esPhp=$cliente=='web';

$ruta=__DIR__.'/../../'.$_POST['ruta'];
$nombreVista=basename($ruta);
preg_match('#/aplicaciones/(.+?)/#',$ruta,$cc);
$nombreApl=$cc[1];
$rutaHtml=$ruta.'.'.($esPhp?'php':'html');
$rutaCss=$ruta.'.css';
$rutaJson=$ruta.'.json';

$css=$_POST['css'];
$html=$_POST['html'];
$json=$_POST['json'];
$jsonObj=json_decode($json);
$jsonHtml=str_replace('\'','\\\'',$json);

$plantilla='independiente.'.($esPhp?'php':'html');
if($modo=='embebible') {
    $plantilla=$modo.'.'.($esPhp?'php':'html');
} elseif($cliente=='cordova'||$cliente=='escritorio') {
    $plantilla=$cliente.'.html';
}

$codigo=file_get_contents(__DIR__.'/../plantillas/'.$plantilla);

$codigo=str_replace_array([
    '{editor_nombreAplicacion}'=>$nombreApl,
    '{editor_nombreVista}'=>$nombreVista,
    '{editor_json}'=>$jsonHtml,
    '{editor_html}'=>$html,
    //TODO Construir desde las propiedades de la vista
    '{editor_urlBase}'=>'',
    '{editor_urlFavicon}'=>'',
    '{editor_titulo}'=>'',
    '{editor_metadatos}'=>''
],$codigo);

file_put_contents($rutaHtml,$codigo);

file_put_contents($rutaCss,$css);

file_put_contents($rutaJson,$json);

echo json_encode([
    'estado'=>'ok'
]);