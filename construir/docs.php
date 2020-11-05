<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */


// Script para generar la documentación PHP y JS en formato MD
// -----------------------------------------------------------
// phpdoc y jsdoc son muy *pesados* para lo que necesitamos, además los plug-ins o versiones con salida en formato MD no han dado buenos resultados,
// por lo que se implementa a continuación un pequeño intérprete de comentarios de documentación compatible con los elementos que se usan en el código de Foxtrot.
//
// La documentación que se genera está destinada al usuario final que consume el API de Foxtrot. Por eso, no se documentan métodos, propiedades o funciones privadas (por
// definición, quien esté accediendo a ellas está modificando la clase y puede ver la documentación en el mismo código fuente), solo se documentan aquellas que el
// usuario pueda necesitar al escribir su aplicación o extender el código de Foxtrot.
//
// Asimismo, se excluyen variables y aquellas propiedades que no sean de interés para el usuario deben deben ocultarse con @ignore. Normalmente, las mismas propiedades
// deben tener métodos de acceso (las que no lo tengan, están pendientes de agregar) y se documentan, al igual que las variables, para que IDE reconozca el tipo, o para la
// persona que está trabajando en el código fuente de Foxtrot.

define('_wiki',__DIR__.'/../../experimental-foxtrot-framework.wiki/');
define('_salidaPhp',_wiki.'phpdoc/');
define('_salidaJs',_wiki.'/jsdoc/');
define('_excluir',[
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
    if(file_exists($dir.'.ignorar')) return;
    $archivos=glob($dir.'*');
    foreach($archivos as $archivo) {
        if(in_array(realpath($archivo),_excluir)) continue;
        if(is_dir($archivo)) procesarDirectorio($archivo.'/');
        $info=pathinfo($archivo);
        if($info['extension']=='js'||$info['extension']=='php') procesarArchivo($archivo);
    }
}

function triml($cadena) {
    return preg_replace('/^[\s]/','',$cadena);
}

function procesarComentario($codigo) {
    $bloques=[];
    
    //Extaer múltiples comentarios para una misma sentencia (sobrecarga)
    preg_match_all('#(/\*\*(.+?)\*/)#s',$codigo,$coincidencias);
    foreach($coincidencias[2] as $bloque) {
        $comentario='';
        $etiquetas=[];

        $ultimaEtiqueta=null;

        //Limpiar y procesar líneas
        $bloque=trim($bloque);
        preg_match_all('#[ \t]*\*?([^\r\n]*)[\r\n]?#s',$bloque,$lineas);              
        foreach($lineas[1] as $linea) {
            $linea=triml($linea);
            if(!trim($linea)) continue;
            if(preg_match('#^@(.+?)( (.+))?$#',$linea,$etiqueta)) {
                if($ultimaEtiqueta) $etiquetas[]=$ultimaEtiqueta;

                $ultimaEtiqueta=(object)[
                    'etiqueta'=>trim($etiqueta[1]),
                    'comentario'=>$etiqueta[3]
                ];
            } elseif($ultimaEtiqueta) {
                //Una línea sin etiqueta, asumir continuación de la última etiqueta
                $ultimaEtiqueta->comentario.="\n".$linea;
            } else {
                //Líneas antes de la primer etiqueta, anexar a $comentario
                $comentario.=($comentario?"\n":'').$linea;
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

    $comentarios=[];

    $enCadena=false;
    $enComentario=false;
    $enExpresion=false;
    $long=strlen($codigo);
    $bufer='';
    $linea=0;
    $sentencia='';
    $comentario='';
    $saltos=0;

    for($i=0;$i<$long;$i++) {
        $car=$codigo[$i];
        $ant=$i>0?$codigo[$i-1]:null;
        $ant2=$i>1?$codigo[$i-2]:null;
        $antValido=substr(trim($bufer),-1);
        
        $bufer.=$car;
        $linea.=$car;
        
        if(!$enCadena&&!$enComentario&&!$enExpresion) {
            if($lenguaje=='js'&&$car=='/'&&in_array($antValido,['=','(',',','+','|','&'])) { //regexp
                $enExpresion=true;
            } elseif($car=='\''||$car=='"') {
                $enCadena=$car;
            } elseif($car=='*'&&$ant=='/') { // /*
                $bufer='/*';
                $enComentario=true;
            } else {
                if($car==';'||$car=='{') {
                    $sentencia=$bufer;
                    $bufer='';                    
                    if($comentario) {
                        $bloques=procesarComentario($comentario);
                        if(count($bloques))  $comentarios[]=(object)[
                                'sentencia'=>trim($sentencia),
                                'bloques'=>$bloques
                            ];
                        $comentario='';
                        $sentencia='';
                    }
                } elseif($car=="\n") {
                    if(!trim($linea)) {
                        $saltos++;
                    } else {
                        $linea='';
                        $saltos=1;
                    }
                    if($saltos==2&&trim($comentario)) {
                        $bloques=procesarComentario($comentario);
                        if($bloques) $comentarios[]=(object)[
                                'sentencia'=>null,
                                'bloques'=>$bloques
                            ];
                        $comentario='';
                        $sentencia='';
                        $saltos=0;
                    }
                }
            }
        } elseif($enCadena) {
            if($car==$enCadena&&($ant!='\\'||$ant2=='\\')) { // \' no, pero \\' si
                $enCadena=false;
            }
        } elseif($enExpresion) {
            if($car=='/'&&($ant!='\\'||$ant2=='\\')) { // \/ no, pero \\/ si
                $enExpresion=false;
            }
        } elseif($enComentario) {
            if($car=='/'&&$ant=='*') { // */
                $comentario.=$bufer;
                $bufer='';
                $enComentario=false;
            }
        }
    }

    if(!count($comentarios)) return;
    
    if($lenguaje=='php') {
        procesarPhp($ruta,$comentarios);
    } elseif($lenguaje=='js') {
        procesarJs($ruta,$comentarios);
    }
}

function procesarVariable($etiqueta,$lenguaje,&$parametros,&$miembros,$autogenerarParametros,$clase=null) {
    if($etiqueta->etiqueta!='var'&&$etiqueta->etiqueta!='param') return;

    if($lenguaje=='php') {
        if(preg_match('/^(.+?) (\$[\w>-]+)( (.+))?/ms',$etiqueta->comentario,$coincidencia2)) {
            $variable=trim($coincidencia2[2]);            

            $miembroDe=null;
            if(preg_match('/(\w+)->(\w+)/',$variable,$coincidencia3)) {
                $miembroDe='$'.$coincidencia3[1];
                $nombre='$'.$coincidencia3[2];
            }

            if($miembroDe) {
                //$parametro->propiedad => Agregar a $miembros
                if(!is_array($miembros[$miembroDe])) $miembros[$miembroDe]=[];
                $miembros[$miembroDe][]=(object)[
                    'variable'=>$nombre,
                    'opcional'=>false,
                    'predeterminado'=>false,
                    'tipo'=>$coincidencia2[1],
                    'descripcion'=>$coincidencia2[4],
                    'clase'=>$clase
                ];
            } else {
                if($autogenerarParametros) {
                    //Crear parámetro desde el comentario
                    $parametros[]=(object)[
                        'variable'=>$variable,
                        'tipo'=>$coincidencia2[1],
                        'descripcion'=>$coincidencia2[4],
                        'clase'=>$clase,
                        //El inconveniente es que en phpdoc lo siguiente no se puede especificar
                        'opcional'=>false,    
                        'predeterminado'=>''
                    ];
                } else {
                    //Actualizar parámetro de la función
                    foreach($parametros as $parametro) {
                        if($variable==$parametro->variable) {
                            $parametro->tipo=$coincidencia2[1];
                            $parametro->descripcion=$coincidencia2[4];
                        }
                    }
                }
            }
        }
    } elseif($lenguaje=='js') {
        //En js, la información sobre si es opcional y el valor predeterminado están en los comentarios
        if(preg_match('/^\{(.+?)\} (\[[\w\.\[\]]+=.+?\]|\[[\w\.\[\]]+\]|[\w\.\[\]]+)( - (.+))?/ms',$etiqueta->comentario,$coincidencia2)) {
            $tipo=trim($coincidencia2[1],'{}()');
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
                    'variable'=>$nombre,
                    'opcional'=>$opcional,
                    'predeterminado'=>$predeterminado,
                    'tipo'=>$tipo,
                    'descripcion'=>$descripcion,
                    'clase'=>$clase
                ];
            } else {
                if($autogenerarParametros) {
                    //Crear parámetro desde el comentario
                    $parametros[]=(object)[
                        'variable'=>$nombre,
                        'tipo'=>$tipo,
                        'descripcion'=>$descripcion,
                        'opcional'=>$opcional,    
                        'predeterminado'=>$predeterminado,
                        'clase'=>$clase
                    ];
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
}

function procesarParametros($lenguaje,$parametros,$comentario) {
    $buscarReturn=function($bloque) use($lenguaje) {
        $nombre=$lenguaje=='js'?'returns':'return';
        foreach($bloque->etiquetas as $etiqueta) {
            if($etiqueta->etiqueta==$nombre) return PHP_EOL.'**Devuelve:** '.procesarTipo($etiqueta->comentario,$lenguaje).PHP_EOL.PHP_EOL;
        }
    };

    if(!$parametros) {
        //Sin parámetros, devolver solo el valor de retorno
        return $buscarReturn($comentario->bloques[0]);
    }    

    $salida=PHP_EOL;

    $autogenerarParametros=$parametros===true;
    
    if(is_string($parametros)) {
        $parametros=explode(',',$parametros);

        //Analizar (solo php)
        foreach($parametros as $i=>$parametro) {
            $parametros[$i]=(object)[
                'variable'=>trim(trim($parametro),'.'),
                'opcional'=>false,
                'predeterminado'=>'',
                'tipo'=>false,
                'descripcion'=>'',
                'multiple'=>false
            ];
            
            if($lenguaje=='php') {
                $p=strpos($parametro,'=');
                if($p!==false) {
                    $parametros[$i]->variable=trim(substr($parametro,0,$p));
                    $parametros[$i]->opcional=true;
                    $parametros[$i]->predeterminado=trim(substr($parametro,$p+1));
                }
                if(substr($parametro,0,3)=='...') $parametros[$i]->multiple=true;
            }
        }
    } else {
        $parametros=[];
    }

    $miembros=[];

    foreach($comentario->bloques as $i=>$bloque) {
        if(count($comentario->bloques)>1) $salida.='#### Sobrecarga '.($i+1).PHP_EOL;
        $salida.='| Parámetro | Tipo | Descripción | Opcional | Predeterminado |'.PHP_EOL.'|--|--|--|--|--|'.PHP_EOL;

        //Buscar @var/@param
        foreach($bloque->etiquetas as $etiqueta) {
            procesarVariable($etiqueta,$lenguaje,$parametros,$miembros,$autogenerarParametros);
        }

        if(!count($parametros)) {
            $salida.='| (Ninguno) |'.PHP_EOL;
        } else {
            foreach($parametros as $parametro) $salida.='| `'.($parametro->multiple?'...':'').limpiarCelda($parametro->variable).'` | '.procesarTipo($parametro->tipo,$lenguaje,true).' | '.limpiarCelda($parametro->descripcion).' | '.limpiarCelda(($parametro->opcional?'Si':'')).' | '.($parametro->predeterminado?'`'.limpiarCelda($parametro->predeterminado).'`':'').' |'.PHP_EOL;
        }

        //Miembros
        foreach($miembros as $parametro=>$parametros) {
            $salida.='#### Propiedades de `'.$parametro.'`'.PHP_EOL;
            $salida.='| Propiedad | Tipo | Descripción | Opcional | Predeterminado |'.PHP_EOL.'|--|--|--|--|--|'.PHP_EOL;

            foreach($parametros as $parametro) {
                $salida.='| `'.limpiarCelda($parametro->variable).'` | '.procesarTipo($parametro->tipo,$lenguaje,true).' | '.limpiarCelda($parametro->descripcion).' | '.limpiarCelda(($parametro->opcional?'Si':'')).' | '.($parametro->predeterminado?'`'.limpiarCelda($parametro->predeterminado).'`':'').' |'.PHP_EOL;
            }
        }
        
        //Buscar @return/@returns de este bloque
        $salida.=PHP_EOL.$buscarReturn($bloque);
    }

    return $salida;
}

function procesarTipo($cadena,$lenguaje,$tabla=false) {
    if(!$cadena) return '';

    $cadena=str_replace(['\\|','(',')','{','}'],['|','','','',''],trim($cadena));
    
    $comentario=null;
    if(strpos($cadena,' ')!==false) {
        $comentario=substr($cadena,strpos($cadena,' ')+1);
        $cadena=substr($cadena,0,strpos($cadena,' '));
    }

    $salida='';

    $tipos=explode('|',$cadena);
    foreach($tipos as $tipo) {
        if($salida!='') $salida.=($tabla?'\\':'').'|';
        $esArray=substr($tipo,-2)=='[]';
        if($esArray){
            echo '';
        } 
        $tipo=trim(trim($tipo),'[]');
        if(($lenguaje=='php'&&in_array(strtolower($tipo),['int','integer','string','bool','boolean','true','false','null','float','double','array','iterable','callable','resource','void','object','mixed','function']))||
            ($lenguaje=='js'&&in_array(strtolower($tipo),['null','undefined','boolean','number','string','array','object','function','node','element','nodelist','event','*','regexp']))) {
                //Tipos nativos
                $salida.='`'.$tipo.($esArray?'[]':'').'`';
        } else {
            $salida.='[`'.$tipo.($esArray?'[]':'').'`]('.enlace($lenguaje.'doc',$tipo).')';
        }
    }

    if($comentario) $salida.=' '.$comentario;

    return $salida;
}

function procesarPhp($archivo,$comentarios) {
    global $clasesPhp,$funcionesPhp;

    $codigo=file_get_contents($archivo);

    $espacio=null;
    $clase=null;
    $extiende=null;
    $descripcionArchivo=null;
    $vars=[];
    $miembros=[]; //En PHP no se usa, pero es un argumento requerido de procesarVariable()

    //Buscar namespace
    if(preg_match('/namespace (.+?);/',$codigo,$coincidencia)) $espacio=$coincidencia[1];

    //Primer comentario = descripción del archivo
    if(!$comentarios[0]->sentencia) $descripcionArchivo=array_shift($comentarios);

    foreach($comentarios as $comentario) {
        //Buscar @ignore
        $ignorar=false;
        foreach($comentario->bloques[0]->etiquetas as $etiqueta) {
            if($etiqueta->etiqueta=='ignore') {
                $ignorar=true;
                break;
            }
        }
        if($ignorar) continue;

        if(preg_match('/class\s+?(.+?)(\s+?extends\s+?(.+?))?\s+?\{/',$comentario->sentencia,$coincidencia)) {
            $clase=nombreObjeto($espacio,$coincidencia[1]);
            if(count($coincidencia)==4) $extiende=nombreObjeto($espacio,$coincidencia[3]);

            $salida='# `'.$clase.'`'.PHP_EOL;
            $salida.=$comentario->bloques[0]->comentario.PHP_EOL.PHP_EOL;
            if($extiende) $salida.='Extiende: [`'.$extiende.'`]('.enlace('phpdoc',$extiende).')'.PHP_EOL.PHP_EOL;

            $clasesPhp[$clase]=(object)[
                'encabezado'=>$salida,
                'metodos'=>[],
                'propiedades'=>[]
            ];
        } elseif(preg_match('/(public\s+?|private\s+?|protected\s+?)?(static\s+?)?function\s+?(.+?)\s*?\((.*?)\)\s+?{/',$comentario->sentencia,$coincidencia)) {
            if(trim($coincidencia[1])!='private') { //No documentamos privadas
                $modificadores=[];
                $salida='### `'.trim($coincidencia[3]).'`';
                if(trim($coincidencia[1])=='protected') $modificadores[]='protegido';
                if(trim($coincidencia[2])=='static') $modificadores[]='estático';
                if(count($modificadores)) $salida.=' ('.implode(', ',$modificadores).')';
                $salida.=PHP_EOL.$comentario->bloques[0]->comentario.'  '.PHP_EOL;

                //Parámetros y retorno
                $salida.=procesarParametros('php',trim($coincidencia[4]),$comentario);

                if($clase) {
                    $clasesPhp[$clase]->metodos[]=$salida;
                } else {
                    $funcionesPhp[]=$salida;
                }
            }
        } elseif(preg_match('/(public\s+?|private\s+?|protected\s+?|var\s+?)?(static\s+?)?\$(.+?)\s*?(;|=)/',$comentario->sentencia)) {
            //Extaer @var (un bloque puede documentar varias propiedades, no solo la que figura en la sentencia)
            foreach($comentario->bloques[0]->etiquetas as $etiqueta) {
                procesarVariable($etiqueta,'php',$vars,$miembros,true,$clase);
            }
        }
        //TODO Variables globales
    }

    foreach($vars as $var) {
        if(!$var->clase) continue;

        $nombre=trim($var->variable,'$');

        //Buscar propiedad (asumimos que es la única clase del archivo)
        if(!preg_match('/(public\s+?|private\s+?|protected\s+?|var\s+?)?(static\s+?)?\$(.+?)\s*?(;|=)/',$codigo,$coincidencia)) continue;

        if(trim($coincidencia[1])=='private') continue; //No documentamos privadas        
        
        $salida='### `'.$nombre.'`';
        $modificadores=[];
        if(trim($coincidencia[1])=='protected') $modificadores[]='protegido';
        if(trim($coincidencia[2])=='static') $modificadores[]='estático';
        if(count($modificadores)) $salida.=' ('.implode(', ',$modificadores).')';
        $salida.=PHP_EOL.'**Tipo:** '.procesarTipo($var->tipo,'php').'  '.PHP_EOL.$var->descripcion.PHP_EOL.PHP_EOL;

        $clasesPhp[$var->clase]->propiedades[]=$salida;
    }
}

function limpiarCelda($cadena) {
    return str_replace(["\n","\r",'|'],[' ','','\\|'],$cadena);
}

function procesarJs($archivo,$comentarios) {
    global $clasesJs,$funcionesJs,$tiposJs,$externosJs,$procesarDespues;

    $codigo=file_get_contents($archivo);

    $clase=null;
    $descripcionArchivo=null;
    $vars=[];
    $miembros=[];

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
                    'encabezado'=>'# `'.$tipo.'`'.PHP_EOL.'Métodos y propiedades añadidos al prototipo de `'.$tipo.'`.'.PHP_EOL.PHP_EOL,
                    'metodos'=>[],
                    'propiedades'=>[]
                ];
            }
        }
    }

    foreach($comentarios as $comentario) {
        //Buscar @class, @extends, @ignore, @memberof, @private, @function
        $ignorar=false;
        $esClase=null;
        $miembroDe=null;
        $extiende=null;
        $funcion=null;
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
            } elseif($etiqueta->etiqueta=='function') {
                $funcion=true;
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

            $salida='# `'.$clase.'`'.PHP_EOL;
            $salida.=$comentario->bloques[0]->comentario.PHP_EOL.PHP_EOL;
            if($extiende) $salida.='Extiende: [`'.$extiende.'`]('.enlace('jsdoc',$extiende).')'.PHP_EOL;

            if($parametros) $salida.='## Parámetros del constructor'.PHP_EOL.procesarParametros('js',$parametros,$comentario).PHP_EOL;
            
            $clasesJs[$clase]=(object)[
                'encabezado'=>$salida,
                'metodos'=>[],
                'propiedades'=>[]
            ];

            //Crear tipo automáticamente
            if(!array_key_exists($clase,$tiposJs)) $tiposJs[$clase]='### [`'.$clase.'`]('.enlace('jsdoc',$clase).') \*'.PHP_EOL.$comentario->bloques[0]->comentario.PHP_EOL.PHP_EOL;
        } else {
            $salida='';

            //Solo tomamos propiedades o funciones globales
            //Las propiedades que no tengan asignada una función, deben tener @function para ser consideradas
            if(preg_match('/(this|.+?\.prototype|.+?)\.(.+?)\s*?=\s*?function\s*?\((.*?)\)/',$comentario->sentencia,$coincidencia)) {
                $nombre=$coincidencia[2];
                $parametros=$coincidencia[3];
            } elseif(preg_match('/function\s+?(.+?)\s*?\((.*?)\)/',$comentario->sentencia,$coincidencia)) {
                if($clase) continue;
                $nombre=$coincidencia[1];
                $parametros=$coincidencia[2];
            } elseif($funcion&&preg_match('/(this|.+?\.prototype|.+?)\.(.+?)\s*?=/',$comentario->sentencia,$coincidencia)) {
                $nombre=$coincidencia[2];
                $parametros=true; //El valor true forzará el uso de los @param en lugar de los parámetros reales de la función
            } elseif(preg_match('/this\.(.+?)\s*?=/',$comentario->sentencia,$coincidencia)) {
                //Extaer @var (un bloque puede documentar varias propiedades, no solo la que figura en la sentencia)
                foreach($comentario->bloques[0]->etiquetas as $etiqueta) {
                    procesarVariable($etiqueta,'js',$vars,$miembros,true,$clase);
                }
                continue;
            } else {
                continue;
            }

            $salida='### `'.trim($nombre).'`';
            $salida.=PHP_EOL.$comentario->bloques[0]->comentario.'  '.PHP_EOL;

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

        //TODO Variables globales, propiedades (@var) con @extern (propiedades agregadas a un prototipo que no sean función)
        //TODO @enum
    }  
    
    foreach($vars as $var) {
        if(!$var->clase) continue;

        $salida='### `'.$var->variable.'`'.PHP_EOL.'**Tipo:** '.procesarTipo($var->tipo,'js').'  '.PHP_EOL.$var->descripcion.PHP_EOL.PHP_EOL;

        if(array_key_exists($var->variable,$miembros)) {
            //Miembros
            $salida.='#### Propiedades de `'.$var->variable.'`'.PHP_EOL;
            $salida.='| Propiedad | Tipo | Descripción | Opcional | Predeterminado |'.PHP_EOL.'|--|--|--|--|--|'.PHP_EOL;
            foreach($miembros[$var->variable] as $prop) {
                $salida.='| `'.limpiarCelda($prop->variable).'` | '.procesarTipo($prop->tipo,'js',true).' | '.limpiarCelda($prop->descripcion).' | '.limpiarCelda(($prop->opcional?'Si':'')).' | '.($prop->predeterminado?'`'.limpiarCelda($prop->predeterminado).'`':'').' |'.PHP_EOL;
            }
            $salida.=PHP_EOL;
        }

        $clasesJs[$var->clase]->propiedades[]=$salida;
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
        if(count($clase->propiedades)) $salida.='## Propiedades'.PHP_EOL.PHP_EOL.implode('',$clase->propiedades);
        if(count($clase->metodos)) $salida.='## Métodos'.PHP_EOL.PHP_EOL.implode('',$clase->metodos);
        
        file_put_contents($rutaSalida.$archivo.'.md',$salida);
    }

    //Funciones

    if($lenguaje=='php') {
        $funciones=$funcionesPhp;
    } elseif($lenguaje=='js') {
        $funciones=$funcionesJs;
    }

    $salida='# Funciones globales ('.strtoupper($lenguaje).')'.PHP_EOL.PHP_EOL;
    foreach($funciones as $funcion) $salida.=$funcion;
        
    file_put_contents($rutaSalida.$lenguaje.'doc-funciones.md',$salida);

    if($lenguaje=='js') {
        //Externos

        foreach($externosJs as $nombre=>$clase) {
            $archivo=enlace('jsdoc','externo-'.$nombre);
            $indiceExternos[$nombre]=$archivo;
    
            $salida=$clase->encabezado;
            if($clase->metodos) $salida.='## Métodos'.PHP_EOL.PHP_EOL.implode('',$clase->metodos);
            if($clase->propiedades) $salida.='## Propiedades'.PHP_EOL.PHP_EOL.implode('',$clase->propiedades);
        
            file_put_contents($rutaSalida.$archivo.'.md',$salida);
        }

        //Tipos
        
        $salida='#Tipos (JS)'.PHP_EOL.PHP_EOL;
        foreach($tiposJs as $tipo) $salida.=$tipo;

        $salida.=PHP_EOL.'*\* Tipo definido por una clase.*';
        
        file_put_contents($rutaSalida.'jsdoc-tipos.md',$salida);
    }

    //Índice
    
    $salida='# Documentación '.strtoupper($lenguaje).PHP_EOL.PHP_EOL;

    $salida.='- [Funciones globales]('.$lenguaje.'doc-funciones)'.PHP_EOL;
    if($lenguaje=='js') $salida.='- [Tipos](jsdoc-tipos)'.PHP_EOL;
    
    $salida.=PHP_EOL.'## Clases'.PHP_EOL;
    ksort($indice);
    foreach($indice as $nombre=>$ruta) {
        $salida.='- [`'.$nombre.'`]('.$ruta.')'.PHP_EOL;
    }

    if($lenguaje=='js') {
        $salida.=PHP_EOL.'## Externos'.PHP_EOL;
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
    return $prefijo.'-'.trim(preg_replace('/[^a-z0-9]+/','-',trim(strtolower($nombre))),'-');
}
