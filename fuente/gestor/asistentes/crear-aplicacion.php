<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Asistente concreto para crear una aplicación.
 */
class crearAplicacion extends asistente {
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
        <div class="form-group row">
            <label class="col-3 col-form-label">Nombre</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="nombre">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Dominio</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="dominio" placeholder="Opcional">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Tema</label>
            <div class="col-sm-9">
                <select class="custom-select" name="tema">
<?php
        $archivos=glob(_raiz.'recursos/css/tema-*.css');
        foreach($archivos as $archivo) {
            $nombre=preg_replace('/^tema-/','',pathinfo($archivo)['filename']);
            echo '<option value="'.$nombre.'">'.$nombre.'</option>';
        }
?>
                </select>
            </div>
        </div>
<?php
    }

    /**
     * Ejecuta el asistente.
     * @var object $parametros Parámetros recibidos desde el formulario.
     */
    public function ejecutar($parametros) {
        if(!$parametros->nombre) gestor::error('Ingresá el nombre de la aplicación.');
        
        $ruta=_raiz.'aplicaciones/'.$parametros->nombre.'/';
        if(file_exists($ruta)) gestor::error('La aplicación ya existe.');

        $rutaConfig=_raiz.'config.php';

        if($parametros->dominio) {                   
            //Verificar si el dominio está libre
            //Esto solo funciona con el enrutador de aplicaciones predeterminado y el formato de configuración de ejemplo. El desarrollador debería omitir el dominio
            //cuando haya realizado una configuración diferente.
            if(file_exists($rutaConfig)) {
                $config=file_get_contents($rutaConfig);
                if(preg_match('/\$dominios\s*=\s*\[(.*?)\]/s',$config,$coincidencias)&&
                    preg_match('/\''.$parametros->dominio.'\'\s*=>/s',$coincidencias[1])) gestor::error('El dominio ya está en uso.'); 
            }
        }
        
        //Crear directorios
        mkdir($ruta.'cliente/controladores',0755,true);
        mkdir($ruta.'cliente/vistas',0755);
        mkdir($ruta.'recursos/css',0755,true);
        mkdir($ruta.'recursos/img',0755);
        mkdir($ruta.'servidor/controladores',0755,true);
        mkdir($ruta.'servidor/modelo',0755);

        //Copiar plantillas
        $dir=__DIR__.'/crear-aplicacion/';
        copy($dir.'config.php',$ruta.'config.php');
        copy($dir.'aplicacion.js',$ruta.'cliente/aplicacion.js');
        copy($dir.'estilos.css',$ruta.'recursos/css/estilos.css');

        //Json
        $json=json_decode(file_get_contents($dir.'aplicacion.json'));
        $json->tema=$parametros->tema;
        file_put_contents($ruta.'aplicacion.json',json_encode($json));

        $reemplazar=[
            '{nombre}'=>$parametros->nombre
        ];
        
        $codigo=file_get_contents($dir.'aplicacion.php');
        file_put_contents($ruta.'servidor/aplicacion.php',str_replace_array($reemplazar,$codigo));
        
        $codigo=file_get_contents($dir.'aplicacion.pub.php');
        file_put_contents($ruta.'servidor/aplicacion.pub.php',str_replace_array($reemplazar,$codigo));

        if($parametros->dominio) {   
            //Intentar configurar dominio
            $rutaPlantillaConfig=_raiz.'config-ejemplo.php';
            $config=null;
            if(file_exists($ruta)) {
                $config=file_get_contents($rutaConfig);
            } elseif(file_exists($rutaPlantillaConfig)) {
                //Crear archivo config.php si es la primer aplicación
                $config=file_get_contents($rutaPlantillaConfig);
            }
            if($config) {
                $config=preg_replace('/\$dominios.*?=.*?\[(.*?)(\s*)\];/s','$dominios=[\1,'.PHP_EOL."\t".'\''.$parametros->dominio.'\'=>\''.$parametros->nombre.'\''.PHP_EOL.'];',$config);
                //Corregir si no había ningún dominio configurado y nos ha quedado $dominios=[,...
                $config=preg_replace('/\$dominios.*?=.*?\[\s*,/','$dominios=[',$config);
                file_put_contents($rutaConfig,$config);
            }
        }

        gestor::seleccionarAplicacion($parametros->nombre);
    }
}