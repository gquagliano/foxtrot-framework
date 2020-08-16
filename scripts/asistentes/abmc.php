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
    var $generarConsulta=true;
    var $generarForm=true;
    var $generarModelo;
    var $ruta='';
    var $nombreModelo;
    var $modelo;
    var $rutaVistas;
    var $rutaJs;
    var $rutaPhp;
    var $rutaModelo;
    var $json;
    var $singular;

    public function ejecutar() {
        $opciones=getopt('a:s:m:r:oac');

        $this->validarOpciones($opciones);
        
        $this->rutaVistas=_vistasAplicacion.$this->ruta;
        $this->rutaJs=_controladoresClienteAplicacion.$this->ruta;
        $this->rutaPhp=_controladoresServidorAplicacion.$this->nombreModelo.'.php';
        $this->rutaModelo=_modeloAplicacion.$this->nombreModelo.'.php';

        $this->singular=$this->modelo->singular();
        define('_plantillas',__DIR__.'/abmc/');

        $this->json=json_decode(file_get_contents(_raizAplicacion.'aplicacion.json'));

        if($this->generarForm) $this->generarForm();

        if($this->generarConsulta) $this->generarConsulta();

        if($this->generarModelo) $this->generarModelo();

        file_put_contents(_raizAplicacion.'aplicacion.json',json_encode($this->json));
    }

    private function generarForm() {
        $archivoVista=$this->rutaVistas.$this->singular.'.php';
        $archivoJs=$this->rutaJs.$this->singular.'.js';

        if(!file_exists($archivoVista)) {
            $this->generarFormVista($archivoVista);
        }

        if(!file_exists($archivoJs)) {
            $this->generarFormControlador($archivoJs);
        }
    }

    private function generarFormVista($archivo) {
        //Constuir JSON
        $json=json_decode(str_replace_array([
            '{nombre}'=>$this->singular,
            '{modelo}'=>$this->nombreModelo,
            '{ruta}'=>$this->ruta.$this->singular
        ],file_get_contents(_plantillas.'form.json')));
        
        $cuerpo=file_get_contents(_plantillas.'form-encabezado.html');

        $htmlCampo=file_get_contents(_plantillas.'form-campo.html');
        $jsonCampo=file_get_contents(_plantillas.'form-campo.json');

        $id=10;
        $primero=true;

        foreach($this->modelo->obtenerCampos() as $nombre=>$campo) {
            if($nombre=='e'||$nombre=='id') continue;

            $cuerpo.=str_replace_array([
                '{id1}'=>$id,
                '{id2}'=>$id+1,
                '{id3}'=>$id+2,
                '{id4}'=>$id+3,
                '{id5}'=>$id+4,
                '{etiqueta}'=>$campo->etiqueta?$campo->etiqueta:ucfirst(str_replace('_',' ',$nombre)),
                '{autofoco}'=>$primero?'autofoco':'',
                '{tamano}'=>$campo->tamano?$campo->tamano:'10'
            ],$htmlCampo);

            $json->componentes=array_merge($json->componentes,json_decode(str_replace_array([
                '{id1}'=>$id,
                '{id2}'=>$id+1,
                '{id3}'=>$id+2,
                '{id4}'=>$id+3,
                '{id5}'=>$id+4,
                '{autofoco}'=>$primero?'true':'false',
                '{tamano}'=>$campo->tamano?$campo->tamano:'10',
                '{nombre}'=>$this->singular,
                '{campo}'=>$nombre,
                '{modelo}'=>$this->nombreModelo
            ],$jsonCampo)));

            $id+=5;
            $primero=false;
        }

        $cuerpo.=file_get_contents(_plantillas.'form-pie.html');

        $cuerpo=str_replace_array([
            '{nombre}'=>$this->singular,
            '{modelo}'=>$this->nombreModelo,
            '{ruta}'=>$this->ruta.$this->singular
        ],$cuerpo);

        //Utilizar las plantillas del editor
        $html=str_replace_array([
            '{editor_tema}'=>'tema-'.($this->json->tema?$this->json->tema:'en-blanco'),
            '{editor_nombreVista}'=>$this->ruta.$this->singular
        ],file_get_contents(_editor.'plantillas/independiente.php'));

        $html=str_replace('<div id="foxtrot-cuerpo"></div>','<div id="foxtrot-cuerpo">'.$cuerpo.'</div>',$html);
        
        //Reemplazar JSON
        $html=preg_replace('/var jsonFoxtrot=\'.+?\';/s','var jsonFoxtrot=\''.str_replace('\'','\\\'',json_encode($json)).'\';',$html);

        file_put_contents($this->rutaVistas.$this->singular.'.php',$html);

        //CSS
        $css=$this->rutaVistas.$this->singular.'.css';
        if(!file_exists($css)) copy(__DIR__.'/abmc/form.css',$css);

        //Agregar al JSON de la aplicación
        $p=$this->singular;
        $this->json->vistas->$p=[
            'tipo'=>'independiente',
            'cliente'=>'web'
        ];
    }

    private function generarFormControlador($archivo) {
        file_put_contents(
            $this->rutaJs.$this->singular.'.js',
            str_replace_array(
                [
                    '{nombre}'=>$this->ruta.$this->singular,
                    '{modelo}'=>$this->nombreModelo
                ],
                file_get_contents(__DIR__.'/abmc/form.js')
            )
        );
    }

    private function generarConsulta() {

    }

    private function generarModelo() {

    }

    private function validarOpciones($opc) {
        if(!$opc['m']) {
            fwrite(STDERR,'El parámetro -m es requerido.'.PHP_EOL.PHP_EOL);
            exit;
        }

        if($opc['c']||$opc['a']) {
            $this->generarConsulta=$opc['c'];
            $this->generarForm=$opc['a'];
        }

        $this->generarModelo=!$opc['o'];

        $this->nombreModelo=$opc['m'];
        
        $clase='\\aplicaciones\\'.$this->aplicacion.'\\modelo\\'.$this->nombreModelo;

        if(!class_exists($clase)) {
            fwrite(STDERR,'El parámetro -m es inválido.'.PHP_EOL.PHP_EOL);
            exit;
        }

        $this->modelo=new $clase;

        $this->ruta=$opc['r']?$opc['r'].'/':'';
    }
}