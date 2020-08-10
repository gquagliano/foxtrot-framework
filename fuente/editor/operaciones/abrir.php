<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para abrir los datos en el editor

define('_inc',1);

include(__DIR__.'/../../servidor/foxtrot.php');
foxtrot::inicializar();

header('Content-Type: text/plain; charset=utf-8',true);

$nombreApl=$_POST['aplicacion'];
$rutaApl=__DIR__.'/../../../desarrollo/aplicaciones/'.$nombreApl.'/';

$nombre=$_POST['ruta'];
$rutaVista=$rutaApl.'cliente/vistas/'.$nombre;

$rutaJson=$rutaVista.'.json';
$rutaCss=$rutaVista.'.css';
$rutaJs=$rutaApl.'cliente/controladores/'.$nombre.'.js';
$rutaJsonApl=$rutaApl.'aplicacion.json';
$rutaRecursos=$rutaApl.'recursos/';
$urlRecursos='aplicaciones/'.$nombreApl.'/recursos/';

if(!is_dir($rutaVista)) mkdir($rutaVista,0755,true);
if(!is_dir(dirname($rutaJs))) mkdir(dirname($rutaJs),0755,true);

if(!file_exists($rutaJs)) {
    //Controlador un nuevo con el mismo nombre que la vista (en el futuro esto debería ser opcional ya que no es necesario que toda vista tenga un controlador de igual nombre)
    file_put_contents($rutaJs,'/**
 * Controlador de la vista '.$nombre.'.
 */
ui.registrarControlador("'.$nombre.'",function() {
});
');
}

if(!file_exists($rutaJson)) {
    //Archivo nuevo
    $obj=(object)[
        'json'=>[
            'version'=>1,
            'componentes'=>[],
            'nombre'=>$nombre,
            'propiedades'=>(object)[]
        ],
        'html'=>'<div id="foxtrot-cuerpo"></div>',
        'css'=>''
    ];
} else {
    $obj=json_decode(file_get_contents($rutaJson));
    
    //Agregar el CSS
    $obj->css=file_get_contents($rutaCss);
}

//Agregar propiedades de la aplicación
$aplicacion=json_decode(file_get_contents($rutaJsonApl));
$obj->aplicacion=(object)[
    'css'=>$urlRecursos.'css/estilos.css',
];
if($aplicacion->tema) $obj->aplicacion->tema='recursos/css/tema-'.$aplicacion->tema.'.css';

echo json_encode($obj);