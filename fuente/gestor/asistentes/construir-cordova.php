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
                        <select class="custom-select" name="plataforma" onchange="gestor.plataformaSeleccionada(this)">
                            <option <?=!$json->embebible->cordova->plataforma||$json->embebible->cordova->plataforma=='android'?'selected':''?>>android</option>
                            <option <?=$json->embebible->cordova->plataforma=='ios'?'selected':''?>>ios</option>
                            <option <?=$json->embebible->cordova->plataforma=='electron'?'selected':''?>>electron</option>
                        </select>
                    </div>
                </div>
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" name="config" id="ce-config">
                    <label class="custom-control-label" for="ce-config">Configurar config.xml</label>
                </div>
            </div>
        </div>        
        <div class="form-group row">
            <label class="col-3 col-form-label">Incluir módulos</label>
            <div class="col-sm-9">
                <!--TODO Listado de módulos disponibles (checkbox)-->
                <textarea class="form-control" name="modulos" rows="4" placeholder="Uno por línea."><?=$json->embebible->modulos?></textarea>
            </div>
        </div>
        <div class="form-inline">
            <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" name="ejecutar" id="ce-ejecutar" checked>
                <label class="custom-control-label" for="ce-ejecutar">Ejecutar en </label>
            </div>
            <input type="text" class="form-control ml-2 form-control-sm" name="destino" value="<?=$json->embebible->cordova->destino?>">
            <em class="d-inline-block ml-2">(Opcional)</em>
        </div>
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" name="depuracion" <?=!$json->embebible->depuracion?'checked':''?> id="ce-depuracion">
            <label class="custom-control-label" for="ce-depuracion">Depuración</label>
        </div>
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" name="embebibles" <?=!$json->embebible->embebibles?'checked':''?> id="ce-embebibles">
            <label class="custom-control-label" for="ce-embebibles">Integrar vistas embebibles</label>
        </div>
        <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" name="limpiar" id="ce-limpiar">
            <label class="custom-control-label" for="ce-limpiar">Limpiar directorios de salida (<em>&iexcl;Incluso <code>www</code>!</em>)</label>
        </div>
        <div class="custom-control custom-checkbox mb-2">
            <input type="checkbox" class="custom-control-input" name="clean" id="ce-clean">
            <label class="custom-control-label" for="ce-clean">Ejecutar <code>cordova clean</code></label>
        </div>
        <div class="custom-control custom-radio">
            <input type="radio" class="custom-control-input" name="accion" value="normal" id="accion-normal" <?=!$json->embebible->accion||$json->embebible->accion=='normal'?'checked':''?>>
            <label class="custom-control-label" for="accion-normal">Construir y ejecutar</label>
        </div>
        <div class="custom-control custom-radio">
            <input type="radio" class="custom-control-input" name="accion" value="construir" id="accion-construir" <?=$json->embebible->accion=='construir'?'checked':''?>>
            <label class="custom-control-label" for="accion-construir">Solo construir, no ejecutar</label>
        </div>
        <div class="custom-control custom-radio">
            <input type="radio" class="custom-control-input" name="accion" value="ejecutar" id="accion-ejecutar" <?=$json->embebible->accion=='ejecutar'?'checked':''?>>
            <label class="custom-control-label" for="accion-ejecutar">Solo ejecutar, no volver a construir</label>
        </div>
        <div class="custom-control custom-radio mb-2">
            <input type="radio" class="custom-control-input" name="accion" value="ninguna" id="accion-ninguna" <?=$json->embebible->accion=='ninguna'?'checked':''?>>
            <label class="custom-control-label" for="accion-ninguna">No construir ni ejecutar, solo copiar los archivos</label>
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
        $rutaAplicacion='aplicaciones/'.gestor::obtenerNombreAplicacion().'/';

        //Almacenar parámetros en el JSON para la próxima ejecución
        $this->actualizarJson($param);

        if($param->accion=='normal'||$param->accion=='construir'||$param->accion=='ninguna') {
            if(!$param->inicio) gestor::error('Ingresá el nombre de la vista inicial.');

            //Primero, construir aplicación
            asistentes::obtenerAsistente('construir-produccion')
                ->ejecutar($param,false,true);

            $inicio=preg_replace('/[^a-z0-9 _\.\/-]/i','',$param->inicio).'.html';
            if(!file_exists(_produccion.$rutaAplicacion.'cliente/vistas/'.$inicio)) gestor::error('La vista inicial no existe o no es una vista Cordova.');

            //Limpiar directorio
            if($param->limpiar) {
                $archivos=buscarArchivos(_embeber,'{*,.[!.]*,..?*}',null,true,true,true);            
                eliminarTodo($archivos);
            }
            
            //Copiar todo excepto archivos PHP
            $tipos=['*.html','*.jpg','*.png','*.gif','*.svg','*.js','*.css'];
            copiar(_produccion,$tipos,_embeber);

            //Remover directorios innecesarios
            eliminarDir(_embeber.'temp/');
            eliminarDir(_embeber.'servidor/');

            //Intentar configurar index-cordova.html

            $html=file_get_contents(_fuente.'index-cordova.html');

            file_put_contents(_embeber.'index-cordova.html',preg_replace_array([
                '/_nombreApl=".*?"/'=>'_nombreApl="'.gestor::obtenerNombreAplicacion().'"',
                '/_vistaInicial=".*?"/'=>'_vistaInicial="'.$inicio.'"'
            ],$html));

            if($param->www) {
                $dir=$param->www;
                if(substr($dir,-1)!='/'&&substr($dir,-1)!='\\') $dir.='/';

                //config.xml
                if($param->config) {
                    $ruta=$dir.'../config.xml';
                    $xml=file_get_contents($ruta);
                    $xml=preg_replace('/(<content .*?)src=".+?"(.*?>)/s','\1src="index.html"\2',$xml);

                    if($param->plataforma=='electron') {
                        //Inicializar settings.json
                        if(!preg_match('/"ElectronSettingsFilePath"/',$xml)) {
                            if(!preg_match('/<platform .*?name="electron".*?>/si',$xml)) {
                                $xml=str_replace('</widget>','    <platform name="electron">
        <preference name="ElectronSettingsFilePath" value="electron-settings.json" />
    </platform>
</widget>',$xml);
                            } else {
                                $xml=preg_replace('/(<platform .*?name="electron".*?>)/si','$1
        <preference name="ElectronSettingsFilePath" value="electron-settings.json" />',$xml);
                            }

                            copy(_desarrollo.'electron-settings.json',$dir.'../electron-settings.json');
                        }
                    }

                    file_put_contents($ruta,$xml);
                }

                //Limpiar directorio
                if($param->limpiar) {
                    $archivos=buscarArchivos($dir,'{*,.[!.]*,..?*}',null,true,true,true);
                    eliminarTodo($archivos);
                }

                //Copiar
                copiar(_embeber,'{*,.[!.]*,..?*}',$dir);

                //Renombrar index-cordova por index.html (Electron, al menos por un error conocido a la fecha, no respeta <content src>)
                rename($dir.'index-cordova.html',$dir.'index.html');
            }
        }
        
        //Construir y ejecutar
        if($param->www) {
            $dir=dirname($param->www);
            chdir($dir);
            registroExec('CWD',getcwd());

            $pl=$param->plataforma;
            if(!$pl) $pl='android';

            if($param->clean) {
                $comando='cordova clean '.escapeshellarg($pl).' --no-update-notifier 2>&1';
                $o=shell_exec($comando);
                registroExec($comando,$o);
            }
        
            if($param->accion=='normal'||$param->accion=='ejecutar') {
                $destino='';
                if($param->destino) $destino='--target='.escapeshellarg($param->destino);

                if($param->accion=='ejecutar') $destino.=' --nobuild';

                $comando='run '.escapeshellarg($pl).' '.$destino.' --no-update-notifier'.(!$param->depuracion?' --release':'').' 2>&1';
                
                $esperar=$pl!='electron';
                $o=ejecutar('cordova',$comando,$esperar);
                registroExec('cordova '.$comando,$o);
            } elseif($param->accion=='construir') {         
                $comando='cordova prepare '.escapeshellarg($pl).' --no-update-notifier'.(!$param->depuracion?' --release':'').' 2>&1';
                $o=shell_exec($comando);
                registroExec($comando,$o);
            }
        }
    }
    
    protected function actualizarJson($param) {
        $json=gestor::obtenerJsonAplicacion();
        $json->embebible=[
            'inicio'=>$param->inicio,
            'modulos'=>$param->modulos,
            'accion'=>$param->accion,
            'cordova'=>[
                'www'=>$param->www,
                'plataforma'=>$param->plataforma,
                'destino'=>$param->destino,
                'depuracion'=>$param->depuracion,
                'embebibles'=>$param->embebibles
            ]
        ];
        gestor::actualizarJsonAplicacion($json);  
    }
}