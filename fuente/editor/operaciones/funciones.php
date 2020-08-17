<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para abrir/guardar los datos en el editor

define('_inc',1);

include(__DIR__.'/../../servidor/foxtrot.php');

header('Content-Type: text/plain; charset=utf-8',true);

function prepararVariables() {
    global $nombreApl,$nombreVista,$esPhp,$plantilla,$aplicacion,
        $rutaApl,$rutaHtml,$rutaCss,$rutaJsonApl,$rutaVista,
        $modo,$cliente,$rutaRecursos,$urlRecursos,$rutaJs,$urlCss;

    $nombreApl=$_POST['aplicacion'];
    $nombreVista=$_POST['vista'];

    foxtrot::inicializar($nombreApl);

    $modo=$_POST['modo'];
    if(!$modo) $modo='independiente';

    $cliente=$_POST['cliente'];
    if(!$cliente) $cliente='web';

    $rutaApl=__DIR__.'/../../../desarrollo/aplicaciones/'.$nombreApl.'/';
    $rutaJsonApl=$rutaApl.'aplicacion.json';

    $aplicacion=json_decode(file_get_contents($rutaJsonApl));

    //Si la viista existe, modo y cliente deben tomarse del JSON
    if($aplicacion->$nombreVista) {
        $modo=$aplicacion->$nombreVista->modo;
        $cliente=$aplicacion->$nombreVista->cliente;
    }

    $esPhp=$cliente=='web';

    $rutaVista=$rutaApl.'cliente/vistas/'.$nombreVista;
    $rutaHtml=$rutaVista.'.'.($esPhp?'php':'html');
    $rutaCss=$rutaVista.'.css';
    $rutaRecursos=$rutaApl.'recursos/';
    $urlRecursos='aplicaciones/'.$nombreApl.'/recursos/';
    $urlCss='aplicacion/cliente/vistas/'.$nombreVista.'.css';
    $rutaJs=$rutaApl.'cliente/controladores/'.$nombreVista.'.js';

    $plantilla='independiente.'.($esPhp?'php':'html');
    if($modo=='embebible') {
        $plantilla=$modo.'.'.($esPhp?'php':'html');
    } elseif($cliente=='cordova'||$cliente=='escritorio') {
        $plantilla=$cliente.'.html';
    }
}

function crearVista() {
    global $nombreApl,$nombreVista,$plantilla,$aplicacion,$rutaHtml,$rutaCss,$rutaJsonApl,$modo,$cliente,$rutaVista;

    if(!is_dir(dirname($rutaVista))) mkdir(dirname($rutaVista),0755,true);
    
    //Crear CSS
    file_put_contents($rutaCss,''); 

    //Crear JSON
    $json=json_encode([
        'version'=>1,
        'componentes'=>[
            ['componente'=>'vista']
        ],
        'nombre'=>$nombreVista
    ]);

    //Crear HTML
    $codigo=file_get_contents(__DIR__.'/../plantillas/'.$plantilla);

    $codigo=str_replace_array([
        '{editor_nombreAplicacion}'=>$nombreApl,
        '{editor_nombreVista}'=>$nombreVista,
        '{editor_tema}'=>'tema-'.$aplicacion->tema,
        '{editor_urlBase}'=>foxtrot::obtenerUrl()
    ],$codigo);
    
    //Reemplazar variable jsonFoxtrot (igual que al guardar)
    $codigo=reemplazarVarJson($codigo,$json);

    file_put_contents($rutaHtml,$codigo); 

    //Agregar la vista al JSON de la aplicación
    $aplicacion->vistas->$nombreVista=[
        'tipo'=>$modo,
        'cliente'=>$cliente
    ];
    file_put_contents($rutaJsonApl,json_encode($aplicacion));
}

function crearControlador() {    
    global $nombreVista,$rutaJs;

    if(!is_dir(dirname($rutaJs))) mkdir(dirname($rutaJs),0755,true);

    $codigo=file_get_contents(__DIR__.'/../plantillas/controlador.js');

    $codigo=str_replace([
        '{editor_nombre}'
    ],[
        $nombreVista
    ],$codigo);

    file_put_contents($rutaJs,$codigo);
}

function reemplazarVarJson($codigo,$json) {
    $json=str_replace('\'','\\\'',$json);
    return preg_replace('/var jsonFoxtrot\s*?=\s*?\'(.+?)\'\s*?;/s','var jsonFoxtrot=\''.$json.'\';',$codigo);
}

function reemplazarTagBase($codigo) {
    global $esPhp;
    if(!$esPhp) return $codigo;
    return preg_replace('/<base .*?href=("|\').+?(\1).*?>/s','<base href="<?=\foxtrot::obtenerUrl()?>">',$codigo);
}