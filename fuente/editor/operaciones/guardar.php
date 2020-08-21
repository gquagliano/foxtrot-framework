<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */ 

//Script de PRUEBA para guardar los datos provenientes del editor

include(__DIR__.'/funciones.php');

prepararVariables();

$css=$_POST['css'];
$html=$_POST['html'];
$json=$_POST['json'];

//Solo debemos reemplazar la variable jsonFoxtrot, que en $html tiene el valor al momento de cargarse en el editor
$html=reemplazarVarJson($html,$json);

//Al editar una vista PHP, se está trabajando *con la salida* del código de la vista, por lo tanto debemos restaurar el código PHP
//TODO Por el momento, solo vamos a restaurar el tag <base>, pero debería diseñarse un mecanismo para que esto no esté fijo aquí
$html=reemplazarTagBase($html);

$html=limpiarHtml($html);

file_put_contents($rutaCss,$css);
file_put_contents($rutaHtml,$html);

echo json_encode([
    'estado'=>'ok'
]);