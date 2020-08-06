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
    <link rel="stylesheet" href="aplicacion/cliente/vistas/principal.css">
    <meta name="generator" content="Foxtrot 7">
    <link rel="icon" href="">
    <title></title>
    
    <style id="foxtrot-estilos"></style>
  </head>
  <body>
    <div id="foxtrot-cuerpo" class="componente contenedor centrar-contenido-verticalmente" data-fxid="principal-1"><div class="container vacio componente contenedor text-center" data-fxid="principal-2" id="componente-principal-2"><div class="texto componente font-weight-light" data-fxid="principal-3" id="componente-principal-3"><p>¡Hola&nbsp;<label class="etiqueta componente" data-fxid="principal-4" id="componente-principal-4"></label>!</p></div><a href="#" data-fxid="principal-5" class="componente" id="componente-principal-5">Cerrar sesión</a></div></div>
    <script src="cliente/foxtrot.js"></script>
    <script src="aplicacion/cliente/controladores/principal.js"></script>
    <script src="aplicacion/cliente/aplicacion.js"></script>
    <script>
    ui.establecerJson('{"version":1,"componentes":[{"id":"principal-1","nombre":null,"componente":"vista","propiedades":{"centrarHijos":{"g":true}}},{"id":"principal-2","nombre":null,"componente":"contenedor","propiedades":{"alineacion":{"g":"centro"}}},{"id":"principal-3","nombre":null,"componente":"texto","propiedades":{"tamano":{"g":"20"},"peso":"fino"}},{"id":"principal-4","nombre":null,"componente":"etiqueta","propiedades":{"contenido":"{usuario}","click":""}},{"id":"principal-5","nombre":null,"componente":"boton","propiedades":{"click":"servidor-apl:cerrarSesion"}}],"nombre":"principal"}')
        .ejecutar();
    </script>
  </body>
</html>