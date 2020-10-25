<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */


// Script para generar la documentación PHP y JS en formato MD
// -----------------------------------------------------------
// phpdoc y jsdoc son muy complejos para lo que necesitamos, además los plug-ins o versiones con salida en formato MD no han dado buenas resultados,
// por lo que se implementa un pequeño intérprete de comentarios de documentación compatible con los elementos que se usan en el código de Foxtrot.

define('_wiki',__DIR__.'/../../experimental-foxtrot-framework.wiki/');
define('_salidaPhp',_wiki.'phpdoc/');
define('_salidaJs',_wiki.'/jsdoc/');
define('_excluir',[
    realpath(__DIR__.'/../fuente/servidor/modulos/email/src/'),
    realpath(__DIR__.'/../fuente/cliente/expresion-desarrollo.js')
]);

$procesarDespues=[];
$indiceJs=[];
$indiceTiposJs=[];
$indiceExternosJs=[];
$indicePhp=[];

limpiar(_salidaJs);
limpiar(_salidaPhp);
procesarDirectorio(__DIR__.'/../fuente/servidor/');
procesarDirectorio(__DIR__.'/../fuente/cliente/');
crearIndice(_salidaPhp,'php');
crearIndice(_salidaJs,'js');

function limpiar($ruta) {
    $archivos=glob($ruta.'*.md');
    foreach($archivos as $archivo) unlink($archivo);
}

function procesarDirectorio($dir) {
    $archivos=glob($dir.'*');
    foreach($archivos as $archivo) {
        if(in_array(realpath($archivo),_excluir)) continue;
        if(is_dir($archivo)) procesarDirectorio($archivo.'/');
        $info=pathinfo($archivo);
        if($info['extension']=='js'||$info['extension']=='php') procesarArchivo($archivo);
    }
}

function procesarComentario($codigo) {
    $bloques=[];

    //Extaer múltiples comentarios para una misma sentencia (sobrecarga)
    preg_match_all('#(/\*\*\n(\s*\*.+?\n)+?\s*\*/)#',$codigo,$coincidencias);
    foreach($coincidencias[0] as $bloque) {
        $comentario='';
        $etiquetas=[];

        $ultimaEtiqueta=null;

        //Limpiar y procesar líneas
        preg_match_all('#(\s*\* (.+?)\n)#',$bloque,$lineas);              
        foreach($lineas[2] as $linea) {
            if(preg_match('#^@(.+?) (.+)#',$linea,$etiqueta)) {
                if($ultimaEtiqueta) $etiquetas[]=$ultimaEtiqueta;

                $ultimaEtiqueta=(object)[
                    'etiqueta'=>$etiqueta[1],
                    'comentario'=>trim($etiqueta[2])
                ];
            } elseif($ultimaEtiqueta) {
                //Una línea sin etiqueta, asumir continuación de la última etiqueta
                $ultimaEtiqueta->comentario.="\n".trim($linea);
            } else {
                //Líneas antes de la primer etiqueta, anexar a $comentario
                $comentario.=($comentario?"\n":'').trim($linea);
            }
        }
        if($ultimaEtiqueta) $etiquetas[]=$ultimaEtiqueta;

        $bloques[]=(object)[
            'comentario'=>$comentario,
            'etiquetas'=>$etiquetas
        ];
    }

    return $bloques;
}

function procesarArchivo($ruta) {
    $info=pathinfo($ruta);
    $lenguaje=$info['extension'];
    $codigo=file_get_contents($ruta);
    
    $codigo=str_replace("\r\n","\n",$codigo);

    $comentarios=[];

    //Primer comentario (encabezado)
    if(preg_match('#(/\*\*\n(\s*\*.+?\n)+?\s*\*/\n)#',$codigo,$coincidencia)) {
        $comentarios[]=(object)[
            'sentencia'=>null,
            'bloques'=>procesarComentario($coincidencia[1])
        ];
    }

    if(preg_match_all('#(/\*\*\n(\s*\*.+?\n)+?\s*\*/\n)+?(.+?\n)#',$codigo,$coincidencias)) {    
        foreach($coincidencias[0] as $i=>$coincidencia) {
            $comentarios[]=(object)[
                'sentencia'=>$coincidencias[3][$i],
                'bloques'=>procesarComentario($coincidencia)
            ];
        }
    }

    if(!count($comentarios)) return;
    
    if($lenguaje=='php') {
        procesarPhp($ruta,$comentarios);
    } elseif($lenguaje=='js') {
        procesarJs($ruta,$comentarios);
    }
}

function procesarPhp($archivo,$comentarios) {
    global $indicePhp;

    $salida='';
    $salidaFunciones='';
    $salidaVariables='';

    $codigo=file_get_contents($archivo);

    $espacio=null;
    $clase=null;
    $extiende=null;
    $descripcionArchivo=null;

    if(preg_match('/namespace (.+?);/',$codigo,$coincidencia)) $espacio=$coincidencia[1];

    if(!$comentarios[0]->sentencia) $descripcionArchivo=array_shift($comentarios);

    foreach($comentarios as $comentario) {
        if(preg_match('/class (.+?)( extends (.+?))? {/',$comentario->sentencia,$coincidencia)) {
            $clase=nombreObjeto($espacio,$coincidencia[1]);
            if(count($coincidencia)==4) $extiende=nombreObjeto($espacio,$coincidencia[3]);

            $salida.='## `'.$clase.'`'.PHP_EOL;
            $salida.=$comentario->bloques[0]->comentario.PHP_EOL;
            if($extiende) $salida.='Extiende: [`'.$extiende.'`]('.enlace('phpdoc',$extiende).')'.PHP_EOL;
            $salida.=PHP_EOL;
        } elseif(preg_match('/(public |private | protected )?(static )?function (.+?)\((.*?)\) {/',$comentario->sentencia,$coincidencia)) {
            if($coincidencia[1]!='private ') {
                $modificadores=[];
                $salidaFunciones.='### `'.$coincidencia[3].'`';
                if($coincidencia[1]=='protected ') $modificadores[]='protegido';
                if($coincidencia[2]=='static ') $modificadores[]='estático';
                if(count($modificadores)) $salidaFunciones.=' ('.implode(', ',$modificadores).')';
                $salidaFunciones.=PHP_EOL.$comentario->bloques[0]->comentario.PHP_EOL.PHP_EOL;

                if(trim($coincidencia[4])) {
                    //Procesar parámetros
                    $parametros=explode(',',$coincidencia[4]);
                    foreach($parametros as $i=>$parametro) {
                        $p=strpos($parametro,'=');
                        if($p===false) {
                            $parametros[$i]=(object)[
                                'variable'=>trim($parametro),
                                'opcional'=>false
                            ];
                        } else {
                            $parametros[$i]=(object)[
                                'variable'=>trim(substr($parametro,0,$p)),
                                'opcional'=>true,
                                'predeterminado'=>trim(substr($parametro,$p+1))
                            ];
                        }
                    }

                    foreach($comentario->bloques as $i=>$bloque) {
                        if(count($comentario->bloques)>1) $salidaFunciones.=PHP_EOL.'#### Sobrecarga '.($i+1).PHP_EOL;
                        $salidaFunciones.='| Parámetro | Tipo | Descripción | Opcional | Valor predeterminado |'.PHP_EOL.'|--|--|--|--|--|'.PHP_EOL;

                        foreach($parametros as $j=>$parametro) {
                            $var=null;

                            //Buscar @var
                            foreach($bloque->etiquetas as $etiqueta) {
                                if($etiqueta->etiqueta=='var'&&preg_match('/^(.+?) (\$.+?)( (.+?))$/',$etiqueta->comentario,$coincidencia2)&&trim($coincidencia2[2])==$parametro->variable) {
                                    $var=(object)[
                                        'tipo'=>$coincidencia2[1],
                                        'descripcion'=>$coincidencia2[4]
                                    ];
                                }
                            }

                            $salidaFunciones.='| '.$parametro->variable.' | '.($var?$var->tipo:'').' | '.($var?$var->descripcion:'').' | '.($parametro->opcional?'Si':'').' | '.$parametro->predeterminado.' |'.PHP_EOL;
                        }
                    }
                    $salidaFunciones.=PHP_EOL;
                }
            }
        }
        //TODO Variables, propiedades
        //Hoy, normalmente, las propiedades deben tener métodos de acceso (las que no lo tengan, están pendientes de agregar), por lo que cuando se documenta una variable
        //o una propiedad es para que IDE reconozca el tipo o para dejar una aclaración para la persona que está trabajando en el código fuente (puede leer la documentación en
        //el mismo archivo que está editando), pero no es necesario publicarla en la documentación para el usuario que implementa el API.
    }

    if($clase) {
        $rutaSalida=_salidaPhp.enlace('phpdoc',$clase);
        $indicePhp[$clase]=$rutaSalida;

        if($salidaFunciones) $salida.='### Métodos'.PHP_EOL.PHP_EOL.$salidaFunciones;
        if($salidaVariables) $salida.='### Propiedades'.PHP_EOL.PHP_EOL.$salidaVariables;
    } else {
        $rutaSalida=_salidaPhp.'phpdoc-funciones.md';
        if(!array_key_exists('funciones',$indicePhp)) $indicePhp['funciones']=$rutaSalida;

        if(!file_exists($rutaSalida)) $salida='## Funciones globales'.PHP_EOL.PHP_EOL.$salida;
        $salida.=$salidaFunciones;
    }
    file_put_contents($rutaSalida,$salida,FILE_APPEND);
}

function procesarJs($archivo,$comentarios,$final=false) {
    global $procesarDespues,$indiceJs,$indiceTiposJs,$indiceExternosJs;

    
}

function crearIndice($rutaSalida,$lenguaje) {
    global $indicePhp,$indiceJs,$indiceExternosJs,$indiceTiposJs;
    
    $salida='## Documentación '.strtoupper($lenguaje).PHP_EOL.PHP_EOL;

    if($lenguaje=='php') {
        $listado=$indicePhp;
    } elseif($lenguaje=='js') {
        $listado=$indiceJs;
    }
    ksort($listado);
    foreach($listado as $nombre=>$ruta) {
        if($nombre=='funciones') {
            $salida.='- [Funciones globales](funciones.md)'.PHP_EOL;
        } else {
            $salida.='- [`'.$nombre.'`]('.enlace($lenguaje.'doc',$nombre).')'.PHP_EOL;
        }
    }

    if($lenguaje=='js') {
        if(count($indiceExternosJs)) {
            $salida.=PHP_EOL.'### Externos'.PHP_EOL;
            ksort($indiceExternosJs);
            foreach($indiceExternosJs as $nombre=>$ruta) $salida.='- [`'.$nombre.'`]('.enlace('jsdoc','externo-'.$nombre).')'.PHP_EOL;
        }
        if(count($indiceTiposJs)) {
            $salida.=PHP_EOL.'### Tipos'.PHP_EOL;
            ksort($indiceTiposJs);
            foreach($indiceTiposJs as $nombre=>$ruta) $salida.='- [`'.$nombre.'`]('.enlace('jsdoc','tipo-'.$nombre).')'.PHP_EOL;
        }
    }

    $salida.=PHP_EOL.'*Autogenerado por el script de documentación de Foxtrot el '.
        str_replace(
            ['January','February','March','April','May','June','July','August','September','October','November','December'],
            ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
            date('j \d\e F \d\e Y')
        ).'*';

    file_put_contents($rutaSalida.$lenguaje.'doc-indice.md',$salida);
}

function nombreObjeto($espacio,$nombre) {
    //Nombre absoluto
    if(substr($nombre,0,1)=='\\') return $nombre;
    //Nombre relativo al aspacio actual
    if(substr($espacio,0,1)!='\\') $espacio='\\'.$espacio;
    if(substr($espacio,-1)!='\\') $espacio.='\\';
    return $espacio.$nombre;
}

function enlace($prefijo,$nombre) {
    return $prefijo.'-'.trim(preg_replace('/[^a-zA-Z0-9]+/','-',trim($nombre)),'-').'.md';
}