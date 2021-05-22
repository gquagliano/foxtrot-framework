<?php
/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 2.0
 */

use datos\condicion;

defined('_inc') or exit;

/**
 * Clase base de los repositorios del modelo de datos.
 */
class modelo extends modeloBase {
    /**
     * Agrega una relación.
     * @param int $tipo Tipo de relación: `modelo::relacion1N` (`1:N`), `modelo::relacion11` (`1:1`), `modelo::relacion10 (`1:0`, es decir
     * `1:1 o nulo`).
     * @param string $modelo Nombre del modelo foráneo.
     * @param string $alias Alias del modelo foráneo.
     * @param string $condicion Condición como SQL.
     * @param array|object $parametros Parámetros para la condición (opcional).
     * @return \modelo
     */
    public function relacionar($tipo,$modelo,$alias,$condicion,$parametros=null) {
        //TODO Sobrecargas con otras ascepciones útiles de este método, por ejemplo por condición (\datos\condicion) o por campo,operador,valor
        if(is_string($modelo)) $modelo=\foxtrot::fabricarModelo($modelo);
        $this->agregarRelacionSql($tipo,$modelo,$alias,$condicion,$parametros);
        return $this;
    }

    /**
     * Guarda los valores actualmente asignados. Actualizará o creará el registro según esté asignada o no el campo `id`.
     * @return \modeloBase
     */
    public function guardar() {
        if($this->valores&&$this->valores->id) return $this->actualizar();
        return $this->crear();
    }

    ////donde

    /**
     * Agrega una condición `O` (`OR`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oDonde() {
        $args=func_get_args();
        array_unshift($args,self::o);
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `XOR` (*`O` exclusivo*). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oxDonde() {
        $args=func_get_args();
        array_unshift($args,self::ox);
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `Y` (`AND`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function yDonde() {
        return call_user_func_array([$this,'donde'],func_get_args());
    }

    ////dondeNo

    /**
     * Agrega una condición negada. Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function dondeNo() {
        return call_user_func_array([$this,'yDondeNo'],func_get_args());
    }

    /**
     * Agrega una condición `O` (`OR`) por desigualdad (`<>`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oDondeNo() {
        $args=func_get_args();
        array_unshift($args,self::o);
        $args[]='<>';
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `XOR` (*`O` exclusivo*) por desigualdad (`<>`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oxDondeNo() {
        $args=func_get_args();
        array_unshift($args,self::ox);
        $args[]='<>';
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `Y` (`AND`) por desigualdad (`<>`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function yDondeNo() {
        $args=func_get_args();
        $args[]='<>';
        return call_user_func_array([$this,'donde'],$args);
    }

    ////dondeComo

    /**
     * Agrega una condición por búsqueda parcial (`LIKE`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function dondeComo() {
        return call_user_func_array([$this,'yDondeComo'],func_get_args());
    }

    /**
     * Agrega una condición `O` (`OR`) por búsqueda parcial (`LIKE`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oDondeComo() {
        $args=func_get_args();
        array_unshift($args,self::o);
        $args[]=condicion::operadorComo;
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `OX` (*`O` exclusivo*) por búsqueda parcial (`LIKE`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oxDondeComo() {
        $args=func_get_args();
        array_unshift($args,self::ox);
        $args[]=condicion::operadorComo;
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `Y` (`AND`) por búsqueda parcial (`LIKE`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function yDondeComo() {
        $args=func_get_args();
        $args[]=condicion::operadorComo;
        return call_user_func_array([$this,'donde'],$args);
    }

    ////dondeNoComo

    /**
     * Agrega una condición por búsqueda parcial no coincidente (`NOT LIKE`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function dondeNoComo() {
        return call_user_func_array([$this,'yDondeNoComo'],func_get_args());
    }

    /**
     * Agrega una condición `O` (`OR`) por búsqueda parcial no coincidente (`NOT LIKE`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oDondeNoComo() {
        $args=func_get_args();
        array_unshift($args,self::o);
        $args[]=condicion::operadorNoComo;
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `XOR` (*`O` exclusivo*) por búsqueda parcial no coincidente (`NOT LIKE`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oxDondeNoComo() {
        $args=func_get_args();
        array_unshift($args,self::ox);
        $args[]=condicion::operadorNoComo;
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `Y` (`AND`) por búsqueda parcial no coincidente (`NOT LIKE`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function yDondeNoComo() {
        $args=func_get_args();
        $args[]=condicion::operadorNoComo;
        return call_user_func_array([$this,'donde'],$args);
    }

    ////dondeEn

    /**
     * Agrega una condición por listado de valores (`IN()`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function dondeEn() {
        return call_user_func_array([$this,'yDondeEn'],func_get_args());
    }

    /**
     * Agrega una condición `O` (`OR`) por listado de valores (`IN()`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oDondeEn() {
        $args=func_get_args();
        array_unshift($args,self::o);
        $args[]=condicion::operadorEn;
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `XOR` (*`O` exclusivo*) por listado de valores (`IN()`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oxDondeEn() {
        $args=func_get_args();
        array_unshift($args,self::ox);
        $args[]=condicion::operadorEn;
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `Y` (`AND`) por listado de valores (`IN()`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function yDondeEn() {
        $args=func_get_args();
        $args[]=condicion::operadorEn;
        return call_user_func_array([$this,'donde'],$args);
    }

    ////dondeNoEn

    /**
     * Agrega una condición por listado de valores no coincidentes (`NOT IN()`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function dondeNoEn() {
        return call_user_func_array([$this,'yDondeNoEn'],func_get_args());
    }

    /**
     * Agrega una condición `O` (`OR`) por listado de valores no coincidentes (`NOT IN()`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oDondeNoEn() {
        $args=func_get_args();
        array_unshift($args,self::o);
        $args[]=condicion::operadorNoEn;
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `XOR` (*`O` exclusivo*) por listado de valores no coincidentes (`NOT IN()`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function oxDondeNoEn() {
        $args=func_get_args();
        array_unshift($args,self::ox);
        $args[]=condicion::operadorNoEn;
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `Y` (`AND`) por listado de valores no coincidentes (`NOT IN()`). Ver `donde()` para información sobre los parámetros.
     * @return \modelo
     */
    public function yDondeNoEn() {
        $args=func_get_args();
        $args[]=condicion::operadorNoEn;
        return call_user_func_array([$this,'donde'],$args);
    }

    /**
     * Agrega una condición `Y` (`AND`).
     * @param \entidad $entidad Utilizar las propiedades definidas de la entidad como condiciones.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los 
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param \entidad $entidad Utilizar las propiedades definidas de la entidad como condiciones.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los 
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición `Y` (`AND`).
     * @param array|object $condiciones Objeto o array asociativo `[campo=>valor]`.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los 
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param array|object $condiciones Objeto o array asociativo `[campo=>valor]`.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los 
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición `Y` (`AND`).
     * @param string $campo Campo.
     * @param mixed $valor Valor.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los 
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param string $campo Campo.
     * @param mixed $valor Valor.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los 
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición `Y` (`AND`).
     * @param string $campo Campo.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`).
     * @param mixed $valor Valor.
     * @return \modelo
     *//**
     * Agrega una condición.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param string $campo Campo.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`).
     * @param mixed $valor Valor.
     * @return \modelo
     *//**
     * Agrega una condición `Y` (`AND`).
     * @param string $sql Condición como SQL.
     * @param array|object $parametros Array asociativo de parámetros (opcional).
     * @param array|mixed $valor Array asociativo de tipos de datos (`[parametro=>tipo]`, opcional).
     * @return \modelo
     *//**
     * Agrega una condición.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param string $sql Condición como SQL.
     * @param array|object $parametros Array asociativo de parámetros (opcional).
     * @param array|mixed $valor Array asociativo de tipos de datos (`[parametro=>tipo]`, opcional).
     * @return \modelo
     */
    public function donde() {
        $args=func_get_args();
        array_unshift($args,condicion::donde);
        return call_user_func_array([$this,'dondeTeniendo'],$args);
    }

    /**
     * Agrega una condición `HAVING` `Y` (`AND`).
     * @param \entidad $entidad Utilizar las propiedades definidas de la entidad como condiciones.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición `HAVING`.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param \entidad $entidad Utilizar las propiedades definidas de la entidad como condiciones.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición `HAVING` `Y` (`AND`).
     * @param array|object $condiciones Objeto o array asociativo `[campo=>valor]`.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición `HAVING`.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param array|object $condiciones Objeto o array asociativo `[campo=>valor]`.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición `HAVING` `Y` (`AND`).
     * @param string $campo Campo.
     * @param mixed $valor Valor.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los 
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición `HAVING`.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param string $campo Campo.
     * @param mixed $valor Valor.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`) a utilizar para comparar los 
     * valores (por defecto, `=`).
     * @return \modelo
     *//**
     * Agrega una condición `HAVING` `Y` (`AND`).
     * @param string $campo Campo.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`).
     * @param mixed $valor Valor.
     * @return \modelo
     *//**
     * Agrega una condición `HAVING`.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param string $campo Campo.
     * @param int $operador Operador (`=`, `<`, `<=`, `>`, `>=`, `<>`, `modelo::como`, `modelo::noComo`).
     * @param mixed $valor Valor.
     * @return \modelo
     *//**
     * Agrega una condición `HAVING` `Y` (`AND`).
     * @param string $sql Condición como SQL.
     * @param array|object $parametros Array asociativo de parámetros (opcional).
     * @param array|mixed $valor Array asociativo de tipos de datos (`[parametro=>tipo]`, opcional).
     * @return \modelo
     *//**
     * Agrega una condición `HAVING`.
     * @param int $union Unión (`modelo::y`, `modelo:o`, `modelo::ox`).
     * @param string $sql Condición como SQL.
     * @param array|object $parametros Array asociativo de parámetros (opcional).
     * @param array|mixed $valor Array asociativo de tipos de datos (`[parametro=>tipo]`, opcional).
     * @return \modelo
     */
    public function teniendo() {
        $args=func_get_args();
        array_unshift($args,condicion::teniendo);
        return call_user_func_array([$this,'dondeTeniendo'],$args);
    }

    /**
     * Agrega una condición `WHERE` o `HAVING`. El primer parámetro debe ser siempre el tipo de condición (`condicion::donde` o
     * `condicion::teniendo`) mientras que el resto de los parámetros son idénticos a los de `donde()` y `teniendo()`.
     * @return \modelo
     */
    protected function dondeTeniendo() {
        $args=func_get_args();

        $tipo=array_shift($args);

        $union=self::y;
        if(in_array($args[0],[self::y,self::o,self::ox]))
            $union=array_shift($args);

        $operador='=';
        if(in_array($args[count($args)-1],['=','<>','<','<=','>','>=',self::como,self::noComo,self::en,self::noEn]))
        	$operador=array_pop($args);

        //donde($entidad[,$operador])
        //donde($union,$entidad[,$operador])
        if(is_object($args[0])&&get_class($args[0])==$this->_tipoEntidad) {
            $obj=$args[0];

            $obj->prepararValores(self::seleccionar);

            foreach($this->campos as $nombre=>$campo) {
                if(!isset($obj->$nombre)||$obj->$nombre===null) continue;
                $this->agregarCondicion($nombre,$operador,$obj->$nombre,$union,$tipo);
            }

            return $this;
        }

        //donde(['campo'=>valor][,$operador])
        //donde($union,['campo'=>valor][,$operador])
        if(is_object($args[0])||is_array($args[0])) {
            $array=is_object($args[0])?(array)$args[0]:$args[0];
            
            foreach($array as $clave=>$valor) {
                if($valor===null) continue;
                $this->agregarCondicion($clave,$operador,$valor,$union,$tipo);
            }

            return $this;
        }

        //donde($campo,$valor[,$operador])
        //donde($union,$campo,$valor[,$operador])
        if(count($args)==2&&array_key_exists($args[0],$this->campos)) {
            list($nombre,$valor)=$args;

            if($valor===null) return $this;

            return $this->agregarCondicion($nombre,$operador,$valor,$union,$tipo);
        }

        //donde($campo,$operador,$valor[,$operador2])
        //donde($union,$campo,$operador,$valor[,$operador2])
        //$operador2 es ignorado
        if(count($args)==3&&array_key_exists($args[0],$this->campos)) {
            list($nombre,$operador,$valor)=$args;
            
            if($valor===null||!is_integer($operador)) return $this;

            return $this->agregarCondicion($nombre,$operador,$valor,$union,$tipo);
        }

        //donde($sql[,$parametros,$tipos,$operador])
        //donde($union,$sql[,$parametros,$tipos,$operador])
        //$operador es ignorado
        if(is_string($args[0])) {
            list($sql,$parametros,$tipos)=$args;

            return $this->agregarCondicionSql($sql,$parametros,$tipos,$union,$tipo);
        }

        return $this;
    }

    /**
     * Establece la paginación.
     * @param int $cantidad Cantidad de elementos por página.
     * @param int $numero Número de página, comenzando desde `1`.
     * @return \modelo
     */
    public function pagina($cantidad,$numero) {
        $this->constructor->establecerLimite(($numero-1)*$cantidad,$cantidad);
        return $this;
    }

    ////Accesos directos

    /**
     * Devuelve la entidad actual.
     * @return \entidadBase
     */
    public function entidad() {
        return $this->obtenerEntidad();
    }

    /**
     * Devuelve el ID del último registro insertado.
     * @return int|null
     */
    public function id() {
        return $this->obtenerId();
    }

    /**
     * Devuelve la cantidad de filas seleccionadas o afectadas en la última consulta.
     * @return int|null
     */
    public function cantidad() {
        return $this->obtenerCantidad();
    }

    /**
     * Establece el valor de un solo campo.
     * @param string $campo Nombre del campo.
     * @param mixed $valor Valor a asignar.
     * @return \modelo
     */
    public function establecer($campo,$valor) {
        $this->establecerValores([$campo=>$valor]);
        return $this;
    }

    ////Eventos

    /**
     * Inicializa la tabla luego de la primer sincronización desde el gestor de aplicaciones.
     */
    public function instalar() {}
}