<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Asistente concreto para construir a producción.
 */
class construirProduccion extends asistente {
    /**
     * Devuelve los parámetros del asistente. Debe devolver un objeto con las propiedades [titulo,visible=>bool].
     * @return object
     */
    public static function obtenerParametros() {
        return (object)[
            'visible'=>false
        ];
    }

    /**
     * Imprime el formulario de configuración del asistente.
     */
    public function obtenerFormulario() {
        $json=gestor::obtenerJsonAplicacion();
?>
        <div class="form-group row">
            <label class="col-3 col-form-label">Incluir módulos</label>
            <div class="col-sm-9">
                <!--TODO Listado de módulos disponibles (checkbox)-->
                <textarea class="form-control" name="modulos" rows="4" placeholder="Uno por línea."><?=$json->produccion->modulos?></textarea>
            </div>
        </div>
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" name="depuracion" checked id="cp-depuracion">
            <label class="custom-control-label" for="cp-depuracion">Depuración</label>
        </div>
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" name="embebibles" checked id="cp-embebibles">
            <label class="custom-control-label" for="cp-embebibles">Integrar vistas embebibles</label>
        </div>
        <div class="custom-control custom-checkbox mb-3">
            <input type="checkbox" class="custom-control-input" name="limpiar" id="cp-limpiar">
            <label class="custom-control-label" for="cp-limpiar">Limpiar directorios de salida</label>
        </div>
<?php
        if(!function_exists('shell_exec')) {
?>
        <p>¡shell_exec() no está habilitado!</p>
<?php
        }
    }

    /**
     * Ejecuta el asistente.
     * @var object $param Parámetros recibidos desde el formulario.
     * @var bool $formulario Estalecer a false si se está invocando el método desde el código, en lugar desde el formulario del asistente.
     */
    public function ejecutar($param,$formulario=true) {
        global $archivosCssCombinados,$archivosCssCombinadosCordova;

        if($formulario) {
            //Almacenar parámetros en el JSON para la próxima ejecución
            $this->actualizarJson($param);
        }

        $modulos=explode("\n",$param->modulos);

        iniciarRegistroExec(); 

        $rutaAplicacion='aplicaciones/'.gestor::obtenerNombreAplicacion().'/';

        //Limpiar/crear directorios
        if($param->limpiar) {
            $archivos=buscarArchivos(_produccion,'*.*');
            foreach($archivos as $archivo) unlink($archivo);
        }
        //Crear el árbol completo hasta vistas/
        if(!is_dir(_produccion.$rutaAplicacion.'cliente/vistas/')) mkdir(_produccion.$rutaAplicacion.'cliente/vistas/',0755,true);

        ////Copiar framework
        $tipos=['*.php','*.html','*.jpg','*.png','*.gif','*.svg','*.js','*.css'];
        copiar(_desarrollo.'cliente/',$tipos,_produccion.'cliente/');
        copiar(_desarrollo.'servidor/',$tipos,_produccion.'servidor/');

        //Omitir los íconos
        copiar(_desarrollo.'recursos/css/',$tipos,_produccion.'recursos/css/');
        copiar(_desarrollo.'recursos/img/',$tipos,_produccion.'recursos/img/');
        copiar(_desarrollo.'recursos/componentes/img/',$tipos,_produccion.'recursos/componentes/img/');

        //Omitir temas (serán procesados junto con los estilos de las vistas)
        unlink(_produccion.'recursos/css/foxtrot.css');
        $archivos=glob(_produccion.'recursos/css/tema-*.css');
        foreach($archivos as $archivo) unlink($archivo);

        //Eliminar módulos innecesarios, ya que copiamos todo servidor en forma recursiva
        $archivos=glob(_produccion.'servidor/modulos/*');
        foreach($archivos as $archivo) {
            if(!in_array(basename($archivo),$modulos))
                eliminarDir($archivo);
        }
        //Eliminar todos los módulos en cliente ya que se integrarán en el js de la aplicación solo los necesarios
        eliminarDir(_produccion.'cliente/modulos');

        //Construir foxtrot.js sin módulos
        compilarFoxtrotJs(_produccion.'cliente/foxtrot.js',$param->depuracion,true);

        //Intentar copiar y configurar .htaccess y config.php (no reemplazar)
        if(!file_exists(_produccion.'.htaccess')) {
            $codigo=file_get_contents(_desarrollo.'.htaccess');
            file_put_contents(
                _produccion.'.htaccess',
                preg_replace('#/desarrollo/#','/produccion/',$codigo)
            );
        }

        if(!file_exists(_produccion.'config.php')) {
            $codigo=file_get_contents(_desarrollo.'config.php');
            file_put_contents(
                _produccion.'config.php',
                preg_replace('#/desarrollo/#','/produccion/',$codigo)
            );
        }

        //Otros archivos del raíz
        $archivos=[
            'error.php',
            'index.php'
        ];
        foreach($archivos as $archivo) copy(_desarrollo.$archivo,_produccion.$archivo);

        //Crear directorio temp vacío (no copiar los archivos que contenga temp en desarrollo)
        if(!is_dir(_produccion.'temp/')) mkdir(_produccion.'temp/',0755);
        if(!is_dir(_produccion.'temp/temp-privado/')) mkdir(_produccion.'temp/temp-privado/',0755);
        copy(_desarrollo.'temp/temp-privado/.htaccess',_produccion.'temp/temp-privado/.htaccess');

        ////Compilar aplicación

        //Copiar archivos PHP tal cual
        copy(_desarrollo.$rutaAplicacion.'config.php',_produccion.$rutaAplicacion.'config.php');
        copy(_desarrollo.$rutaAplicacion.'config.php',_produccion.$rutaAplicacion.'config.php');
        copiar(_desarrollo.$rutaAplicacion.'servidor/','*.*',_produccion.$rutaAplicacion.'servidor/');

        //Copiar metadatos comprimido
        file_put_contents(_produccion.$rutaAplicacion.'aplicacion.json',json_encode(json_decode(file_get_contents(_desarrollo.$rutaAplicacion.'aplicacion.json'))));

        //Limpiar el css
        $rutaCssCombinado=_produccion.$rutaAplicacion.'recursos/css/aplicacion.css';
        if(file_exists($rutaCssCombinado)) unlink($rutaCssCombinado);

        //Copiar otros directorios
        $directorios=glob(_desarrollo.$rutaAplicacion.'*',GLOB_ONLYDIR);
        foreach($directorios as $dir) {
            if(!in_array(basename($dir),['cliente','servidor','recursos'])) {
                copiar($dir.'/','*.*',_produccion.$rutaAplicacion.basename($dir).'/');
            }
        }
        
        //Combinar los estilos de los módulos en el archivo CSS principal de la aplicación
        $css='';
        foreach($modulos as $modulo) {
            $ruta=_desarrollo.'cliente/modulos/'.$modulo.'/';
            if(!file_exists($ruta)) continue;
            $archivos=buscarArchivos($ruta,'*.css');
            foreach($archivos as $archivo) $css.=file_get_contents($archivo);
        }
        if(file_exists($rutaCssCombinado)) $css.=file_get_contents($rutaCssCombinado);
        file_put_contents($rutaCssCombinado,$css);

        //Combinar los controladores en el archivo JS principal de la aplicación
        $archivos=[
            _desarrollo.$rutaAplicacion.'cliente/aplicacion.js'
        ];
        $archivos=array_merge($archivos,buscarArchivos(_desarrollo.$rutaAplicacion.'cliente/controladores/','*.js'));

        //Combinar los módulos en el archivo JS principal de la aplicación
        foreach($modulos as $modulo) {
            $ruta=_desarrollo.'cliente/modulos/'.$modulo.'/';
            if(!file_exists($ruta)) continue;
            $archivos=array_merge($archivos,buscarArchivos($ruta,'*.js'));
        }

        $jsonApl=json_decode(file_get_contents(_desarrollo.$rutaAplicacion.'aplicacion.json'));

        $temp=tempnam(__DIR__,'js');
        if($param->embebibles) {
            //Agregar código de las vistas embebibles dentro del JS
            $js='';
            foreach($jsonApl->vistas as $nombre=>$vista) {
                if($vista->tipo=='embebible') {
                    $ruta=_desarrollo.$rutaAplicacion.'cliente/vistas/'.$nombre.'.';
                    
                    $rutaHtml=$ruta.(file_exists($ruta.'php')?'php':'html');
                    $html=str_replace(["\r","\n",'"'],['',' ','\\"'],comprimirHtml(file_get_contents($rutaHtml)));

                    $json=str_replace('"','\\"',file_get_contents($ruta.'json'));

                    $js.=PHP_EOL.'_vistasEmbebibles["'.$nombre.'"]={"html":"'.$html.'","json":"'.$json.'"};';
                }
            }
            file_put_contents($temp,$js);
            $archivos[]=$temp;
        }

        compilarJs($archivos,_produccion.$rutaAplicacion.'cliente/aplicacion.js',$param->depuracion);

        unlink($temp);

        //Copiar las vistas tal cual (excepto CSS)
        copiar(_desarrollo.$rutaAplicacion.'cliente/vistas/','*.{json,html,php}',_produccion.$rutaAplicacion.'cliente/vistas/');

        //Procesar las vistas
        $archivos=buscarArchivos(_produccion.$rutaAplicacion.'cliente/vistas/','*.{php,html}');
        foreach($archivos as $archivo) procesarVista($archivo);

        if($param->embebibles) {
            foreach($jsonApl->vistas as $nombre=>$vista) {
                if($vista->tipo=='embebible') {
                    //Eliminar archivos de las vistas embebibles integrados dentro de aplicacion.js
                    $ruta=$rutaAplicacion.'cliente/vistas/'.$nombre;
                    if(file_exists(_produccion.$ruta.'.php')) unlink(_produccion.$ruta.'.php');
                    if(file_exists(_produccion.$ruta.'.html')) unlink(_produccion.$ruta.'.html');
                    if(file_exists(_produccion.$ruta.'.js')) unlink(_produccion.$ruta.'.js');
                    if(file_exists(_produccion.$ruta.'.json')) unlink(_produccion.$ruta.'.json');

                    //E incorporar los archivos CSS en aplicacion.css o cordova.css
                    $rutaCss=_desarrollo.$ruta.'.css';
                    $destino=_produccion.$rutaAplicacion.'recursos/css/'.($vista->cliente=='cordova'?'cordova':'aplicacion').'.css';
                    if(file_exists($rutaCss)) file_put_contents($destino,file_get_contents($rutaCss),FILE_APPEND);
                }
            }
            
            //Volver a comprimir el CSS
            //TODO Comprimir CSS solo una vez
            $ruta=_produccion.$rutaAplicacion.'recursos/css/aplicacion.css';
            if(file_exists(_produccion.$rutaAplicacion.'recursos/css/cordova.css')) comprimirCss($ruta);
            $ruta=_produccion.$rutaAplicacion.'recursos/css/cordova.css';
            if(file_exists(_produccion.$rutaAplicacion.'recursos/css/cordova.css')) comprimirCss($ruta);
        }
        
        //Copiar directorio recursos
        //Los archivos del directorio recursos no deben combinarse; comprimir individualmente
        $archivos=buscarArchivos(_desarrollo.$rutaAplicacion.'recursos/','*.*');
        foreach($archivos as $archivo) {
            $destino=str_replace(_desarrollo,_produccion,$archivo);
            $dir=dirname($destino);
            $ext=substr($archivo,strrpos($archivo,'.'));
            
            if(!file_exists($dir)) mkdir($dir,0755,true);

            if($ext=='.css') {
                //Omitir archivos que se hayan integrado a aplicacion.css
                $rutaFinal=preg_replace('#^'.str_replace('\\','\\\\',_desarrollo).'#','',$archivo);
                if(in_array($rutaFinal,$archivosCssCombinados)||in_array($rutaFinal,$archivosCssCombinadosCordova)||!file_exists($destino)) continue;
                copy($archivo,$destino);
                comprimirCss($destino);
            } elseif($ext=='.js') {
                compilarJs($archivo,$destino,$param->depuracion);
            } else {
                //Imágenes, etc.
                copy($archivo,$destino);
            }
        }

        //Eliminar directorios vacíos
        eliminarDirectoriosVacios(_produccion);
    }
    
    protected function actualizarJson($param) {
        $json=gestor::obtenerJsonAplicacion();
        $json->produccion=[
            'modulos'=>$param->modulos
        ];
        gestor::actualizarJsonAplicacion($json);  
    }
}