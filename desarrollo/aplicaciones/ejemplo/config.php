<?php
/**
 * Aplicación de demostración de Foxtrot.
 * @author 
 * @version 1.0
 */

defined('_inc') or exit;

configuracion::establecer([
    //Configuración específica de la aplicación. Los parámetros establecidos a continuación sobreescriben a los establecidos en el archivo
    //config.php global.

    //enrutador: Permite establecer un mecanismo de enrutamiento de solicitudes distinto al predeterminado para esta aplicación. El valor puede
    //ser una cadena o un array asociativo [subruta=>enrutador]. El nombre del enrutador puede ser el nombre de una clase personalizada
    //ubicada en un archivo servidor/nombre.php y en el espacio \aplicaciones\aplicacion\enrutadores, o el nombre de uno de los enrutadores
    //predefinidos (enrutadorApi, enrutadorAplicacionPredeterminado, enrutadorPredeterminado, enrutadorUnaPagina).
    'enrutador'=>[
        //Nótese que las rutas deben comenzar con / y ordenarse de más específica a menos específica, ya que la primer coincidencia será
        //la que se utilice
        '/api/'=>'api',
        '/'=>'unaPagina'
    ],
    
    //Credenciales de la base de datos (los parámetros omitidos se heredan de la configuración global)
    //'usuarioBd'=>'root',
    //'contrasenaBd'=>'toor',
    //'nombreBd'=>'test'
]);