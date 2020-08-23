<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

//Script de PRUEBA para crear un ABMC a partir del modelo de datos

defined('_inc') or exit;

class abmc extends asistente {
    var $opcionGenerarConsulta=true;
    var $opcionGenerarFormulario=true;
    var $opcionActualizarModelo;
    var $ruta='';
    var $nombreModelo;
    var $nombreControlador;
    var $modelo;
    var $rutaVistas;
    var $rutaJs;
    var $rutaPhp;
    var $rutaModelo;
    var $json;
    var $singular;
    var $titulo;
    var $claseModelo;

    private function validarOpciones($opc) {
        if(!$opc['m'])  $this->error('El parámetro -m es requerido.');

        if($opc['c']||$opc['f']) {
            //Por defecto, se hacen ambos
            //Si se incluye uno de los dos, hacer solo lo que se haya especificado
            $this->opcionGenerarConsulta=$opc['c'];
            $this->opcionGenerarFormulario=$opc['f'];
        }
        $this->opcionActualizarModelo=!$opc['o'];

        $this->nombreModelo=$opc['m'];
        $this->titulo=$opc['t']?$opc['t']:ucfirst($this->nombreModelo);
        
        $this->claseModelo='\\aplicaciones\\'.$this->aplicacion.'\\modelo\\'.$this->nombreModelo;

        if(!class_exists($this->claseModelo)) $this->error('El parámetro -m es inválido.');

        $c=$this->claseModelo;
        $this->modelo=new $c;

        $this->ruta=$opc['r']?$opc['r'].'/':'';
    }

    public function ejecutar() {
        $opciones=obtenerArgumentos();

        $aplicacion=validarParametroAplicacion($opciones);        
        foxtrot::inicializar($aplicacion);

        $this->validarOpciones($opciones);

        $this->plural=$this->nombreModelo;
        $this->nombreControlador=$this->nombreModelo; //Por defecto, mismo nombre
        
        $this->rutaVistas=_vistasAplicacion.$this->ruta;
        $this->rutaJs=_controladoresClienteAplicacion.$this->ruta;
        $this->rutaPhp=_controladoresServidorAplicacion.$this->nombreControlador.'.pub.php'; //Por defecto, mismo nombre
        $this->rutaModelo=_modeloAplicacion.$this->nombreModelo.'.php';

        if(!file_exists($this->rutaVistas)) mkdir($this->rutaVistas,0755,true);
        if(!file_exists($this->rutaJs)) mkdir($this->rutaJs,0755,true);

        $this->singular=$this->modelo->singular();
        define('_plantillas',__DIR__.'/abmc/');

        $this->json=json_decode(file_get_contents(_raizAplicacion.'aplicacion.json'));

        if($this->opcionGenerarFormulario) $this->generarFormulario();

        if($this->opcionGenerarConsulta) $this->generarConsulta();

        if(!file_exists($this->rutaPhp)) $this->generarControladorServidor();

        if($this->opcionActualizarModelo) $this->actualizarModelo();
        
        //Guardar los cambios que ha sufrido el JSON
        file_put_contents(_raizAplicacion.'aplicacion.json',json_encode($this->json));
    }

    private function generarFormulario() {
        $archivoVista=$this->rutaVistas.$this->singular.'.php';
        $archivoCss=$this->rutaVistas.$this->singular.'.css';
        $archivoJs=$this->rutaJs.$this->singular.'.js';

        if(!file_exists($archivoVista)) $this->generarVistaFormulario($archivoVista,$archivoCss);

        if(!file_exists($archivoJs)) $this->generarControladorFormulario($archivoJs);
    }

    private function generarConsulta() {
        $archivoVista=$this->rutaVistas.$this->plural.'.php';
        $archivoCss=$this->rutaVistas.$this->plural.'.css';
        $archivoJs=$this->rutaJs.$this->plural.'.js';

        if(!file_exists($archivoVista)) $this->generarVistaConsulta($archivoVista,$archivoCss);

        if(!file_exists($archivoJs)) $this->generarControladorConsulta($archivoJs);
    }

    private function extraerCampo($codigo) {
        preg_match('#/\*campo(.+?)\*/#ims',$codigo,$coincidencias);
        return $coincidencias;
    }

    private function generarVistaFormulario($archivo,$archivoCss) {
        $this->generarVista('form',$this->singular,$archivo,$archivoCss);
    }

    private function generarVistaConsulta($archivo,$archivoCss) {
        $this->generarVista('consulta',$this->plural,$archivo,$archivoCss);
    }

    private function generarVista($plantilla,$nombre,$archivo,$archivoCss) {
        //Construir vista

        $json=file_get_contents(__DIR__.'/abmc/'.$plantilla.'.json');
        $html=file_get_contents(__DIR__.'/abmc/'.$plantilla.'.php');

        $plantillaCampoJson=$this->extraerCampo($json);
        $plantillaCampoHtml=$this->extraerCampo($html);
        $camposJson='';
        $camposHtml='';
        $i=1;

        $id=str_replace('/','-',$this->ruta.$nombre).'-';

        foreach($this->modelo->obtenerCampos() as $nombreCampo=>$campo) {
            if($nombreCampo=='e'||$nombreCampo=='id') continue;

            $etiqueta=$campo->etiqueta?$campo->etiqueta:ucfirst(str_replace('_',' ',$nombreCampo));

            $vars=[
                'idVista'=>$id,
                'n'=>$i,
                'tamano'=>$campo->tamano?$campo->tamano:'10',
                'campo'=>$nombreCampo,
                'etiqueta'=>$etiqueta,
                'autofoco'=>$i==1?'autofoco':'',
                'autofocoBool'=>$i==1?'true':'false',
                'req'=>$campo->requerido?'*':'',
                'columna'=>$nombreCampo,
                'encabezado'=>$etiqueta
            ];

            $camposJson.=$this->reemplazarVariables($plantillaCampoJson[1],$vars);
            $camposHtml.=$this->reemplazarVariables($plantillaCampoHtml[1],$vars);

            $i++;
        }

        $json=str_replace($plantillaCampoJson[0],$camposJson,$json);
        $html=str_replace($plantillaCampoHtml[0],$camposHtml,$html);

        $vars=[
            'idVista'=>$id,
            'nombreVista'=>$this->ruta.$nombre
        ];
        $json=$this->reemplazarVariables($json,$vars);
        $html=$this->reemplazarVariables($html,$vars);
        
        //Reemplazar JSON en el HTML
        $html=str_replace('{json}',str_replace('\'','\\\'',json_encode(json_decode($json))),$html);

        file_put_contents($archivo,$html);

        //Css

        if(!file_exists($archivoCss)) {
            $css=file_get_contents(__DIR__.'/abmc/'.$plantilla.'.css');

            $css=$this->reemplazarVariables($css,[
                'idVista'=>$id
            ]);

            file_put_contents($archivoCss,$css);
        }

        //Agregar al JSON de la aplicación
        $prop=$this->ruta.$nombre;
        $this->json->vistas->$prop=[
            'tipo'=>'independiente',
            'cliente'=>'web'
        ];
    }

    private function generarControladorFormulario($archivo) {
        $this->generarControlador('form',$this->singular,$archivo);
    } 

    private function generarControladorConsulta($archivo) {
        $this->generarControlador('consulta',$this->plural,$archivo);
    } 

    private function generarControlador($plantilla,$nombre,$archivo) {
        $js=file_get_contents(__DIR__.'/abmc/'.$plantilla.'.js');

        $js=$this->reemplazarVariables($js,[
            'nombreVista'=>$this->ruta.$nombre
        ]);

        file_put_contents($archivo,$js);
    }

    private function generarControladorServidor() {
        $php=file_get_contents(__DIR__.'/abmc/controlador.php');

        $requeridos=[];
        foreach($this->modelo->obtenerCampos() as $nombre=>$campo) {
            if($nombre=='e'||$nombre=='id'||!$campo->requerido) continue;
            $requeridos[]='\''.$nombre.'\'';
        }

        $php=$this->reemplazarVariables($php,[
            'claseModelo'=>$this->claseModelo,
            'aliasModelo'=>'modelo'.ucfirst($this->nombreControlador),
            'requeridos'=>implode(',',$requeridos)
        ]);

        file_put_contents($this->rutaPhp,$php);
    }

    private function actualizarModelo() {
        $php=file_get_contents($this->rutaModelo);

        preg_match('/^\s*namespace .+?;/m',$php,$coincidencias);
        $namespace=$coincidencias[0];

        //Hacemos que el modelo extienda modeloBase
        if(preg_match('/^(\s*)class '.$this->nombreModelo.' extends \\\\modelo/m',$php,$coincidencias)) {
            $php=str_replace($coincidencias[0],$coincidencias[1].'class '.$this->nombreModelo.' extends modeloBase',$php);
        }

        //Agregar use
        if(!preg_match('/use aplicaciones\\\\'.$this->aplicacion.'\\\\modeloBase;/m',$php)) {            
            $php=str_replace($namespace,$namespace.PHP_EOL.PHP_EOL.'use aplicaciones\\'.$this->aplicacion.'\\modeloBase;',$php);
        }

        //Si no lo incluye, agregar include() debajo de namespace
        if(!preg_match('/include_once\(_servidorAplicacion.\'modeloBase.php\'\);/',$php)) {            
            $php=str_replace($namespace,$namespace.PHP_EOL.PHP_EOL.'include_once(_servidorAplicacion.\'modeloBase.php\');',$php);
        }
        
        //Reemplazar
        file_put_contents($this->rutaModelo,$php);

        //Agregar modeloBase
        $ruta=_servidorAplicacion.'modeloBase.php';
        if(!file_exists($ruta)) {
            $codigo=file_get_contents(__DIR__.'/abmc/modeloBase.php');
            $codigo=$this->reemplazarVariables($codigo);
            file_put_contents($ruta,$codigo);
        }
    }   

    private function reemplazarVariables($codigo,$adicionales=[]) {
        $vars=array_merge([
            'titulo'=>$this->titulo,
            'controlador'=>$this->nombreControlador,
            'singular'=>$this->singular,
            'nombreApl'=>$this->aplicacion,
            'tema'=>$this->json->tema?$this->json->tema:'en-blanco',
            'nombreSingular'=>$this->ruta.$this->singular,
            'nombrePlural'=>$this->ruta.$this->plural,
        ],$adicionales);
        
        //Agregar { }
        $reemplazar=[];
        foreach($vars as $var=>$valor) $reemplazar['{'.$var.'}']=$valor;

        return str_replace_array($reemplazar,$codigo);
    }
}