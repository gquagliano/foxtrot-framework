<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

define('_inc',1);

define('_raiz',realpath(__DIR__.'/..').'/');
define('_gestor',_raiz.'gestor/');
define('_fuente',_raiz.'fuente/');
define('_desarrollo',_raiz.'desarrollo/');

include(__DIR__.'/funciones.php');

set_time_limit(3600);
error_reporting(E_ERROR | E_WARNING);

if(array_key_exists('ejecutar',$_REQUEST)) {
    define('_depuracion',$_REQUEST['depuracion']=='1');

    //Crear estructura de directorios
    $directorios=[
        _desarrollo.'cliente',
        _desarrollo.'cliente/modulos',
        _gestor,
        _gestor.'img',
        _gestor.'operaciones',
        _gestor.'plantillas',
        _desarrollo.'recursos',
        _desarrollo.'recursos/componentes',
        _desarrollo.'recursos/css',
        _desarrollo.'recursos/img',
        _desarrollo.'servidor',
        _desarrollo.'servidor/componentes',
        _desarrollo.'servidor/enrutadores',
        _desarrollo.'servidor/modulos',
        _desarrollo.'temp',
        _desarrollo.'temp/temp-privado'
    ];
    foreach($directorios as $dir)
        if(!file_exists($dir))
            mkdir($dir,0755,true);

    ////php, html, css y otros recursos

    //Copiar
    $tipos=['*.php','*.html','*.jpg','*.png','*.gif','*.svg','.htaccess'];
    copiar(_fuente,$tipos,_desarrollo,false);
    copiar(_fuente.'recursos/',$tipos,_desarrollo.'recursos/');
    copiar(_fuente.'servidor/',$tipos,_desarrollo.'servidor/');
    copiar(_fuente.'temp/',null,_desarrollo.'temp/');
    copiar(_fuente.'gestor/',$tipos,_gestor);
    copiar(_fuente.'gestor/img/',null,_gestor.'img/');
    copiar(_fuente.'gestor/operaciones/',null,_gestor.'operaciones/');
    copiar(_fuente.'gestor/plantillas/',null,_gestor.'plantillas/');
    copiar(_fuente.'gestor/asistentes/',null,_gestor.'asistentes/');

    //Combinar todos los archivos css del framework (excepto el gestor) y comprimir
    $css='';
    $archivos=[
        _fuente.'recursos/css/bootstrap.min.css',
        _fuente.'recursos/css/foxtrot.css'
    ];
    $archivos=array_merge($archivos,buscarArchivos(_fuente.'recursos/componentes/css/','*.css'));
    //Incorporar css de módulos
    $archivos=array_merge($archivos,buscarArchivos(_fuente.'cliente/modulos/','*.css'));
    foreach($archivos as $arch) {
        //Excluir css de modo de edición
        if(preg_match('/\.edicion\.css$/',$arch)) continue;
        $css.=file_get_contents($arch);
    }
    $ruta=_desarrollo.'recursos/css/foxtrot.css';
    file_put_contents($ruta,$css);
    comprimirCss($ruta);

    //Temas (no se combinan hasta pasar a producción/embebible)
    $archivos=glob(_fuente.'recursos/css/tema-*');
    foreach($archivos as $arch) copy($arch,_desarrollo.'recursos/css/'.basename($arch));

    //Remover el directorio recursos/componentes/css (quedó vacío al combinar los css)
    rmdir(_desarrollo.'recursos/componentes/css');

    //Css del gestor
    $css='';
    $archivos=[
        _fuente.'gestor/gestor.css'
    ];
    $archivos=array_merge($archivos,buscarArchivos(_fuente.'recursos/componentes/css/','*.edicion.css'));
    foreach($archivos as $arch) $css.=file_get_contents($arch);
    $ruta=_gestor.'gestor.css';
    file_put_contents($ruta,$css);
    comprimirCss($ruta);

    ////Librerías de terceros (se compian tal cual)
    //TOOD

    ////js cliente (framework + componentes)

    //Compilar archivo combinado (excepto el gestor)
    $archivos=[
        _fuente.'cliente/util.js',
        _fuente.'cliente/dom.js',
        _fuente.'cliente/arrastra.js',
        _fuente.'cliente/editable.js',
        _fuente.'cliente/servidor.js',
        _fuente.'cliente/sesion.js',
        _fuente.'cliente/ajax.js',
        _fuente.'cliente/aplicacion.js',
        _fuente.'cliente/componente.js',
        _fuente.'cliente/controlador.js',
        _fuente.'cliente/modulo.js',
        _fuente.'cliente/enrutador.js',
        _fuente.'cliente/ui.js',
        _fuente.'cliente/ui.animaciones.js',
        _fuente.'cliente/ui.menu.js',
        _fuente.'cliente/ui.dialogos.js',
        _fuente.'cliente/expresion.js',
        _fuente.'cliente/componentes/**.js', //TODO Debemos definir el orden de los componentes, ya que actualmente se representan en el editor en orden de inclusión, sobre lo cual aquí no tenemos control
        _fuente.'cliente/enrutadores/**.js'
    ];
    //Integrar todos los módulos (serán optativos al pasar a producción)
    $archivos=array_merge($archivos,buscarArchivos(_fuente.'cliente/modulos/','*.js'));
    compilarJs($archivos,_desarrollo.'cliente/foxtrot.js',_depuracion);

    //Gestor
    compilarJs(_fuente.'gestor/editor.js',_gestor.'editor.js',_depuracion);
    compilarJs(_fuente.'gestor/gestor.js',_gestor.'gestor.js',_depuracion);

    //Config.php y .htaccess
    $ruta=$_REQUEST['ruta'];
    if($ruta) {
        if(substr($ruta,0,1)!='/') $ruta='/'.$ruta;
        if(substr($ruta,-1)!='/') $ruta.='/';
        $ruta.='desarrollo/';

        if(!file_exists(_desarrollo.'config.php')) {
            $codigo=file_get_contents(_fuente.'config-ejemplo.php');
            $codigo=preg_replace('#configuracion::establecer\(\[.+?\]\);#s','configuracion::establecer([
    \'url\'=>(foxtrot::esHttps()?\'https\':\'http\').\'://\'.$_SERVER[\'HTTP_HOST\'].\''.$ruta.'\',
    //El parámetro rutaBase permite configurar el sistema en un subdirectorio (omitir si se instala en el raíz del servidor web)
    \'rutaBase\'=>\''.$ruta.'\'
]);',$codigo);
            file_put_contents(_desarrollo.'config.php',$codigo);
        }

        if(!file_exists(_desarrollo.'.htaccess')) {
            $codigo=file_get_contents(_fuente.'.htaccess-ejemplo');
            //$codigo=preg_replace('/RewriteBase .+/i','RewriteBase '.$ruta,$codigo); RewriteBase fue removido
            file_put_contents(_desarrollo.'.htaccess',$codigo);
        }
    }

    header('Location: index.php');
    exit;
}

$uri=$_SERVER['REQUEST_URI'];
if(basename($uri)=='index.php') $uri=dirname($uri);
$ruta=dirname($uri).'/';

?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&display=swap">
    <style>
    body {
        font-family: Montserrat, sans-serif;
        font-size: 14px;
    }
    .btn {
        text-transform: uppercase;
        font-weight: 500;
        padding-left: 1rem;
        padding-right: 1rem;
    }
    form {
        max-width: 450px;
        margin: auto;
    }
    code {
        color: inherit;
    }
    #logo {
        height: 90px;
    }
    </style>
    <title>Construir Foxtrot</title>
    <link rel="icon" type="image/png" href="../fuente/recursos/img/favicon.png">
  </head>
  <body>
    <div class="container text-center">
        <img src="../fuente/recursos/img/foxtrot-transp.png" class="mt-5 mb-4" id="logo">
        <h3 class="mb-3">Hola</h3>
        <p>¡Gracias por descargar Foxtrot!</p>
        <p><a href="https://github.com/gquagliano/experimental-foxtrot-framework/wiki" target="_blank">Wiki / Documentación</a></p>
        <form method="get" class="mt-5">
            <input type="hidden" name="ejecutar" value="1">
            <div class="form-group row">
                <label class="col-sm-2 col-form-label text-right">Ruta</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control form-control-sm" name="ruta" value="<?=$ruta?>">
                </div>
            </div>
            <div class="form-group">
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" checked name="depuracion" value="1" id="depuracion">
                    <label class="custom-control-label" for="depuracion">Modo de depuración</label>
                </div>
            </div>
<?php
if(!function_exists('shell_exec')) {
?>
            <p>¡<code>shell_exec()</code> no está habilitado!</p>
<?php
}
?>
            <div class="form-group">
                <button type="submit" class="btn btn-primary btn-sm">Construir Foxtrot</button>
            </div>
        </form>
<?php
if(file_exists(__DIR__.'/../desarrollo/servidor/foxtrot.php')) {
?>
        <div class="alert alert-success mt-5" role="alert">
            ¡Foxtrot fue construido en el directorio <code>desarrollo</code>!
        </div>
        <p><a href="../gestor" class="btn btn-success btn-sm">Acceder al gestor de aplicaciones</a></p>
        <p>Es posible que sea necesario completar la configuración en <code>desarrollo/config.php</code>.</p>
<?php
}
?>
    </div>
  </body>
</html>