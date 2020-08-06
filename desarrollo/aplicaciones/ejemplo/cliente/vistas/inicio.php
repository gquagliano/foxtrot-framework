<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <base href="<?=\foxtrot::obtenerUrl()?>">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">
    <link rel="stylesheet" href="recursos/css/foxtrot.css" combinar>
    <link rel="stylesheet" href="recursos/css/tema-sistema.css" combinar tema>
    <link rel="stylesheet" href="aplicacion/recursos/css/estilos.css" combinar>
    <link rel="stylesheet" href="aplicacion/cliente/vistas/inicio.css">
    <meta name="generator" content="Foxtrot 7">
    <link rel="icon" href="">
    <title></title>
    
    <style id="foxtrot-estilos"></style>
  </head>
  <body>
    <div id="foxtrot-cuerpo" class="componente contenedor centrar-contenido-verticalmente" data-fxid="inicio-1"><div class="container vacio componente contenedor text-center" data-fxid="inicio-2" id="componente-inicio-2"><div data-fxid="inicio-3" class="componente" id="componente-inicio-3"><input class="form-control" type="text" placeholder="Usuario"></div><div data-fxid="inicio-4" class="componente" id="componente-inicio-4"><input class="form-control" type="password" placeholder="Contraseña"></div><a href="#" data-fxid="inicio-5" class="componente btn btn-primary" id="componente-inicio-5">Ingresar</a></div></div>
    <script src="cliente/foxtrot.js"></script>
    <script src="aplicacion/cliente/controladores/inicio.js"></script>
    <script src="aplicacion/cliente/aplicacion.js"></script>
    <script>
    ui.establecerJson('{"version":1,"componentes":[{"id":"inicio-1","nombre":null,"componente":"vista","propiedades":{"centrarHijos":{"g":true}}},{"id":"inicio-2","nombre":null,"componente":"contenedor","propiedades":{"anchoMaximo":{"g":"350"},"alineacion":{"g":"centro"}}},{"id":"inicio-3","nombre":"usuario","componente":"campo","propiedades":{"relleno":"Usuario","margen":{"g":"0 0 10"}}},{"id":"inicio-4","nombre":"contrasena","componente":"campo","propiedades":{"tipo":"contrasena","relleno":"Contraseña","margen":{"g":"0 0 10"}}},{"id":"inicio-5","nombre":null,"componente":"boton","propiedades":{"tipo":"boton","click":"ingresar","estilo":"primary"}}],"nombre":"inicio"}')
        .ejecutar();
    </script>
  </body>
</html>