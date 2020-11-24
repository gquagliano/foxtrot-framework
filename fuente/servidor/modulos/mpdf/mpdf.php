<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

namespace modulos;

defined('_inc') or exit;

include_once(__DIR__.'/random_compat/lib/random.php');
include(__DIR__ .'/vendor/autoload.php');

/**
 * Módulo concreto mpdf. Implementa mPDF versión 8.0. El propósito de este módulo es abstaer la creación de archivos PDF y ofrecer métodos útiles como plantillas, etc.
 */
class mpdf extends \modulo {
    /** @var \Mpdf\Mpdf $mpdf Instancia de mPDF */
    protected $mpdf;

    /**
     * Crea un nuevo libro.
     * @param string $formato Formato de página.
     * @param array $config Parámetros de configuración adicionales.
     * @return \modulos\mpdf
     */
    public function crear($formato='A4',$config=null) {
        $predeterminado=['tempDir'=>__DIR__.'/temp/','format'=>$formato];
        if($config) $predeterminado=array_merge($predeterminado,$config);
        $this->mpdf=new \Mpdf\Mpdf($predeterminado);

        $this->configurar([
            'setAutoTopMargin'=>'stretch',
            'setAutoBottomMargin'=>'stretch',
            'shrink_tables_to_fit'=>0
        ]);

        return $this;
    }

    /**
     * Devuelve la instancia de mPDF.
     * @return \Mpdf\Mpdf
     */
    public function obtenerInstancia() {
        return $this->mpdf;
    }
    
    /**
     * Escribe el código HTML en el archivo PDF.
     * @return \modulos\mpdf
     */
    public function escribirHtml($html) {
        $this->mpdf->WriteHTML($html);
        return $this;
    }

    /**
     * Agrega un salto de página.
     * @param string $formato Formato de la nueva página.
     * @return \modulos\mpdf
     */
    public function gregarPagina($formato='A4') {
        $this->mpdf->AddPage($formato);
        return $this;
    }

    /**
     * Envía el archivo PDF al cliente.
     * @return \modulos\mpdf
     */
    public function enviar() {
        $this->mpdf->Output();
        return $this;
    }

    /**
     * Guarda el archivo PDF.
     * @param string $ruta Ruta absoluta de destino.
     * @return \modulos\mpdf
     */
    public function guardar($ruta) {
        $this->mpdf->Output($ruta,'F');
        return $this;
    }

    /**
     * Establece un texto de marca de agua.
     * @param string $texto Texto.
     * @param array $config Configuración adicional.
     * @return \modulos\mpdf
     */
    public function marcaDeAgua($texto,$config=null) {
        $parametros=[
            'SetWatermarkText'=>[$texto],
            'showWatermarkText'=>true,
            'watermarkTextAlpha'=>.5
        ];
        if($config) $parametros=array_merge($parametros,$config);
        $this->configurar($parametros);
        return $this;
    }

    /**
     * Establece el fondo de la página.
     * @param string $ruta Ruta absoluta de la imagen de fondo.
     * @return \modulos\mpdf
     */
    public function establecerFondo($ruta) {
        $this->configurar([
            'SetWatermarkImage'=>[$ruta,1,'P',[0,0]],
            'showWatermarkImage'=>true,
            'watermarkImgBehind'=>true
        ]);
        return $this;
    }

    /**
     * Aplica los parámetros de configuración especificados.
     * @param array $parametros Array asociativo [propiedad/método=>valor].
     * @return \modulos\mpdf
     */
    public function configurar($parametros) {
        foreach($parametros as $clave=>$valor) {
            if(property_exists($this->mpdf,$clave)) {
                $this->mpdf->$clave=$valor;
            } elseif(method_exists($this->mpdf,$clave)) {
                call_user_func_array([$this->mpdf,$clave],$valor);
            }
        }
        return $this;
    }
}