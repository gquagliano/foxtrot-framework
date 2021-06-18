<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Asistente concreto para crear vistas y controladores de ABMC a partir de plantillas.
 */
class abmc extends asistente {
    var $opcionGenerarConsulta=true;
    var $opcionGenerarFormulario=true;
    var $ruta='';
    var $claseModelo;
    var $nombreModelo;
    var $nombreControlador;
    var $modelo;
    var $rutaVistas;
    var $rutaJs;
    var $rutaPhp;
    var $rutaModelo;
    var $json;
    var $plural;
    var $singular;
    var $titulo;
    var $multinivel=false;
    var $nivelAnterior=null;
    var $siguienteNivel=null;
    var $campoRelacion=null;

    /**
     * Devuelve los parámetros del asistente. Debe devolver un objeto con las propiedades [titulo,visible=>bool].
     * @return object
     */
    public static function obtenerParametros() {
        return (object)[
            'titulo'=>'ABMC'
        ];
    }

    /**
     * Imprime el formulario de configuración del asistente.
     */
    public function obtenerFormulario() {
?>
        <div class="form-group row">
            <label class="col-3 col-form-label">Modelo</label>
            <div class="col-sm-9">
                <select class="custom-select" name="modelo">
<?php
        foreach(gestor::obtenerModelos() as $modelo) echo '<option value="'.$modelo->nombre.'">'.$modelo->nombre.'</option>';
?>
                </select>
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Título</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="titulo" placeholder="Opcional">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Ruta</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="ruta" placeholder="Opcional, relativa a /desarrollo/aplicaciones/<?=gestor::obtenerNombreAplicacion()?>/cliente/vistas/">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Plural</label>
            <div class="col-sm-3">
                <input type="text" class="form-control" name="plural" placeholder="Opcional">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Singular</label>
            <div class="col-sm-3">
                <input type="text" class="form-control" name="singular" placeholder="Opcional">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Controlador</label>
            <div class="col-sm-9">
                <input type="text" class="form-control" name="controlador" placeholder="Opcional">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Generar</label>
            <div class="col-sm-9">                
                <div class="custom-control custom-checkbox custom-control-inline">
                    <input type="checkbox" class="custom-control-input" name="formulario" checked id="a-form">
                    <label class="custom-control-label" for="a-form">Formulario</label>
                </div>            
                <div class="custom-control custom-checkbox custom-control-inline">
                    <input type="checkbox" class="custom-control-input" name="consulta" checked id="a-consulta">
                    <label class="custom-control-label" for="a-consulta">Consulta</label>
                </div>    
                <div class="custom-control custom-checkbox custom-control-inline">
                    <input type="checkbox" class="custom-control-input" name="multinivel" id="a-multi">
                    <label class="custom-control-label" for="a-multi">Multinivel</label>
                </div>
            </div>
        </div>
        <div class="form-group row">
            <label class="col-3 col-form-label">Multinivel</label>
            <div class="col-sm-9">                
                <div class="form-group row">
                    <label class="col-3 col-form-label">Siguiente nivel</label>
                    <div class="col-sm-6">
                        <input type="text" class="form-control" name="siguiente" placeholder="Ejemplo: subrubros">
                    </div>
                </div>
                <div class="form-group row">
                    <label class="col-3 col-form-label">Nivel anterior</label>
                    <div class="col-sm-6">
                        <input type="text" class="form-control" name="anterior" placeholder="Ejemplo: rubros">
                    </div>
                </div>
                <div class="form-group row mb-0">
                    <label class="col-3 col-form-label">Relación</label>
                    <div class="col-sm-6">
                        <input type="text" class="form-control" name="anterior" placeholder="Ejemplo: idrubro">
                    </div>
                </div>
            </div>
        </div>
<?php
    }

    /**
     * Ejecuta el asistente.
     * @var object $param Parámetros recibidos desde el formulario.
     */
    public function ejecutar($param) {
        $this->validarOpciones($param);
        
        $this->rutaVistas=_vistasAplicacion.$this->ruta;
        $this->rutaJs=_controladoresClienteAplicacion.$this->ruta;
        $this->rutaPhp=_controladoresServidorAplicacion.$this->nombreControlador.'.pub.php'; //Por defecto, mismo nombre
        $this->rutaModelo=_modeloAplicacion.$this->rutaModelo.$this->nombreModelo.'.php';

        if(!file_exists($this->rutaVistas)) mkdir($this->rutaVistas,0755,true);
        if(!file_exists($this->rutaJs)) mkdir($this->rutaJs,0755,true);
        if(!file_exists(dirname($this->rutaPhp))) mkdir(dirname($this->rutaPhp),0755,true);

        $this->json=json_decode(file_get_contents(_raizAplicacion.'aplicacion.json'));

        if($this->opcionGenerarFormulario) $this->generarFormulario();

        if($this->opcionGenerarConsulta) $this->generarConsulta();

        if(!file_exists($this->rutaPhp)) $this->generarControladorServidor();
        
        //Guardar los cambios que ha sufrido el JSON
        file_put_contents(_raizAplicacion.'aplicacion.json',json_encode($this->json));
    }

    private function validarOpciones($opc) {
        if(!$opc->modelo) exit;

        $partes=\util::separarRuta($opc->modelo);
        $this->claseModelo=$opc->modelo;
        $this->rutaModelo=$partes->ruta;
        $this->nombreModelo=$partes->nombre;

        $this->modelo=\foxtrot::fabricarModelo($this->claseModelo);
        if(!$this->modelo) exit;

        $this->opcionGenerarConsulta=$opc->consulta;
        $this->opcionGenerarFormulario=$opc->formulario;
        
        $this->titulo=$opc->titulo?$opc->titulo:ucfirst($this->nombreModelo);

        $this->multinivel=$opc->multinivel;
        $this->siguienteNivel=$opc->siguiente;
        $this->nivelAnterior=$opc->anterior;
        $this->campoRelacion=$opc->relacion;

        $this->plural=$opc->plural;
        if(!$this->plural) $this->plural=$this->nombreModelo;

        $this->singular=$opc->singular;
        if(!$this->singular) $this->singular=$this->plural.'-edicion';

        $this->nombreControlador=$opc->controlador?$opc->controlador:$this->claseModelo; //Por defecto, mismo nombre que el modelo

        $this->ruta=trim($opc->ruta);
        if($this->ruta&&substr($this->ruta,-1)!='/') $this->ruta.='/';
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
        preg_match('#<!campo(.+?)!>#ims',$codigo,$coincidencias);
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
            if($nombreCampo=='e'||$nombreCampo=='id'||$nombreCampo=='fecha_alta'||$nombreCampo=='fecha_actualizacion'||$nombreCampo=='fecha_baja') continue;

            $etiqueta=$campo->etiqueta?$campo->etiqueta:ucfirst(str_replace('_',' ',$nombreCampo));

            $atributos='';
            $largoMaximo='null';

            if($campo->tipo=='cadena'&&$campo->longitud) {
                $atributos.=' maxlength="'.$campo->longitud.'"';
                $largoMaximo=$campo->longitud;
            }

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
                'encabezado'=>$etiqueta,
                'atributos'=>$atributos,
                'largoMaximo'=>$largoMaximo
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

        //CSS
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

    private function generarEspacioControlador($nombre,$publico) {
        $partes=\util::separarRuta($nombre);
        return \foxtrot::prepararNombreClase(gestor::obtenerEspacioAplicacion().$partes->ruta.($publico?'publico\\':''),true,true);        
    }

    private function generarControladorServidor() {
        $php=file_get_contents(__DIR__.'/abmc/controlador.php');

        $requeridos=[];
        $sql='';
        foreach($this->modelo->obtenerCampos() as $nombre=>$campo) {
            if($nombre=='e'||$nombre=='id'||$nombre=='fecha_alta'||$nombre=='fecha_actualizacion'||$nombre=='fecha_baja') continue;
            if($campo->requerido) $requeridos[]='\''.$nombre.'\'';
            if(preg_match('/cadena/',$campo->tipo)) $sql.=' or t.`'.$nombre.'` like @filtroParcial';
        }

        $clase=\foxtrot::prepararNombreClase($this->nombreControlador)->nombre;
        $espacio=$this->generarEspacioControlador($this->nombreControlador,true);
        
        $php=$this->reemplazarVariables($php,[
            'modelo'=>$this->claseModelo,
            'requeridos'=>implode(',',$requeridos),
            'sqlFiltros'=>$sql,
            'espacio'=>$espacio,
            'nombre'=>$clase
        ]);

        file_put_contents($this->rutaPhp,$php);
    }

    private function reemplazarVariables($codigo,$adicionales=[]) {
        $vars=array_merge([
            'titulo'=>$this->titulo,
            'controlador'=>$this->nombreControlador,
            'singular'=>$this->singular,
            'plural'=>$this->plural,
            'espacio'=>trim(gestor::obtenerEspacioAplicacion(),'\\'),
            'tema'=>$this->json->tema?$this->json->tema:'en-blanco',
            'nombreSingular'=>$this->ruta.$this->singular,
            'nombrePlural'=>$this->ruta.$this->plural,
            'siguiente'=>$this->siguienteNivel,
            'anterior'=>$this->nivelAnterior,
            'relacion'=>$this->campoRelacion
        ],$adicionales);
        
        //Agregar { }
        $reemplazar=[];
        foreach($vars as $var=>$valor) $reemplazar['{'.$var.'}']=$valor;

        $codigo=str_replace_array($reemplazar,$codigo);

        //Procesar condicionales multinivel, no-multinivel y volver-multinivel
        if(preg_match_all('#<!(multinivel|superior-multinivel|no-superior-multinivel|siguiente-multinivel|no-siguiente-multinivel|no-multinivel)(\n|\r\n)(.+?)!>(\n|\r\n)#ims',$codigo,$coincidencias)) {
            foreach($coincidencias[0] as $i=>$bloque) {
                $etiqueta=$coincidencias[1][$i];
                $interior=$coincidencias[3][$i];

                //Remover lo que no corresponda
                if((!$this->multinivel&&($etiqueta=='multinivel'||$etiqueta=='volver-multinivel'||$etiqueta=='superior-multinivel'||$etiqueta=='no-superior-multinivel'||$etiqueta=='siguiente-multinivel'||$etiqueta=='no-siguiente-multinivel'))||
                (!$this->nivelAnterior&&$etiqueta=='superior-multinivel')||
                ($this->nivelAnterior&&$etiqueta=='no-superior-multinivel')||
                (!$this->siguienteNivel&&$etiqueta=='siguiente-multinivel')||
                ($this->siguienteNivel&&$etiqueta=='no-siguiente-multinivel')||
                ($this->multinivel&&$etiqueta=='no-multinivel')) {
                    $codigo=str_replace($bloque,'',$codigo);
                    continue;
                }

                //Remover solo el comentario de lo que se mantiene
                $codigo=str_replace($bloque,$interior,$codigo);
            }
        }

        return $codigo;
    }
}