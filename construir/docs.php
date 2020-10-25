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
//
// La documentación que se genera está destinada al usuario final que consume el API de Foxtrot. Por eso, no se documentan métodos, propiedades o funciones privadas (por
// definición, quien esté accediendo a ellas está modificando la clase y puede ver la documentación en el mismo código fuente), solo se documentan aquellas que el
// usuario pueda necesitar al escribir su aplicación o extender el código de Foxtrot.
//
// Asimismo, se excluyen las propiedades, dado que, normalmente, las deben tener métodos de acceso (las que no lo tengan, están pendientes de agregar), por lo
// que cuando se documenta una variable o una propiedad es para que IDE reconozca el tipo, o para dejar una aclaración para la persona que está trabajando en el código
// fuente, y no es necesario publicarla en la documentación.

define('_wiki',__DIR__.'/../../experimental-foxtrot-framework.wiki/');
define('_salidaPhp',_wiki.'phpdoc/');
define('_salidaJs',_wiki.'/jsdoc/');
define('_excluir',[
    realpath(__DIR__.'/../fuente/servidor/modulos/email/src/'),
    realpath(__DIR__.'/../fuente/cliente/expresion-desarrollo.js')
]);

$clasesPhp=[];
$funcionesPhp=[];
$clasesJs=[];
$funcionesJs=[];
$externosJs=[];
$tiposJs=[];
$procesarDespues=[];

limpiar(_salidaJs);
limpiar(_salidaPhp);
procesarDirectorio(__DIR__.'/../fuente/servidor/');
procesarDirectorio(__DIR__.'/../fuente/cliente/');

//Archivos pospuestos (contenían una referencia que requería esperar hasta el final)
foreach($procesarDespues as $archivo) procesarArchivo($archivo);

crearPaginas(_salidaPhp,'php');
crearPaginas(_salidaJs,'js');

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
            if(preg_match('#^@(.+?)( (.+))?$#',$linea,$etiqueta)) {
                if($ultimaEtiqueta) $etiquetas[]=$ultimaEtiqueta;

                $ultimaEtiqueta=(object)[
                    'etiqueta'=>trim($etiqueta[1]),
                    'comentario'=>trim($etiqueta[3])
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

    //Comentario sin sentencia (encabezado, @typedef, @external)
    if(preg_match_all('#(/\*\*\n(\s*\*.+?\n)+?\s*\*/\n\n)#',$codigo,$coincidencias)) {
        foreach($coincidencias[0] as $coincidencia) {
            $comentarios[]=(object)[
                'sentencia'=>null,
                'bloques'=>procesarComentario($coincidencia)
            ];
        }
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

function procesarParametros($lenguaje,$parametros,$comentario) {
    $s=function($s) {
        return str_replace('|','\\|',$s);
    };

    $buscarReturn=function($bloque) use($lenguaje) {
        $nombre=$lenguaje=='js'?'returns':'return';
        foreach($bloque->etiquetas as $etiqueta) {
            if($etiqueta->etiqueta==$nombre) return 'Devuelve: `'.trim(trim($etiqueta->comentario),'{}').'`'.PHP_EOL.PHP_EOL;
        }
    };

    if(!$parametros) {
        //Sin parámetros, devolver solo el valor de retorno
        return $buscarReturn($comentario->bloques[0]);
    }    

    $salida='';
    
    $parametros=explode(',',$parametros);

    //Analizar (solo php)
    foreach($parametros as $i=>$parametro) {
        $parametros[$i]=(object)[
            'variable'=>trim($parametro),
            'opcional'=>false,
            'predeterminado'=>'',
            'tipo'=>false,
            'descripcion'=>''
        ];
        
        if($lenguaje=='php') {
            $p=strpos($parametro,'=');
            if($p!==false) {
                $parametros[$i]->variable=trim(substr($parametro,0,$p));
                $parametros[$i]->opcional=true;
                $parametros[$i]->predeterminado=trim(substr($parametro,$p+1));
            }
        }
    }

    $miembros=[];

    foreach($comentario->bloques as $i=>$bloque) {
        if(count($comentario->bloques)>1) $salida.='##### Sobrecarga '.($i+1).PHP_EOL;
        $salida.='| Parámetro | Tipo | Descripción | Opcional | Predeterminado |'.PHP_EOL.'|--|--|--|--|--|'.PHP_EOL;

        //Buscar @var/@param
        foreach($bloque->etiquetas as $etiqueta) {
            if($lenguaje=='php') {
                if($etiqueta->etiqueta=='var'&&preg_match('/^(.+?) (\$.+?)( (.+?))$/',$etiqueta->comentario,$coincidencia2)) {
                    $variable=trim($coincidencia2[2]);
                    foreach($parametros as $parametro) {
                        if($variable==$parametro->variable) {
                            $parametro->tipo=$coincidencia2[1];
                            $parametro->descripcion=$coincidencia2[4];
                        }
                    }
                }
            } elseif($lenguaje=='js') {
                //En js, la información sobre si es opcional y el valor predeterminado están en los comentarios
                if($etiqueta->etiqueta=='param'&&preg_match('/^\{(.+?)\} (\[.+?=.+=\]|\[.+?\]|.+?)( - (.+?))$/',$etiqueta->comentario,$coincidencia2)) {
                    $tipo=trim($coincidencia2[1],'{}');
                    $descripcion=$coincidencia2[4];
                    $opcional=false;
                    $predeterminado=null;

                    $nombre=$coincidencia2[2];
                    if(substr($nombre,0,1)=='[') {
                        $opcional=true;
                        $nombre=trim($nombre,'[]');
                    }

                    $p=strpos($nombre,'=');
                    if($p!==false) {
                        $predeterminado=trim(substr($nombre,$p+1));
                        $nombre=trim(substr($nombre,0,$p));
                    }

                    $miembroDe=null;
                    $p=strpos($nombre,'.');
                    if($p!==false) {
                        $miembroDe=trim(substr($nombre,0,$p));
                        $nombre=trim(substr($nombre,$p+1));
                    }

                    if($miembroDe) {
                        //parametro.propiedad => Agregar a $miembros
                        if(!is_array($miembros[$miembroDe])) $miembros[$miembroDe]=[];
                        $miembros[$miembroDe][]=(object)[
                            'variable'=>trim($nombre),
                            'opcional'=>$opcional,
                            'predeterminado'=>$predeterminado,
                            'tipo'=>$tipo,
                            'descripcion'=>$descripcion
                        ];
                        continue;
                    } else {
                        //Actualizar parámetro
                        foreach($parametros as $parametro) {
                            if($nombre==$parametro->variable) {
                                $parametro->tipo=$tipo;
                                $parametro->descripcion=$descripcion;
                                $parametro->opcional=$opcional;
                                $parametro->predeterminado=$predeterminado;
                            }
                        }
                    }
                }
            }
        }

        foreach($parametros as $parametro) {
            $salida.='| `'.$s($parametro->variable).'` | '.($parametro->tipo?'`'.$s($parametro->tipo).'`':'').' | '.$s($parametro->descripcion).' | '.$s(($parametro->opcional?'Si':'')).' | '.($parametro->predeterminado?'`'.$s($parametro->predeterminado).'`':'').' |'.PHP_EOL;
        }

        //Miembros
        foreach($miembros as $parametro=>$parametros) {
            $salida.='##### Propiedades de `'.$parametro.'`'.PHP_EOL;
            $salida.='| Propiedad | Tipo | Descripción | Opcional | Predeterminado |'.PHP_EOL.'|--|--|--|--|--|'.PHP_EOL;

            foreach($parametros as $parametro) {
                $salida.='| `'.$s($parametro->variable).'` | '.($parametro->tipo?'`'.$s($parametro->tipo).'`':'').' | '.$s($parametro->descripcion).' | '.$s(($parametro->opcional?'Si':'')).' | '.($parametro->predeterminado?'`'.$s($parametro->predeterminado).'`':'').' |'.PHP_EOL;
            }
        }
        
        //Buscar @return/@returns de este bloque
        $salida.=PHP_EOL.$buscarReturn($bloque);
    }

    return $salida;
}

function procesarPhp($archivo,$comentarios) {
    global $clasesPhp,$funcionesPhp;

    $codigo=file_get_contents($archivo);

    $espacio=null;
    $clase=null;
    $extiende=null;
    $descripcionArchivo=null;

    //Buscar namespace
    if(preg_match('/namespace (.+?);/',$codigo,$coincidencia)) $espacio=$coincidencia[1];

    //Primer comentario = descripción del archivo
    if(!$comentarios[0]->sentencia) $descripcionArchivo=array_shift($comentarios);

    foreach($comentarios as $comentario) {
        if(!$comentario->sentencia) continue;

        //Buscar @ignore
        $ignorar=false;
        foreach($comentario->bloques[0]->etiquetas as $etiqueta) {
            if($etiqueta->etiqueta=='ignore') {
                $ignorar=true;
                break;
            }
        }
        if($ignorar) continue;

        if(preg_match('/class (.+?)( extends (.+?))? {/',$comentario->sentencia,$coincidencia)) {
            $clase=nombreObjeto($espacio,$coincidencia[1]);
            if(count($coincidencia)==4) $extiende=nombreObjeto($espacio,$coincidencia[3]);

            $salida='### `'.$clase.'`'.PHP_EOL;
            $salida.=$comentario->bloques[0]->comentario.PHP_EOL.PHP_EOL;
            if($extiende) $salida.='Extiende: [`'.$extiende.'`]('.enlace('phpdoc',$extiende).')'.PHP_EOL.PHP_EOL;

            $clasesPhp[$clase]=(object)[
                'encabezado'=>$salida,
                'metodos'=>[],
                'propiedades'=>[]
            ];
        } elseif(preg_match('/(public |private | protected )?(static )?function (.+?)\s*?\((.*?)\) {/',$comentario->sentencia,$coincidencia)) {
            if(trim($coincidencia[1])!='private') { //No documentamos privadas
                $modificadores=[];
                $salida='#### `'.trim($coincidencia[3]).'`';
                if(trim($coincidencia[1])=='protected') $modificadores[]='protegido';
                if(trim($coincidencia[2])=='static') $modificadores[]='estático';
                if(count($modificadores)) $salida.=' ('.implode(', ',$modificadores).')';
                $salida.=PHP_EOL.$comentario->bloques[0]->comentario.PHP_EOL.PHP_EOL;

                //Parámetros y retorno
                $salida.=procesarParametros('php',trim($coincidencia[4]),$comentario);

                if($clase) {
                    $clasesPhp[$clase]->metodos[]=$salida;
                } else {
                    $funcionesPhp[]=$salida;
                }
            }
        }
        //TODO Variables globales, propiedades
    }
}

function procesarJs($archivo,$comentarios) {
    global $clasesJs,$funcionesJs,$tiposJs,$externosJs,$procesarDespues;

    $codigo=file_get_contents($archivo);

    $clase=null;
    $descripcionArchivo=null;

    //Primer comentario = descripción del archivo
    if(!$comentarios[0]->sentencia) $descripcionArchivo=array_shift($comentarios);

    //Buscar @typedef y @external
    foreach($comentarios as $i=>$comentario) {
        if($comentario->sentencia) continue;
        if($comentario->bloques[0]->etiquetas[0]->etiqueta=='typedef') {
            if(preg_match('/\{(.+?)\}(.+)?$/m',$comentario->bloques[0]->etiquetas[0]->comentario,$coincidencia)) {
                $tipo=$coincidencia[1];
                $comentario=trim($coincidencia[2]);
                $tiposJs[$tipo]='### `'.$tipo.'`'.PHP_EOL.$comentario.PHP_EOL.PHP_EOL;
            }
        } elseif($comentario->bloques[0]->etiquetas[0]->etiqueta=='external') {
            $tipo=trim($comentario->bloques[0]->etiquetas[0]->comentario);
            if(!array_key_exists($tipo,$externosJs)) {
                $externosJs[$tipo]=(object)[
                    'encabezado'=>'### `'.$tipo.'`'.PHP_EOL.'Métodos y propiedades añadidos al prototipo de `'.$tipo.'`.'.PHP_EOL.PHP_EOL,
                    'metodos'=>[],
                    'propiedades'=>[]
                ];
            }
        }
    }

    foreach($comentarios as $comentario) {
        if(!$comentario->sentencia) continue;

        //Buscar @class, @extends, @ignore, @memberof, @private
        $ignorar=false;
        $esClase=null;
        $miembroDe=null;
        $extiende=null;
        foreach($comentario->bloques[0]->etiquetas as $etiqueta) {
            if($etiqueta->etiqueta=='ignore'||$etiqueta->etiqueta=='private') {
                $ignorar=true;
                break;
            } elseif($etiqueta->etiqueta=='class') {
                $esClase=true;
            } elseif($etiqueta->etiqueta=='extends') {
                $extiende=$etiqueta->comentario;
            } elseif($etiqueta->etiqueta=='memberof') {
                $miembroDe=$etiqueta->comentario;
            }
        }
        if($ignorar) continue;

        if($esClase) {
            if(preg_match('/var (.+?)=(new )?function\s*?\((.*?)\)/',$comentario->sentencia,$coincidencia)) {
                $clase=trim($coincidencia[1]);
                $parametros=trim($coincidencia[3]);
            } elseif(preg_match('/function (.+?)\s*?\((.*?)\)/',$comentario->sentencia,$coincidencia)) {
                $clase=trim($coincidencia[1]);
                $parametros=trim($coincidencia[2]);
            } else {
                continue;
            }

            $salida='### `'.$clase.'`'.PHP_EOL;
            $salida.=$comentario->bloques[0]->comentario.PHP_EOL.PHP_EOL;
            if($extiende) $salida.='Extiende: [`'.$extiende.'`]('.enlace('jsdoc',$extiende).')'.PHP_EOL.PHP_EOL;

            if($parametros) $salida.='##### Parámetros del constructor'.PHP_EOL.PHP_EOL.procesarParametros('js',$parametros,$comentario).PHP_EOL;
            
            $clasesJs[$clase]=(object)[
                'encabezado'=>$salida,
                'metodos'=>[],
                'propiedades'=>[]
            ];

            //Crear tipo automáticamente
            if(!array_key_exists($clase,$tiposJs)) $tiposJs[$clase]='### `'.$clase.'` \*'.PHP_EOL.$comentario->bloques[0]->comentario.PHP_EOL.PHP_EOL;
        } else {
            $salida='';

            //Solo tomamos propiedades o funciones globales
            if(preg_match('/(this|.+?\.prototype|.+?)\.(.+?)=function\s*?\((.*?)\)/',$comentario->sentencia,$coincidencia)) {
                $nombre=$coincidencia[2];
                $parametros=$coincidencia[3];
            } elseif(preg_match('/function (.+?)\s*?\((.*?)\)/',$comentario->sentencia,$coincidencia)) {
                if($clase) continue;
                $nombre=$coincidencia[1];
                $parametros=$coincidencia[2];
            } else {
                continue;
            }

            $salida='#### `'.trim($nombre).'`';
            $salida.=PHP_EOL.$comentario->bloques[0]->comentario.PHP_EOL.PHP_EOL;

            //Parámetros y retorno
            $salida.=procesarParametros('js',$parametros,$comentario);

            if($miembroDe) {
                if(substr($miembroDe,0,9)=='external:') {
                    $externo=substr($miembroDe,9);
                    $externosJs[$externo]->metodos[]=$salida;
                } else {
                    if(!array_key_exists($miembroDe,$clasesJs)) {
                        //La clase todavía no existe, esperar hasta el final
                        $procesarDespues[]=$archivo;
                        return;
                    }
                    $clasesJs[$miembroDe]->metodos[]=$salida;
                }
            } elseif($clase) {
                $clasesJs[$clase]->metodos[]=$salida;
            } else {
                $funcionesJs[]=$salida;
            }
        }

        //TODO Variables globales, propiedades (que no sean función)
        //TODO @enum
    }
}

function crearPaginas($rutaSalida,$lenguaje) {
    global $clasesPhp,$funcionesPhp,$clasesJs,$externosJs,$tiposJs,$funcionesJs;

    $indice=[];
    $indiceExternos=[];

    //Clases

    if($lenguaje=='php') {
        $clases=$clasesPhp;
    } elseif($lenguaje=='js') {
        $clases=$clasesJs;
    }
    foreach($clases as $nombre=>$clase) {
        $archivo=enlace($lenguaje.'doc',$nombre);
        $indice[$nombre]=$archivo;

        $salida=$clase->encabezado;
        if($clase->metodos) $salida.='### Métodos'.PHP_EOL.PHP_EOL.implode('',$clase->metodos);
        if($clase->propiedades) $salida.='### Propiedades'.PHP_EOL.PHP_EOL.implode('',$clase->propiedades);

        file_put_contents($rutaSalida.$archivo.'.md',$salida);
    }

    //Funciones

    if($lenguaje=='php') {
        $funciones=$funcionesPhp;
    } elseif($lenguaje=='js') {
        $funciones=$funcionesJs;
    }

    $salida='## Funciones globales ('.strtoupper($lenguaje).')'.PHP_EOL.PHP_EOL;
    foreach($funciones as $funcion) $salida.=$funcion;

    file_put_contents($rutaSalida.$lenguaje.'doc-funciones.md',$salida);

    if($lenguaje=='js') {
        //Externos

        foreach($externosJs as $nombre=>$clase) {
            $archivo=enlace('jsdoc',$nombre);
            $indiceExternos[$nombre]=$archivo;
    
            $salida=$clase->encabezado;
            if($clase->metodos) $salida.='### Métodos'.PHP_EOL.PHP_EOL.implode('',$clase->metodos);
            if($clase->propiedades) $salida.='### Propiedades'.PHP_EOL.PHP_EOL.implode('',$clase->propiedades);
    
            file_put_contents($rutaSalida.$archivo.'.md',$salida);
        }

        //Tipos
        
        $salida='## Tipos (JS)'.PHP_EOL.PHP_EOL;
        foreach($tiposJs as $tipo) $salida.=$tipo;

        $salida.=PHP_EOL.'*\* Tipo definido por una clase (ver documentación en la página de la misma).*';

        file_put_contents($rutaSalida.'jsdoc-tipos.md',$salida);
    }

    //Índice
    
    $salida='## Documentación '.strtoupper($lenguaje).PHP_EOL.PHP_EOL;

    $salida.='- [Funciones globales]('.$lenguaje.'doc-funciones)'.PHP_EOL;
    if($lenguaje=='js') $salida.='- [Tipos](jsdoc-tipos)'.PHP_EOL;
    
    $salida.=PHP_EOL.'#### Clases'.PHP_EOL;
    ksort($indice);
    foreach($indice as $nombre=>$ruta) {
        $salida.='- [`'.$nombre.'`]('.$ruta.')'.PHP_EOL;
    }

    if($lenguaje=='js') {
        $salida.=PHP_EOL.'#### Externos'.PHP_EOL;
        ksort($indiceExternos);
        foreach($indiceExternos as $nombre=>$ruta) $salida.='- [`'.$nombre.'`]('.enlace('jsdoc','externo-'.$nombre).')'.PHP_EOL;
    }

    $salida.=PHP_EOL.PHP_EOL.'*Autogenerado por el script de documentación de Foxtrot el '.
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
    return $prefijo.'-'.trim(preg_replace('/[^a-zA-Z0-9]+/','-',trim($nombre)),'-');
}