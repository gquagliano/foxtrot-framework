<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para crear o modificar las tablas de la base de datos a partir de las clases del modelo

define('_inc',1);

include(__DIR__.'/configuracion.php');
include(_desarrollo.'servidor/foxtrot.php');

$opciones=getopt('a::m::u::c::b::');

$aplicacion=validarParametroAplicacion($opciones);

$filtrar=false;
if(is_string($opciones['m'])) {
    $filtrar=[$opciones['m']];
} elseif(is_array($opciones['m'])) {
    $filtrar=$opciones['m'];
}

foxtrot::inicializar($opciones['a']);

if($opciones['u']) configuracion::$usuarioBd=$opciones['u'];
if($opciones['c']) configuracion::$contrasenaBd=$opciones['c'];
if($opciones['b']) configuracion::$nombreBd=$opciones['b'];

$bd=foxtrot::obtenerInstanciaBd();

$tablas=[];

$resultado=$bd->consulta('show tables from #__'.configuracion::$nombreBd);
verificarError();
while($fila=$resultado->aArray()) $tablas[]=array_values($fila)[0];

registro('-- '.date('d/m/Y H:i:s').' --'.PHP_EOL
    .'-- Aplicación: '.$opciones['a'].PHP_EOL
    .'-- Base de datos: '.configuracion::$nombreBd);

$clases=[];

foreach(get_declared_classes() as $clase) {
    if(preg_match('/^aplicaciones\\\\'.$aplicacion.'\\\\modelo\\\\.+/',$clase)) {
        $tipo=get_parent_class($clase);
        if($tipo=='modelo'&&(!$filtrar||in_array($nombre,$filtrar))) {
            $creada=procesar($clase);
            if($creada) $clases[]=$clase;
        }
    }
}

//Ejecutar instalar() en los modelos cuyas tablas recién se crearon
foreach($clases as $clase) {
    call_user_func([$clase,'instalar']);
}

function obtenerTipo($campo,$parametros) {
    $tipo=$parametros->tipo;
    $predeterminado=$parametros->predeterminado?'\''.$parametros->predeterminado.'\'':'NULL';

    if($tipo=='texto') return 'text';
    
    if(preg_match('/cadena\(([0-9]+)\)/',$tipo,$coincidencias)) {
        return 'VARCHAR('.$coincidencias[1].') NULL DEFAULT '.$predeterminado;
    }
    
    if(preg_match('/entero(\(([0-9]+)\))?( sin signo)?/',$tipo,$coincidencias)) {
        return 'INT'.
            ($coincidencias[2]?'('.$coincidencias[2].')':'').
            (trim($coincidencias[3])=='sin signo'?' UNSIGNED':'').
            ' NULL DEFAULT '.$predeterminado;
    }

    if(preg_match('/decimal\(([0-9\.,]+)\)( sin signo)?/',$tipo,$coincidencias)) {
        //Admite punto o coma
        $coincidencias[1]=str_replace('.',',',$coincidencias[1]);
        return 'DECIMAL('.$coincidencias[1].')'.
            (trim($coincidencias[2])=='sin signo'?' UNSIGNED':'').
            ' NULL DEFAULT '.$predeterminado;
    }

    if(preg_match('/opcional/',$tipo,$coincidencias)) {
        return 'TINYINT(1) NOT NULL DEFAULT \''.($predeterminado=='1'||$predeterminado=='true'?'1':'0').'\'';
    }

    fwrite(STDERR,'El campo `'.$campo.'` tiene un tipo inválido.'.PHP_EOL.PHP_EOL);
    exit;
}

function compararCampo($parametros,$campoBd) {
    $tipo=$parametros->tipo;

    //Cambió el valor predeterminado
    if($parametros->predeterminado!=$campoBd->Default&&floatval($parametros->predeterminado)!=floatval($campoBd->Default)) return false;

    if($tipo=='texto'&&!preg_match('/text/i',$campoBd->Type)) return false;
    
    if(preg_match('/cadena\(([0-9]+)\)/',$tipo,$coincidencias)&&!preg_match('/varchar\('.$coincidencias[1].'\)/i',$campoBd->Type)) return false;
    
    if(preg_match('/entero(\(([0-9]+)\))?( sin signo)?/',$tipo,$coincidencias)&&(
        !preg_match('/int/i',$campoBd->Type)||
        ($coincidencias[2]&&!preg_match('/\('.$coincidencias[2].'\)/',$campoBd->Type))||
        (trim($coincidencias[3])=='sin signo'&&!preg_match('/unsigned/i',$campoBd->Type))
    )) return false;

    if(preg_match('/decimal\(([0-9]+)\)( sin signo)?/',$tipo,$coincidencias)&&(
        !preg_match('/decimal\('.$coincidencias[2].'\)/i',$campoBd->Type)||
        (trim($coincidencias[2])=='sin signo'&&!preg_match('/unsigned/i',$campoBd->Type))
    )) return false;

    if(preg_match('/opcional/',$tipo,$coincidencias)&&!preg_match('/tinyint/i',$campoBd->Type)) return false;

    return true;
}

function procesar($clase) {
    global $bd,$tablas;

    $creada=false;

    $tabla=configuracion::$prefijoBd.substr($clase,strrpos($clase,'\\')+1);
    
    if(!in_array($tabla,$tablas)) {
        //Crear
        consulta('CREATE TABLE `'.$tabla.'` (`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,`e` TINYINT(3) UNSIGNED NOT NULL DEFAULT \'0\',PRIMARY KEY (`id`),INDEX `e` (`e`))  COLLATE=\'utf8_general_ci\' ENGINE=InnoDB');
        $creada=true;
    }
    
    //Buscar diferencias
    
    $campos=[];
    
    $resultado=$bd->consulta('show fields in '.$tabla);
    verificarError();
    while($fila=$resultado->aObjeto()) $campos[$fila->Field]=$fila;

    $camposEntidad=(new $clase)->obtenerCampos();

    foreach($camposEntidad as $campo=>$parametros) {
        if($campo=='id'||$campo=='e'||$parametros->tipo=='relacional') continue;

        $tipo=obtenerTipo($campo,$parametros);

        if(array_key_exists($campo,$campos)) {
            $campoBd=$campos[$campo];

            if(!compararCampo($parametros,$campos[$campo])) {
                //Modificar columna (solo tipo, no es posible cambio de nombre)
                consulta('ALTER TABLE '.$tabla.' CHANGE COLUMN `'.$campo.'` `'.$campo.'` '.$tipo);
            }

            //Índice
            if($parametros->indice) {
                if(($parametros->indice===true&&$campoBd->Key!='MUL')||($parametros->indice==='unico'&&$campoBd->Key!='UNI')) {
                    if($campoBd->Key) {
                        //Cambio de índice, remover el existente
                        //Asumimos que el índice tiene igual nombre que la columna. De esa forma cualquier otro índice que agregue el usuario manualmente en la base de datos no se vería afectado.
                        consulta('ALTER TABLE '.$tabla.' DROP INDEX `'.$campo.'`');
                    }
                    //Agregar
                    consulta('ALTER TABLE '.$tabla.' ADD '.($parametros->indice==='unico'?'UNIQUE ':'').'INDEX `'.$campo.'` (`'.$campo.'`)');
                }
            } else {
                //TODO Eliminar índice si se remueve @indice
            }
        } else {
            //Agregar columna
            $consulta='ALTER TABLE '.$tabla.' ADD COLUMN `'.$campo.'` '.$tipo;
            if($parametros->indice) $consulta.=',ADD '.($parametros->indice==='unico'?'UNIQUE ':'').'INDEX `'.$campo.'` (`'.$campo.'`)';
            consulta($consulta);
        }
    } 

    return $creada;
}

function consulta($sql) {
    global $bd;
    registro($sql.';');
    $resultado=$bd->consulta($sql);
    verificarError();
    return $resultado;
}

function verificarError() {
    global $bd;
    $error=$bd->obtenerError();
    if($error) {
        fwrite(STDERR,'Error: '.$error.PHP_EOL.PHP_EOL);
        exit;
    }
}

function registro($valor) {  
    file_put_contents(__DIR__.'/sincronizar.sql',$valor.PHP_EOL.PHP_EOL,FILE_APPEND);
}