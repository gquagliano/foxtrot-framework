<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Asistente concreto para construir Cordova.
 */
class construirCordova extends asistente {
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
            <label class="col-3 col-form-label">Vista inicial</label>
            <div class="col-sm-4">
                <input type="text" class="form-control" name="inicio" value="<?=$json->embebible->inicio?>">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Construir Cordova</label>
            <div class="col-sm-9">
                <div class="form-group row">
                    <label class="col-3 col-form-label">Ruta a www</label>
                    <div class="col-sm-9">
                        <input type="text" class="form-control" name="www" value="<?=$json->embebible->cordova->www?>">
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-3 col-form-label">Plataforma</label>
                    <div class="col-sm-6">
                        <input type="text" class="form-control" name="plataforma" value="<?=$json->embebible->cordova->plataforma?>">
                    </div>
                </div>
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" name="config" id="ce-config">
                    <label class="custom-control-label" for="ce-config">Configurar config.xml</label>
                </div>
            </div>
        </div>        
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" name="depuracion" checked id="ce-depuracion">
            <label class="custom-control-label" for="ce-depuracion">Depuración</label>
        </div>
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" name="embebibles" checked id="ce-embebibles">
            <label class="custom-control-label" for="ce-embebibles">Integrar vistas embebibles</label>
        </div>
        <div class="custom-control custom-checkbox mb-3">
            <input type="checkbox" class="custom-control-input" name="limpiar" id="ce-limpiar">
            <label class="custom-control-label" for="ce-limpiar">Limpiar directorios de salida</label>
        </div>
<?php
        if(!function_exists('shell_exec')) {
?>
        <p>¡shell_exec() no está habilitado</p>
<?php
        }
    }

    /**
     * Ejecuta el asistente.
     * @var object $param Parámetros recibidos desde el formulario.
     */
    public function ejecutar($param) {
        $rutaAplicacion='aplicaciones/'.gestor::obtenerNombreAplicacion().'/';

        //Almacenar parámetros en el JSON para la próxima ejecución
        $this->actualizarJson($param);

        if(!$param->inicio) gestor::error('Ingresá el nombre de la vista inicial.');

        $inicio=preg_replace('/[^a-z0-9 _\.\/-]/i','',$param->inicio).'.html';
        if(!file_exists(_produccion.$rutaAplicacion.'cliente/vistas/'.$inicio)) gestor::error('La vista inicial no existe.');

        //Primero, construir aplicación
        asistentes::obtenerAsistente('construir-produccion')
            ->ejecutar($param);

        //Limpiar directorio
        if($param->limpiar) {
            $archivos=buscarArchivos(_embeber,'*.*');
            foreach($archivos as $archivo) unlink($archivo);
        }
        
        //Copiar todo excepto archivos PHP
        $tipos=['*.html','*.jpg','*.png','*.gif','*.svg','*.js','*.css'];
        copiar(_produccion,$tipos,_embeber);

        //Remover directorios innecesarios
        eliminarDir(_embeber.'temp/');
        eliminarDir(_embeber.'servidor/');

        //Intentar configurar index-cordova.html

        $html=file_get_contents(_desarrollo.'index-cordova.html');

        file_put_contents(_embeber.'index-cordova.html',preg_replace([
            '/_nombreApl=".+?"/',
            '/_vistaInicial=".+?"/',
        ],[
            '_nombreApl="'.gestor::obtenerNombreAplicacion().'"',
            '_vistaInicial="'.$inicio.'"'
        ],$html));

        if($param->www) {
            $dir=$param->www;
            if(substr($dir,-1)!='/'&&substr($dir,-1)!='\\') $dir.='/';

            //config.xml
            if($param->config) {
                $ruta=$dir.'../config.xml';
                $xml=file_get_contents($ruta);
                $xml=preg_replace('/(<content .*?)src=".+?"(.*?>)/s','\1src="index-cordova.html"\2',$xml);
                file_put_contents($ruta,$xml);
            }

            //Limpiar directorio
            if($param->limpiar) {
                $archivos=buscarArchivos($dir,'*.*');
                foreach($archivos as $archivo) unlink($archivo);
            }

            //Copiar
            copiar(_embeber,'*.*',$dir);
            
            //Ejecutar        
              
            chdir($dir);
            
            $registro=__DIR__.'/../exec.log';
            
            $pl=$param->plataforma;
            if(!$pl) $pl='android';

            $comando='cordova prepare '.escapeshellarg($pl).' 2>&1';
            $o=shell_exec($comando);
            file_put_contents($registro,'# '.$comando.PHP_EOL.trim($o).PHP_EOL.PHP_EOL,FILE_APPEND);

            $comando='cordova run '.escapeshellarg($pl).' 2>&1';
            $o=shell_exec($comando);
            file_put_contents($registro,'# '.$comando.PHP_EOL.trim($o).PHP_EOL.PHP_EOL,FILE_APPEND);
        }
    }
    
    protected function actualizarJson($param) {
        $json=gestor::obtenerJsonAplicacion();
        $json->embebible=[
            'inicio'=>$param->inicio,
            'cordova'=>[
                'www'=>$param->www,
                'plataforma'=>$param->plataforma
            ]
        ];
        gestor::actualizarJsonAplicacion($json);  
    }
}