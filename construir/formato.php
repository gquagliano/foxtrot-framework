<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//TRABAJO EN CURSO

/**
 * Gestión del formateo y compilación de archivos HTML, CSS y JS.
 */
class formato {
    /**
     * 
     */
    public static function formatearHtml($codigo) {
        $vacias=['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'];
        $enLinea=['b','big','i','small','tt','abbr','acronym','cite','code','dfn','em','kbd','strong','samp','var','a','bdo','br','img','span','sub','sup'];
        $mantener=['textarea','option','title'];
        $noIndentarContenido=['p','h1','h2','h3','h4','h5','h6'];
        
        //TODO

        return $codigo;
    }

    /**
     * 
     */
    public static function comprimirHtml($codigo) {
        //TODO
        return $codigo;
    }

    /**
     * Devuelve el código JSON indentado.
     * @param string $codigo
     * @return string
     */
    public static function formatearJson($codigo) {
        if(is_string($codigo)) $codigo=json_decode($codigo);
        return json_encode($codigo,JSON_PRETTY_PRINT);
    }

    /**
     * Devuelve el código JSON comprimido.
     * @param string $codigo
     * @return string
     */
    public static function comprimirJson($codigo) {
        if(is_string($codigo)) $codigo=json_decode($codigo);
        return json_encode($codigo);
    }

    /**
     * 
     */
    public static function formatearCss($codigo) {
        //TODO
        return $codigo;
    }

    /**
     * 
     */
    public static function comprimirCss($codigo) {
        //TODO Importado de funciones.php, reescribir mediante un parser

        //Compresión rápida (solo limpieza de contenido innecesario)
        $codigo=preg_replace('#/\*.*?\*/#sm','',$codigo);  
        //$codigo=preg_replace('#url\s*?\(\s*?(\'|")(.+?)\1\)#msi','url($2)',$codigo);
        $codigo=str_replace(["\r","\n"],'',$codigo);
        $codigo=preg_replace('/[\s]*([,>:;\}\{])[\s]+/m','$1',$codigo);
        $codigo=preg_replace('/\)[\s]+;/m',');',$codigo); //Evita remover el espacio cuando se encuentra en el selector, ejemplo :not(test) .test
        $codigo=preg_replace('/[\s]+\{/m','{',$codigo);
        $codigo=str_replace(';}','}',$codigo);

        return $codigo;
    }

    /**
     * 
     */
    public static function compilarCss($codigo) {
        //TODO Importado de funciones.php, reescribir mediante un parser        

        //Procesar @copiar (permite duplicar el cuerpo de una regla dentro de otra)
        if(preg_match_all('/@copiar (.+?)$/m',$codigo,$coincidencias)) {
            $reglas=self::procesarReglasCss($codigo);
            foreach($coincidencias[1] as $i=>$regla) {
                $regla=self::limpiarNombreReglaCss($regla);
                $cuerpo='';
                if(array_key_exists($regla,$reglas)) {
                    $cuerpo=$reglas[$regla];
                    //Agregar ; al final en caso de que ya no sea la última regla del bloque
                    if(substr(trim($cuerpo),-1)!=';') $cuerpo.=';';
                }
                $codigo=str_replace($coincidencias[0][$i],$cuerpo,$codigo);
            }
        }

        //Subir los @import al comienzo del archivo
        if(preg_match_all('/(@import url\(.+?\);)/i',$codigo,$coincidencias)) {
            foreach($coincidencias[0] as $coincidencia) {
                $codigo=str_replace($coincidencia,'',$codigo);
                $codigo=$coincidencia.$codigo;
            }
        }

        return self::comprimirCss($codigo);
    }

    protected static function limpiarNombreReglaCss($regla) {
        //TODO Importado de funciones.php, revisar/reescribir

        //Remover saltos de línea
        $regla=str_replace(["\n","\r"],[' ',''],$regla);
        //Los espacios y saltos de línea alrededor de , > se pueden limpiar
        $regla=preg_replace('/\s*(,|>)\s*/','$1',$regla);
        return trim($regla);
    }

    protected static function procesarReglasCss($codigo) {  
        //TODO Importado de funciones.php, revisar/reescribir
          
        $enComentario=false;
        $enRegla=false;
        $enMedia=false;
        $bufer='';
        $regla='';
        $reglas=[];
    
        $len=strlen($codigo);
        for($i=0;$i<$len;$i++) {
            if(!$enComentario) {            
                if($codigo[$i]=='/'&&$codigo[$i+1]=='*') {
                    $enComentario=true;
                } elseif(!$enRegla) {
                    if($codigo[$i]=='{') {
                        if(preg_match('/@media/',$bufer)) {
                            $enMedia=true;
                            $bufer='';
                        } else {
                            $enRegla=true;
                            $regla=self::limpiarNombreReglaCss($bufer);
                            $bufer='';
                        }
                    } elseif($codigo[$i]=='}') {
                        $enMedia=false;
                        $bufer='';
                    } else {
                        $bufer.=$codigo[$i];
                    }
                } else {
                    if($codigo[$i]=='}') {
                        if($enRegla) {
                            $enRegla=false;
                            if(!$enMedia) $reglas[$regla]=$bufer; //Ignorar las reglas dentro de media queries
                            $bufer='';
                        }
                    } else {
                        $bufer.=$codigo[$i];
                    }
                }
    
            } else {
                if($codigo[$i-1]=='*'&&$codigo[$i]=='/') $enComentario=false;
            }        
        }
    
        return $reglas;
    }

    /**
     * 
     */
    public static function formatearJs($codigo) {
        //TODO
        //Por el momento no hay necesidad de esta función
        return $codigo;
    }

    /**
     * 
     */
    public static function comprimirJs($codigo) {
        //TODO
        return $codigo;
    }

    /**
     * 
     */
    public static function compilarJs($archivos,$destino,$usarClosure=false) {
        //Agregaremos el hash del archivo original en el encabezado del archivo compilado a fin de poder omitirlo si el mismo no ha cambiado
        //En caso de tratarse de múltiples archivos, el hash será sobre la concatenación de todos ellos
        if(!is_array($archivos)) $archivos=[$archivos];
        $codigo='';   
        $arg='';
        foreach($archivos as $item) {
            //Soporte para comodines (ejemplo **.js)
            $rutas=glob($item);
            foreach($rutas as $ruta) {
                $arg.=' "'.$ruta.'"'; 
                $codigo.=file_get_contents($ruta);   
            }
        }
        $hash=md5($codigo);

        if(!$usarClosure) {
            file_put_contents($destino,$codigo);
        } else {
            if(file_exists($destino)&&trim(fgets(fopen($destino,'r')))=='//'.$hash) return;

            $comando=_closure.' --js_output_file '.escapeshellarg($destino).' '.$arg; //TODO Anexando 2&>1 no funciona, al menos en Windows
            $o=shell_exec($comando);
            registroExec($comando,$o);

            if(file_exists($destino)) file_put_contents($destino,'//'.$hash.PHP_EOL.file_get_contents($destino));
        }
    }
}