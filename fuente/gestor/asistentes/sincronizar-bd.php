<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

defined('_inc') or exit;

/**
 * Asistente concreto para sincronizar la base de datos.
 */
class sincronizarBd extends asistente {
    /** @var string $sql Registro de consultas ejecutadas. */
    protected $sql='';
    /** @var \bd $bd Instancia de la base de datos. */
    protected $bd;
    /** @var string[] $tablas Listado de tablas existentes. */
    protected $tablas;

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
            <label class="col-3 col-form-label">Modelo</label>
            <div class="col-sm-9">
                <select class="custom-select" name="modelo">
                    <option value="">Todos</option>
<?php
        foreach(gestor::obtenerModelos() as $modelo) echo '<option value="'.$modelo->nombre.'">'.$modelo->nombre.'</option>';
?>
                </select>
            </div>
        </div>
        <p>
            <strong>Base de datos:</strong> <?=configuracion::$nombreBd?configuracion::$nombreBd:'¡No configurada!'?> @ <?=(configuracion::$servidorBd?configuracion::$servidorBd:'localhost').':'.configuracion::$puertoBd?><br>
            <strong>Usuario:</strong> <?=configuracion::$usuarioBd?configuracion::$usuarioBd:'(Sin identificación)'?>
        </p>
        <div class="form-group">
            <label>Consultas ejecutadas:</label>
            <textarea class="form-control" readonly id="sincronizacion-sql" rows="6"></textarea>
        </div>
<?php
    }

    /**
     * Ejecuta el asistente.
     * @var object $param Parámetros recibidos desde el formulario.
     */
    public function ejecutar($param) {        
        $filtrar=$param->modelo;
        $aplicacion=gestor::obtenerNombreAplicacion();
        $this->bd=foxtrot::obtenerInstanciaBd();

        $this->tablas=[];
        $resultado=$this->bd->consulta('show tables from #__'.configuracion::$nombreBd);
        $this->verificarError();
        while($fila=$resultado->aArray()) $this->tablas[]=array_values($fila)[0];

        $this->registro('-- '.date('d/m/Y H:i:s').' --'.PHP_EOL
                        .'-- Aplicación: '.$aplicacion.PHP_EOL
                        .'-- Base de datos: '.configuracion::$nombreBd);

        $clasesCreadas=[];
        foreach(gestor::obtenerModelos() as $modelo) {
            if($filtrar&&$filtrar!=$modelo->nombre) continue;
            $clase=$modelo->clase;
            $obj=new $clase;
            $creada=$this->procesar($obj);
            if($creada) $clasesCreadas[]=$obj;
        }

        //Ejecutar instalar() en los modelos cuyas tablas fueron recién creadas
        foreach($clasesCreadas as $clase) $this->registro(call_user_func([$clase,'instalar']));
        
        gestor::ok($this->sql);
    }

    protected function obtenerTipo($modelo,$campo,$parametros) {
        $tipo=$parametros->tipo;

        $predeterminado=null;
        if(isset($parametros->predeterminado)) $predeterminado=$parametros->predeterminado;
        if($predeterminado===true) {
            //Etiqueta presente sin valor
            $predeterminado='\'\'';
        } elseif($predeterminado===null) {
            $predeterminado='NULL';
        } elseif(preg_match('/[^0-9\.]/',$predeterminado)) {
            $predeterminado='\''.$predeterminado.'\'';
        }

        if($tipo=='texto') return 'TEXT';

        if($tipo=='fecha') return 'DATETIME';

        if($parametros->busqueda) return 'VARCHAR(255) NOT NULL DEFAULT \'\'';

        if($parametros->contrasena) return 'TEXT';
        
        if(preg_match('/cadena\(([0-9]+)\)/',$tipo,$coincidencias)) {
            return 'VARCHAR('.$coincidencias[1].') NULL DEFAULT '.$predeterminado;
        }

        if(preg_match('/logico/',$tipo,$coincidencias)) {
            return 'TINYINT(1) NOT NULL DEFAULT '.($predeterminado=='1'||$predeterminado=='true'?'1':'0');
        }
        
        if(preg_match('/entero(\(([0-9]+)\))?( sin signo)?/',$tipo,$coincidencias)) {
            $long=$coincidencias[2]?$coincidencias[2]:4;
            $tipos=[1=>'TINYINT',2=>'SMALLINT',3=>'MEDIUMINT',4=>'INT',5=>'INT',6=>'INT',7=>'INT',8=>'BIGINT'];
            return $tipos[$long].'('.$long.')'.
                (trim($coincidencias[3])=='sin signo'?' UNSIGNED':'').
                ' NULL DEFAULT '.$predeterminado;
        }

        if(preg_match('/decimal\(([0-9\.,]+)\)( sin signo)?/',$tipo,$coincidencias)) {
            //Admite punto o coma
            $coincidencias[1]=str_replace('.',',',$coincidencias[1]);
            return 'DECIMAL('.$coincidencias[1].')'.
                (trim($coincidencias[2])=='sin signo'?' UNSIGNED':'').
                ' NULL DEFAULT '.$predeterminado;
        }

        gestor::error([
            'error'=>'El campo '.$modelo.'::$'.$campo.' tiene un tipo inválido.',
            'sql'=>$this->sql
        ]);
    }

    protected function obtenerIndice($modelo,$campo,$parametros) {
        if(!$parametros->indice) return false;
        
        $long='';
        if($parametros->tipo=='texto') $long='(255)'; //TODO Configurable

        $indice='';
        if($parametros->indice==='unico') $indice.='UNIQUE ';
        $indice.='INDEX `'.$campo.'` (`'.$campo.'`'.$long.')';

        return $indice;
    }

    protected function compararCampo($parametros,$campoBd) {
        $tipo=$parametros->tipo;

        $predeterminado=null;
        if(isset($parametros->predeterminado)) $predeterminado=$parametros->predeterminado;
        if($predeterminado===true) $predeterminado=''; //Etiqueta presente sin valor = cadena vacía
        
        if($parametros->busqueda) {
            if(!preg_match('/varchar\(255\)/i',$campoBd->Type)) return false;
            $predeterminado='';
        }

        if($parametros->contrasena) {
            if(!preg_match('/text/i',$campoBd->Type)) return false;
            $predeterminado='';
        }

        if($tipo=='texto'&&!preg_match('/text/i',$campoBd->Type)) return false;
        
        if(preg_match('/cadena\(([0-9]+)\)/',$tipo,$coincidencias)&&!preg_match('/varchar\('.$coincidencias[1].'\)/i',$campoBd->Type)) return false;
        
        if(preg_match('/entero(\(([0-9]+)\))?( sin signo)?/',$tipo,$coincidencias)) {
            $long=$coincidencias[2]?$coincidencias[2]:4;
            $tipos=[1=>'tinyint',2=>'smallint',3=>'mediumint',4=>'int',8=>'bigint'];
            if(!preg_match('/^'.$tipos[$long].'/i',$campoBd->Type)||
                ($coincidencias[2]&&!preg_match('/\('.$long.'\)/',$campoBd->Type))||
                (trim($coincidencias[3])=='sin signo'&&!preg_match('/unsigned/i',$campoBd->Type))) return false;
        }

        if(preg_match('/decimal\(([0-9]+)\)( sin signo)?/',$tipo,$coincidencias)&&(
            !preg_match('/decimal\('.$coincidencias[2].'\)/i',$campoBd->Type)||
            (trim($coincidencias[2])=='sin signo'&&!preg_match('/unsigned/i',$campoBd->Type))
        )) return false;

        if(preg_match('/logico/',$tipo,$coincidencias)) {
            if(!preg_match('/tinyint/i',$campoBd->Type)) return false;
            $predeterminado=$predeterminado!='1'&&$predeterminado!='true'?'0':'1';
        }

        if(preg_match('/fecha/',$tipo,$coincidencias)&&!preg_match('/datetime/i',$campoBd->Type)) return false;
        
        if($predeterminado!==$campoBd->Default) return false;

        return true;
    }

    protected function procesar($clase) {
        $tabla=configuracion::$prefijoBd.$clase->obtenerNombreTabla();

        $camposEntidad=$clase->obtenerCampos();
        
        ////Crear
        
        if(!in_array($tabla,$this->tablas)) {
            $sql='CREATE TABLE `'.$tabla.'` (`id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,`e` TINYINT(1) UNSIGNED NOT NULL DEFAULT \'0\',';
            $indices='';        

            foreach($camposEntidad as $campo=>$parametros) {
                if($campo=='id'||$campo=='e'||$parametros->tipo=='relacional') continue;

                $tipo=$this->obtenerTipo($clase->obtenerNombre(),$campo,$parametros);
                $indice=$this->obtenerIndice($clase->obtenerNombre(),$campo,$parametros);

                $sql.='`'.$campo.'` '.$tipo.',';
                if($indice) $indices.=','.$indice;
            }
                
            $sql.='PRIMARY KEY (`id`),INDEX `e` (`e`)'.$indices.')  COLLATE=\'utf8_general_ci\' ENGINE=InnoDB';

            $this->consulta($sql);

            return true;
        }
        
        ////Buscar diferencias
        
        $campos=[];
        
        $resultado=$this->bd->consulta('show fields in '.$tabla);
        $this->verificarError();
        while($fila=$resultado->aObjeto()) $campos[$fila->Field]=$fila;

        foreach($camposEntidad as $campo=>$parametros) {
            if($campo=='id'||$campo=='e'||$parametros->tipo=='relacional') continue;

            $tipo=$this->obtenerTipo($clase->obtenerNombre(),$campo,$parametros);
            $indice=$this->obtenerIndice($clase->obtenerNombre(),$campo,$parametros);

            if($parametros->busqueda) $parametros->indice=true;

            if(array_key_exists($campo,$campos)) {
                $campoBd=$campos[$campo];

                if(!$this->compararCampo($parametros,$campos[$campo])) {
                    //Modificar columna (solo tipo, no es posible cambio de nombre)
                    $this->consulta('ALTER TABLE `'.$tabla.'` CHANGE COLUMN `'.$campo.'` `'.$campo.'` '.$tipo);
                }

                //Índice
                if($indice) {
                    if(($parametros->indice===true&&$campoBd->Key!='MUL')||($parametros->indice==='unico'&&$campoBd->Key!='UNI')) {
                        if($campoBd->Key) {
                            //Cambio de índice, remover el existente
                            //Asumimos que el índice tiene igual nombre que la columna. De esa forma cualquier otro índice que agregue el usuario manualmente en la base de datos no se vería afectado.
                            $this->consulta('ALTER TABLE `'.$tabla.'` DROP INDEX `'.$campo.'`');
                        }
                        //Agregar
                        $this->consulta('ALTER TABLE `'.$tabla.'` ADD '.$indice);
                    }
                } elseif($campoBd->Key) {
                    //Eliminar índice si se remueve @indice
                    $this->consulta('ALTER TABLE `'.$tabla.'` DROP INDEX `'.$campo.'`');
                }
            } else {
                //Agregar columna
                $consulta='ALTER TABLE `'.$tabla.'` ADD COLUMN `'.$campo.'` '.$tipo;
                if($indice) $consulta.=',ADD '.$indice;
                $this->consulta($consulta);
            }
        } 

        return false;
    }

    protected function consulta($sql) {
        $this->registro($sql.';');
        $resultado=$this->bd->consulta($sql);
        $this->verificarError();
        return $resultado;
    }

    protected function verificarError() {
        $error=$this->bd->obtenerError();
        if($error) gestor::error([
            'error'=>'Error: '.$error,
            'sql'=>$this->sql
        ]);
    }

    protected function registro($valor) {  
        $this->sql.=$valor.PHP_EOL.PHP_EOL;
        file_put_contents(_raiz.'sincronizar.sql',$valor.PHP_EOL.PHP_EOL,FILE_APPEND);
    }
}