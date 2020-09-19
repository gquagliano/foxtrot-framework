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
?>
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
     */
    public function ejecutar($param) {
        //Registro para depuración
        $registro=__DIR__.'/../exec.log';
        if(PHP_OS_FAMILY=='Windows') {
            $path=shell_exec('echo %PATH%');
            $cordova_home=shell_exec('echo %CORDOVA_HOME%');
            $home_var='USERPROFILE';  
            $home=shell_exec('echo %USERPROFILE%');
            $android=shell_exec('echo %ANDROID_SDK_ROOT%');
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
            '# Usuario = '.$usuario.PHP_EOL.
            '# PATH = '.trim($path).PHP_EOL.
            '# CORDOVA_HOME = '.trim($cordova_home).PHP_EOL.
            '# '.$home_var.' = '.trim($home).PHP_EOL.
            '# ANDROID_SDK_ROOT = '.trim($android).PHP_EOL.
            '# JAVA_HOME = '.trim($java).PHP_EOL.PHP_EOL
        ,FILE_APPEND);    

        $rutaAplicacion='aplicaciones/'.gestor::obtenerNombreAplicacion().'/';

        ////Copiar framework
        $tipos=['*.php','*.html','*.jpg','*.png','*.gif','*.svg','*.js','*.css'];
        copiar(_desarrollo.'cliente/',$tipos,_produccion.'cliente/');
        copiar(_desarrollo.'servidor/',$tipos,_produccion.'servidor/');
        //Omitir los íconos
        copiar(_desarrollo.'recursos/css/',$tipos,_produccion.'recursos/css/');
        copiar(_desarrollo.'recursos/img/',$tipos,_produccion.'recursos/img/');
        copiar(_desarrollo.'recursos/componentes/img/',$tipos,_produccion.'recursos/componentes/img/');

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

        //Limpiar/crear directorios
        if($param->limpiar) {
            $archivos=buscarArchivos(_produccion.$rutaAplicacion,'*.*');
            foreach($archivos as $archivo) unlink($archivo);
        }
        //Crear el árbol completo hasta vistas/
        if(!is_dir(_produccion.$rutaAplicacion.'cliente/vistas/')) mkdir(_produccion.$rutaAplicacion.'cliente/vistas/',0755,true);

        //Copiar archivos PHP tal cual
        copy(_desarrollo.$rutaAplicacion.'config.php',_produccion.$rutaAplicacion.'config.php');
        copy(_desarrollo.$rutaAplicacion.'config.php',_produccion.$rutaAplicacion.'config.php');
        copiar(_desarrollo.$rutaAplicacion.'servidor/','*.*',_produccion.$rutaAplicacion.'servidor/');

        //Copiar metadatos comprimido
        file_put_contents(_produccion.$rutaAplicacion.'aplicacion.json',json_encode(json_decode(file_get_contents(_desarrollo.$rutaAplicacion.'aplicacion.json'))));

        //Los archivos del directorio recursos no deben combinarse; comprimir individualmente
        $archivos=buscarArchivos(_desarrollo.$rutaAplicacion.'recursos/','*.*');
        foreach($archivos as $archivo) {
            $destino=str_replace(_desarrollo,_produccion,$archivo);
            $dir=dirname($destino);
            $ext=substr($archivo,strrpos($archivo,'.'));
            
            if(!file_exists($dir)) mkdir($dir,0755,true);

            if($ext=='.css') {
                copy($archivo,$destino);
                comprimirCss($destino);
            } elseif($ext=='.js') {
                compilarJs($archivo,$destino,$param->depuracion);
            } else {
                //Imágenes, etc.
                copy($archivo,$destino);
            }
        }

        //Combinar los controladores en el archivo JS principal de la aplicación
        $archivos=[
            _desarrollo.$rutaAplicacion.'cliente/aplicacion.js'
        ];
        $archivos=array_merge($archivos,buscarArchivos(_desarrollo.$rutaAplicacion.'cliente/controladores/','*.js'));

        $jsonApl=json_decode(file_get_contents(_desarrollo.$rutaAplicacion.'aplicacion.json'));

        $temp=tempnam(__DIR__,'js');
        if($param->embebibles) {
            //Agregar código de las vistas embebibles dentro del JS
            $js='';
            foreach($jsonApl->vistas as $nombre=>$vista) {
                if($vista->tipo=='embebible') {
                    $ruta=_desarrollo.$rutaAplicacion.'cliente/vistas/'.$nombre.'.';
                    
                    $rutaHtml=$ruta.(file_exists($ruta.'php')?'php':'html');
                    $html=str_replace('"','\\"',file_get_contents($rutaHtml));

                    $json=str_replace('"','\\"',file_get_contents($ruta.'json'));

                    $js.='_vistasEmbebibles["'.$nombre.'"]={html:"'.$html.'",json:"'.$json.'"};'.PHP_EOL.PHP_EOL;
                }
            }
            file_put_contents($temp,$js);
            $archivos[]=$temp;
        }

        compilarJs($archivos,_produccion.$rutaAplicacion.'cliente/aplicacion.js',$param->depuracion);

        unlink($temp);

        //Copiar las vistas tal cual
        copiar(_desarrollo.$rutaAplicacion.'cliente/vistas/','*.{json,css,html,php}',_produccion.$rutaAplicacion.'cliente/vistas/');

        //Procesar las vistas
        $archivos=buscarArchivos(_produccion.$rutaAplicacion.'cliente/vistas/','*.{php,html}');
        foreach($archivos as $archivo) procesarVista($archivo);

        if($param->embebibles) {
            //Combinar archivos CSS de las vistas embebibles
            $rutaDestino=_produccion.$rutaAplicacion.'recursos/css/aplicacion.css';
            foreach($jsonApl->vistas as $nombre=>$vista) {
                if($vista->tipo=='embebible') {
                    $ruta=_desarrollo.$rutaAplicacion.'cliente/vistas/'.$nombre.'.css';
                    file_put_contents($rutaDestino,file_get_contents($ruta),FILE_APPEND);
                }
            }
        }
    }
}