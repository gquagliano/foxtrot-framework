<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Funciones útiles para la construcción del framework

//TODO Muchas de estas funciones son de PRUEBA y se deben reemplazar por implementaciones más adecuadas y mejor escritas. Además, se deben documentar.

defined('_inc') or exit;

chdir(__DIR__);
define('_closure','java -jar '.escapeshellarg(realpath(__DIR__.'/closure-compiler-v20200517.jar')));

function iniciarRegistroExec() {
    //Registro para depuración
    $registro=__DIR__.'/../desarrollo/exec.log';
    if(PHP_OS_FAMILY=='Windows') {
        $path=shell_exec('echo %PATH%');
        $cordova_home=shell_exec('echo %CORDOVA_HOME%');
        $home_var='USERPROFILE';  
        $home=shell_exec('echo %USERPROFILE%');
        $android=shell_exec('echo %ANDROID_SDK_ROOT%');
        $java=shell_exec('echo %JAVA_HOME%');
    } else {
        $path=shell_exec('echo $PATH');
        $cordova_home=shell_exec('echo $CORDOVA_HOME');
        $home_var='HOME';
        $home=shell_exec('echo $HOME');
        $android=shell_exec('echo $ANDROID_SDK_ROOT');
        $java=shell_exec('echo $JAVA_HOME');
    }
    $usuario=shell_exec('whoami');
    file_put_contents($registro,'# '.date('d/m/Y H:i:s').PHP_EOL.
        '# CWD = '.getcwd().PHP_EOL.
        '# Usuario = '.trim($usuario).PHP_EOL.
        '# PATH = '.trim($path).PHP_EOL.
        '# CORDOVA_HOME = '.trim($cordova_home).PHP_EOL.
        '# '.$home_var.' = '.trim($home).PHP_EOL.
        '# ANDROID_SDK_ROOT = '.trim($android).PHP_EOL.
        '# JAVA_HOME = '.trim($java).PHP_EOL.PHP_EOL
    ,FILE_APPEND);   
}

function registroExec($comando,$respuesta) {
    //Registro para depuración
    file_put_contents(__DIR__.'/../desarrollo/exec.log','# '.$comando.PHP_EOL.trim($respuesta).PHP_EOL.PHP_EOL,FILE_APPEND);
}

function ejecutar($comando,$argumentos,$esperarSalida=true) {
    if($esperarSalida)
        return shell_exec($comando.' '.$argumentos);
    
    if(PHP_OS_FAMILY==='Windows') {
        $dir=trim(getcwd(),'\\/');
        chdir(__DIR__);
        exec('start ejecutar.exe '.escapeshellarg($dir).' '.escapeshellarg($comando).' '.escapeshellarg($argumentos).' gabriel lupe 2>&1');
        chdir($dir);
        return null;
    }

    if(substr(trim($argumentos),-1)!='&') $argumentos.='&';
    shell_exec($comando.' '.$argumentos);
    return null;
}

function copiar($ruta,$filtro,$destino,$rec=true,$excluir=null) {
    if(is_array($filtro)) {
        foreach($filtro as $f) copiar($ruta,$f,$destino,$rec,$excluir);
        return;
    }

    if(!$filtro) $filtro='{,.}*';
    
    if(!file_exists($destino)) mkdir($destino,0755,true);

    $arr=glob($ruta.$filtro,GLOB_BRACE);

    if($rec) $arr=array_merge($arr,glob($ruta.'*',GLOB_ONLYDIR));
    $arr=array_unique($arr);

    foreach($arr as $archivo) {
        $nombre=basename($archivo);
        if($nombre=='.'||$nombre=='..') continue;
        if($excluir&&in_array(realpath($archivo),$excluir)) continue;
        if(is_dir($archivo)) {
            if($rec) copiar($archivo.'/',$filtro,$destino.$nombre.'/',true,$excluir);
        } else {
            copy($archivo,$destino.$nombre);
        }
    }
}

function buscarArchivos($ruta,$filtro,$funcion=null,$rec=true,$incluirIgnorados=false,$incluirDirectorios=false) {
    clearstatcache();
    $res=[];

    if(!$incluirIgnorados&&file_exists($ruta.'.ignorar')) return $res;

    $arr=glob($ruta.$filtro,GLOB_BRACE);
    $arr=array_merge($arr,glob($ruta.'*',GLOB_ONLYDIR));
    $arr=array_unique($arr);
    foreach($arr as $archivo) {
        $archivo=basename($archivo);
        if($archivo=='.'||$archivo=='..') continue;
        if(is_dir($ruta.$archivo)) {
            $dir=$ruta.$archivo.'/';
            if($rec) $res=array_merge($res,buscarArchivos($dir,$filtro,$funcion,true,$incluirIgnorados,$incluirDirectorios));
            //Incluir el directorio en sí, no solo su contenido
            if($incluirDirectorios) {
                $res[]=$dir;
                if($funcion) call_user_func($funcion,$dir);
            }
        } else {
            $res[]=$ruta.$archivo;
            if($funcion) call_user_func($funcion,$ruta.$archivo);
        }
    }

    return $res;
}

function eliminarTodo($lista) {
    clearstatcache();
    foreach($lista as $ruta) {
        //Mantener .gitignore
        if(preg_match('/\.gitignore$/',$ruta)) continue;
        if(is_file($ruta)) unlink($ruta);
    }
    rsort($lista);
    foreach($lista as $ruta) {
        if(is_dir($ruta)&&!count(array_diff(scandir($ruta),['..', '.']))) rmdir($ruta);
    }
}

function compilarFoxtrotJs($destino,$omitirClosure,$omitirModulos=false) {
    $archivos=[
        _fuente.'cliente/util.js',
        _fuente.'cliente/dom.js',
        _fuente.'cliente/ui.js',
        _fuente.'cliente/arrastra.js',
        _fuente.'cliente/editable.js',
        _fuente.'cliente/servidor.js',
        _fuente.'cliente/sesion.js',
        _fuente.'cliente/ajax.js',
        _fuente.'cliente/aplicacion.js',
        _fuente.'cliente/componente.js',
        _fuente.'cliente/controlador.js',
        _fuente.'cliente/modulo.js',
        _fuente.'cliente/enrutador.js',
        _fuente.'cliente/ui.animaciones.js',
        _fuente.'cliente/ui.menu.js',
        _fuente.'cliente/ui.dialogos.js',
        _fuente.'cliente/expresion.js',
        _fuente.'cliente/idioma.js',
        _fuente.'cliente/componentes/soporte/**.js',
        _fuente.'cliente/componentes/**.js', //TODO Debemos definir el orden de los componentes, ya que actualmente se representan en el editor en orden de inclusión, sobre lo cual aquí no tenemos control
        _fuente.'cliente/enrutadores/**.js',
        _fuente.'cliente/idiomas/**.js' //TODO Debemos poder limitar qué idiomas incluir
    ];
    if(!$omitirModulos) {
        //Integrar todos los módulos
        $archivos=array_merge($archivos,buscarArchivos(_fuente.'cliente/modulos/','*.js'));
    }
    formato::compilarJs($archivos,$destino,!$omitirClosure);
}

function eliminarDir($ruta,$preservarIgnorados=false) {
    if(is_dir($ruta)) {
        if(substr($ruta,-1)!=DIRECTORY_SEPARATOR) $ruta.=DIRECTORY_SEPARATOR;
        if(file_exists($ruta.'.ignorar')) return;        
        $archivos=glob($ruta.'*');
        foreach($archivos as $archivo) eliminarDir($archivo,$preservarIgnorados);
        $archivos=glob($ruta.'*');
        if(!count($archivos)) rmdir($ruta);
    } elseif(file_exists($ruta)) {
        unlink($ruta);
    }
}
