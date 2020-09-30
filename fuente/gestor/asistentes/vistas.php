<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Asistente concreto para gestión de las vistas.
 */
class vistas extends asistente {
    /**
     * Devuelve los parámetros del asistente. Debe devolver un objeto con las propiedades [titulo,visible=>bool].
     * @return object
     */
    public static function obtenerParametros() {
        //TODO Agregar posibilidad de agregar comandos en el listado de vistas (y en el futuro en los listados de modelos y controladores) a fin de desacoplar de la clase gestor
        return (object)[
            'visible'=>false
        ];
    }

    /**
     * Elimina una vista.
     * @var string $nombre Nombre de la vista.
     */
    public function eliminar($nombre) {
        $ruta=_raiz.'aplicaciones/'.gestor::obtenerNombreAplicacion().'/';

        $archivos=glob($ruta.'cliente/vistas/'.$nombre.'.*');
        foreach($archivos as $archivo) unlink($archivo);

        //Si el directorio quedó vacío, eliminarlo también
        $this->eliminarDirVacio($ruta.'cliente/vistas/'.dirname($nombre));

        $rutaJson=$ruta.'aplicacion.json';
        $json=json_decode(file_get_contents($rutaJson));

        foreach($json->vistas as $clave=>$valor)
            if($clave==$nombre)
                unset($json->vistas->$clave);

        file_put_contents($rutaJson,json_encode($json));

        //Eliminar el controlador
        $archivo=$ruta.'cliente/controladores/'.$nombre.'.js';
        if(file_exists($archivo)) unlink($archivo);

        //Si el directorio quedó vacío, eliminarlo también
        $this->eliminarDirVacio($ruta.'cliente/controladores/'.dirname($nombre));
    }

    /**
     * Elimina el directorio y la ruta hasta el mismo, si está vacío.
     */
    private function eliminarDirVacio($dir) {        
        while(1) {            
            $archivos=glob($dir.'/*');
            if(!count($archivos)) {
                rmdir($dir);
                //Subir un nivel y eliminar también si está vacío
                $dir=dirname($dir);
            } else {
                break;
            }
        }
    }

    /**
     * Renombra una vista.
     * @var string $nombre Nombre de la vista.
     * @var string $nuevoNombre Nuevo nombre de la vista.
     */
    public function renombrar($nombre,$nuevoNombre) {
        //TODO Validar que el destino no exista
        $this->duplicar($nombre,$nuevoNombre);
        $this->eliminar($nombre);
    }

    /**
     * Actualiza el código provisto para cambiar el nombre de la vista/controlador.
     * @param string $nombre
     * @param string $nuevoNombre
     * @param string $html
     * @param string $css
     * @param string $js
     */
    protected function renombrarCodigo($nombre,$nuevoNombre,&$html,&$css,&$js) {
        $id=str_replace('/','-',$nombre);
        $nuevoId=str_replace('/','-',$nuevoNombre);

        $html=str_replace('/'.$nombre.'.css','/'.$nuevoNombre.'.css',$html);
        $html=preg_replace('/class="(.*?)'.$id.'-(.+?)"/m','class="$1'.$nuevoId.'-$2"',$html);
        $html=str_replace('inicializar("'.$nombre.'")','inicializar("'.$nuevoNombre.'")',$html);

        $css=str_replace('.'.$id.'-','.'.$nuevoId.'-',$css);

        $js=str_replace('"'.$nombre.'"','"'.$nuevoNombre.'"',$js);
    }

    /**
     * Duplica o clona una vista.
     * @var string $nombre Nombre de la vista.
     * @var string $nuevoNombre Nombre de la vista nueva.
     */
    public function duplicar($nombre,$nuevoNombre=null) {
        $ruta=_raiz.'aplicaciones/'.gestor::obtenerNombreAplicacion().'/';

        $rutaJson=$ruta.'aplicacion.json';
        $json=json_decode(file_get_contents($rutaJson));
        
        if(!$nuevoNombre) {
            //Buscar un nombre libre
            $dir='';
            $i=1;
            $base=$nombre.'-copia';
            if(strpos($nombre,'/')>0) {
                $dir=dirname($nombre).'/';
                $base=basename($nombre).'-copia';
            }
            do {
                $prueba=$dir.$base.($i>1?'-'.$i:'');
                $i++;
            } while(array_key_exists($prueba,$json->vistas));
            $nuevoNombre=$prueba;
        }

        $rutaHtml=$ruta.'cliente/vistas/'.$nombre;
        $nuevaRutaHtml=$ruta.'cliente/vistas/'.$nuevoNombre;
        if(file_exists($rutaHtml.'.html')) {
            $rutaHtml.='.html';
            $nuevaRutaHtml.='.html';
        } elseif(file_exists($rutaHtml.'.php')) {
            $rutaHtml.='.php';
            $nuevaRutaHtml.='.php';
        }
        $html=file_get_contents($rutaHtml);
        
        $rutaCss=$ruta.'cliente/vistas/'.$nombre.'.css';
        $nuevaRutaCss=$ruta.'cliente/vistas/'.$nuevoNombre.'.css';
        $css=file_get_contents($rutaCss);

        $rutaJs=$ruta.'cliente/controladores/'.$nombre.'.js';
        $nuevaRutaJs=$ruta.'cliente/controladores/'.$nuevoNombre.'.js';
        $js='';
        if(file_exists($rutaJs)) $js=file_get_contents($rutaJs);

        $this->renombrarCodigo($nombre,$nuevoNombre,$html,$css,$js);

        file_put_contents($nuevaRutaHtml,$html);
        file_put_contents($nuevaRutaCss,$css);
        if($js) file_put_contents($nuevaRutaJs,$js);

        $json->vistas->$nuevoNombre=clone $json->vistas->$nombre;
        file_put_contents($rutaJson,json_encode($json));
    }
}