<!doctype html><html lang="es"><head>
    <meta charset="utf-8">
    <base href="<?=\foxtrot::obtenerUrl()?>">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">
    <link rel="stylesheet" href="recursos/css/foxtrot.css" combinar="">
    <link rel="stylesheet" href="recursos/css/tema-sistema.css" combinar="" tema="">
    <link rel="stylesheet" href="aplicacion/recursos/css/estilos.css" combinar="">
    <link rel="stylesheet" href="aplicacion/cliente/vistas/principal.css">
    <meta name="generator" content="Foxtrot 7">
  <title>Bienvenido a Foxtrot</title></head>
  <body>
    <div id="foxtrot-cuerpo" class="componente vista contenedor" data-fxid="principal-2"><div class="componente contenedor encabezado principal-contenedor-4" data-fxid="principal-3"><div class="componente contenedor container-fluid principal-contenedor-6" data-fxid="principal-5"><ul class="nav componente contenedor align-items-center menu-click contenedor-menu principal-contenedor-menu-p justify-content-start" data-fxid="principal-7"><picture data-fxid="principal-8" class="componente imagen principal-imagen-9 mr-2"><img src="aplicaciones/test/recursos/img/foxtrot-transp.png"></picture><li data-fxid="principal-10" class="componente contenedor con-submenu item-menu principal-item-menu-11"><a href="#">Administración</a><ul class="foxtrot-menu oculto menu-contextual componente contenedor menu principal-menu-13" data-fxid="principal-12"><li data-fxid="principal-14" class="componente contenedor item-menu principal-item-menu-15"><a href="#">Usuarios</a></li></ul></li><div class="espaciador componente principal-espaciador-17" data-fxid="principal-16"></div><li data-fxid="principal-18" class="componente contenedor con-submenu item-menu principal-item-menu-menuUsuario"><a href="#">...</a><ul class="foxtrot-menu oculto menu-contextual componente contenedor desplegar-derecha menu principal-menu-20" data-fxid="principal-19"><li data-fxid="principal-21" class="componente contenedor item-menu principal-item-menu-22"><a href="#">Cerrar sesión</a></li></ul></li></ul></div></div></div>
    <div id="foxtrot-barra-precarga" class="aparece"></div>
    <script src="cliente/foxtrot.js"></script>
    <script src="aplicacion/cliente/controladores/principal.js" controlador=""></script>
    <script src="aplicacion/cliente/aplicacion.js"></script>
    <script>
    var jsonFoxtrot='{"version":1,"componentes":[{"id":"principal-2","nombre":null,"componente":"vista","propiedades":{"titulo":"Bienvenido a Foxtrot"}},{"id":"principal-3","nombre":null,"selector":".principal-contenedor-4","componente":"contenedor","propiedades":{"tipo":"bloque","clase":"encabezado","color":{"g":""}}},{"id":"principal-5","nombre":null,"selector":".principal-contenedor-6","componente":"contenedor","propiedades":{"tipo":"fluido"}},{"id":"principal-7","nombre":"p","selector":".principal-contenedor-menu-p","componente":"contenedor-menu","propiedades":{"alineacionItems":{"g":"inicio"},"justificacionItems":{"g":"centro"},"estructura":{"g":""},"comportamiento":"click"}},{"id":"principal-8","nombre":"","selector":".principal-imagen-9","componente":"imagen","propiedades":{"src":{"g":"aplicaciones/test/recursos/img/foxtrot-transp.png"},"ancho":{"g":"50"},"anchoMaximo":{"g":""},"margen":{"g":""},"clase":"mr-2"}},{"id":"principal-10","nombre":null,"selector":".principal-item-menu-11","componente":"item-menu","propiedades":{}},{"id":"principal-12","nombre":null,"selector":".principal-menu-13","componente":"menu","propiedades":{}},{"id":"principal-14","nombre":null,"selector":".principal-item-menu-15","componente":"item-menu","propiedades":{"click":"abrir:abm/usuarios","menuContextual":""}},{"id":"principal-16","nombre":null,"selector":".principal-espaciador-17","componente":"espaciador","propiedades":{"flex":{"g":"1"},"borde":{"g":null},"tipo":{"g":""}}},{"id":"principal-18","nombre":"menuUsuario","selector":".principal-item-menu-menuUsuario","componente":"item-menu","propiedades":{"flotar":{"g":""},"enlace":"","margen":{"g":"0"}}},{"id":"principal-19","nombre":null,"selector":".principal-menu-20","componente":"menu","propiedades":{"clase":"desplegar-derecha"}},{"id":"principal-21","nombre":null,"selector":".principal-item-menu-22","componente":"item-menu","propiedades":{"click":"apl:cerrarSesion","clase":""}}],"nombre":"principal"}';
    ui.inicializar("principal")
        .establecerJson(jsonFoxtrot)
        .ejecutar();
    </script>
  
</body></html>