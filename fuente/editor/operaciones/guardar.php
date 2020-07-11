<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */ 

//Script de PRUEBA para guardar los datos provenientes del editor

define('_inc',1);

include(__DIR__.'/../servidor/foxtrot.php');
foxtrot::inicializar();

/*
El guardado funcionará de la siguiente manera:
- Se almacenará el html en un archivo completo independiente, o bien solo el cuerpo de la vista si se cargará en forma dinámica
- Se almacenará el css en el archivo de estilos de la aplicación
- Se almacenará el json con la definición de la vista y sus componentes dentro del archivo html (para que se cargue en una única solicitud)
- Se almacenará un archivo json con una copia del html, el css y el json para poder recuperarlo fácilmente en el editor
- Resta agregar un archivo de definiciones de la aplicación que almacene, entre otras cosas, el listado de vistas
*/

$previsualizar=$_POST['previsualizar']=='1';
$cordova=$_POST['cordova']=='1';

if($previsualizar) {
    //TODO
} else {
    $ruta=__DIR__.'/../'.$_POST['ruta'];
    $nombre=basename($ruta);
    preg_match('#/aplicaciones/(.+?)/#',$ruta,$coin);
    $nombreApp=$coin[1];
    $rutaHtml=$ruta.'.'.($cordova||$modo=='embebible'?'html':'php');
    $rutaCss=$ruta.'.css';
    $rutaJson=$ruta.'.json';
}

$modo=$_POST['modo'];
$html=$_POST['html'];
$css=$_POST['css'];
$json=json_decode($_POST['json']);
$jsonHtml=str_replace('\'','\\\'',json_encode($json));

if($modo=='embebible') {
    file_put_contents($rutaHtml,$html);
} else {
    $rutaApp=$cordova?'aplicaciones/'.$nombreApp.'/':'aplicacion/'; //En Cordova no hay redireccionamiento
    
    $resultado=<<<RE
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">

RE;

    if($cordova) {
        $resultado.=<<<RE
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; media-src *; img-src 'self' data: content:;">
    <meta name="format-detection" content="telephone=no">

RE;
    } else {
        $resultado.=<<<RE
    <base href="<?=\\foxtrot::obtenerUrl()?>">

RE;
    }

    //TODO Modificar cuando se compile la aplicación
    $estilos=[
        'recursos/css/foxtrot.css',
        $rutaApp.'recursos/estilos.css',
        $rutaApp.'cliente/vistas/'.$nombre.'.css'
    ];

    //TODO Modificar cuando se compile la aplicación
    $scripts=[
        'cliente/foxtrot.js',
        $rutaApp.'cliente/vistas/'.$nombre.'.js'
    ];

    if($cordova) $scrits[]='cordova.js';

    $titulo=h($json->vista->metadatos->titulo);
    $favicon=$rutaSistema.'recursos/img/favicon.png';
    //TODO Otros metadatos
    //TODO Entre ellos, podría ser útil configurar el fondo de la página en Cordova (antes de que cargue el css)

    $resultado.=<<<RE
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">

RE;

    if(!$cordova) {
        foreach($estilos as $estilo) {
            $resultado.=<<<RE
    <link rel="stylesheet" href="${estilo}">

RE;
        }
    }

    $resultado.=<<<RE
    <meta name="generator" content="Foxtrot 7">
    <link rel="icon" href="${favicon}">
    <title>${titulo}</title>
    <style id="foxtrot-estilos"></style>
  </head>
  <body>

RE;

        if($cordova) {
            $resultado.=<<<RE
    <div id="contenedor-cordova" style="display:none;opacity:0">
    ${html}
    </div>
        
RE;
        } else {
            $resultado.=<<<RE
    ${html}

RE;
        }
    
        if(!$cordova) {
            foreach($scripts as $script) {
                $resultado.=<<<RE
        <script src="${script}"></script>

RE;
            }
        }
    
        $resultado.=<<<RE
    <script>

RE;

        if($cordova) {
            $cadenaEstilos=implode('\',\'',$estilos);
            $cadenaScripts=implode('\',\'',$scripts);
            $resultado.=<<<RE
    (function() {
        "use strict";
        var urlBase=localStorage.getItem("_urlBase"),
            scripts=[],
            listos=0,
            scriptOnLoad=function() {
                listos++;
                if(listos>=scripts.length) scriptsListos();
                else agregarScript();
            },
            agregarScript=function() {
                var elem=document.createElement("script");
                elem.onload=scriptOnLoad;
                elem.src=urlBase+scripts[listos];
                document.body.appendChild(elem);
            },
            agregarScripts=function(urls) {
                scripts=urls;
                agregarScript();
            },
            scriptsListos=function() {
                ui.cordova()
                    .agregarHojaEstilos(['${cadenaEstilos}'])
                    .establecerJson('${jsonHtml}')
                    .ejecutar();
            };
            agregarScripts(['${cadenaScripts}']);
    })();

RE;
        } else {
            $resultado.=<<<RE
            ui.establecerJson('${jsonHtml}')
                .ejecutar();

RE;
        }

        $resultado.=<<<RE
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