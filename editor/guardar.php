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

//Script de PRUEBA para guardar los datos provenientes del editor

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

    //TODO Modificar cuando se compile
    $estilos=[
        'recursos/css/bootstrap.min.css',
        'recursos/css/foxtrot.css',
        $rutaApp.'recursos/estilos.css',
        $rutaApp.'frontend/'.$nombre.'.css'
    ];

    //TODO Modificar cuando se compile
    $scripts=[
        'frontend/util.js',
        'frontend/dom.js',
        'frontend/ajax.js',
        'frontend/arrastra.js',
        'frontend/componente.js',
        'frontend/controlador.js',
        'frontend/ui.js',
        'frontend/componentes/contenedor.js',
        'frontend/componentes/texto.js',
        'frontend/componentes/imagen.js',
        'frontend/componentes/boton.js',
        'frontend/componentes/icono.js',
        'frontend/componentes/espaciador.js',
        'frontend/componentes/fila.js',
        'frontend/componentes/columna.js',
        'frontend/componentes/form.js',
        'frontend/componentes/dialogo.js',
        'frontend/componentes/menu-lateral.js',
        'frontend/componentes/pestanas.js',
        'frontend/componentes/pestana.js',
        'frontend/componentes/deslizable.js',
        'frontend/componentes/navegacion.js',
        'frontend/componentes/arbol.js',
        'frontend/componentes/etiqueta.js',
        'frontend/componentes/condicional.js',
        'frontend/componentes/bucle.js',
        'frontend/componentes/codigo.js',
        'frontend/componentes/importar.js',
        'frontend/componentes/campo.js',
        'frontend/componentes/desplegable.js',
        'frontend/componentes/buscador.js',
        'frontend/componentes/checkbox.js',
        'frontend/componentes/opciones.js',
        'frontend/componentes/alternar.js',
        'frontend/componentes/fecha.js',
        'frontend/componentes/hora.js',
        'frontend/componentes/agenda.js',
        'frontend/componentes/menu.js',
        'frontend/componentes/archivo.js',
        'frontend/componentes/tabla.js',
        'frontend/componentes/tabla-columna.js',
        'frontend/componentes/tabla-fila.js',
        'frontend/componentes/vista.js',
        'frontend/backend.js',
        $rutaApp.'frontend/'.$nombre.'.js'
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