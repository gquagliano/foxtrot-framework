<!doctype html><html lang="es"><head>
    <meta charset="utf-8">
    <base href="<?=\foxtrot::obtenerUrl()?>">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">
    <link rel="stylesheet" href="recursos/css/foxtrot.css" combinar="">
    <link rel="stylesheet" href="recursos/css/tema-sistema.css" combinar="" tema="">
    <link rel="stylesheet" href="aplicacion/recursos/css/estilos.css" combinar="">
    <link rel="stylesheet" href="aplicacion/cliente/vistas/inicio.css">
    <meta name="generator" content="Foxtrot 7">
  <title>Iniciar sesión</title></head>
  <body>
    <div id="foxtrot-cuerpo" class="componente vista contenedor inicio-vista-15 d-flex flex-column justify-content-center" data-fxid="inicio-2"><div class="container componente contenedor inicio-contenedor-4" data-fxid="inicio-3"><div class="formulario componente contenedor formulario-ingreso form inicio-form-6 d-flex justify-content-center" data-fxid="inicio-5"><picture data-fxid="inicio-7" class="componente imagen inicio-imagen-8"><img src="aplicaciones/ejemplo/recursos/img/foxtrot-transp.png"></picture><div class="componente contenedor text-center inicio-contenedor-10" data-fxid="inicio-9"><div data-fxid="inicio-11" class="componente autofoco campo inicio-campo-u"><input class="form-control" type="text" value="" placeholder="Usuario"></div><div data-fxid="inicio-12" class="componente campo inicio-campo-c"><input class="form-control" type="password" placeholder="Contraseña"></div><a href="#" data-fxid="inicio-13" class="componente btn btn-primary predeterminado boton inicio-boton-14">Ingresar</a></div></div></div></div>
    <div id="foxtrot-barra-precarga" class="aparece"></div>
    <script src="cliente/foxtrot.js"></script>
    <script src="aplicacion/cliente/controladores/inicio.js" controlador=""></script>
    <script src="aplicacion/cliente/aplicacion.js"></script>
    <script>
    var jsonFoxtrot='{"version":1,"componentes":[{"id":"inicio-2","nombre":null,"selector":".inicio-vista-15","componente":"vista","propiedades":{"flex":{"g":""},"estructura":{"g":"flexVertical"},"alineacionItems":{"g":"centro"},"titulo":{"g":"Iniciar sesión"}}},{"id":"inicio-3","nombre":null,"selector":".inicio-contenedor-4","componente":"contenedor","propiedades":{"anchoMaximo":{"g":"470"}}},{"id":"inicio-5","nombre":null,"selector":".inicio-form-6","componente":"form","propiedades":{"clase":"formulario-ingreso","flex":{"g":""},"estructura":{"g":"flex"},"alineacionItems":{"g":"centro"}}},{"id":"inicio-7","nombre":null,"selector":".inicio-imagen-8","componente":"imagen","propiedades":{"src":{"g":"aplicaciones/ejemplo/recursos/img/foxtrot-transp.png"},"ancho":{"g":"90"},"margen":{"g":"0 20 0 0"},"clase":""}},{"id":"inicio-9","nombre":null,"selector":".inicio-contenedor-10","componente":"contenedor","propiedades":{"tipo":"bloque","flex":{"g":"1"},"alineacion":{"g":"centro"}}},{"id":"inicio-11","nombre":"u","selector":".inicio-campo-u","componente":"campo","propiedades":{"valor":{"g":""},"relleno":"Usuario","margen":{"g":"0 0 10"},"autofoco":{"g":true}}},{"id":"inicio-12","nombre":"c","selector":".inicio-campo-c","componente":"campo","propiedades":{"tipo":"contrasena","relleno":"Contraseña","click":"","margen":{"g":"0 0 10"}}},{"id":"inicio-13","nombre":null,"selector":".inicio-boton-14","componente":"boton","propiedades":{"tipo":"boton","estilo":"primary","click":"ingresar","menuContextual":"","predeterminado":{"g":true}}}],"nombre":"inicio"}';
    ui.inicializar("inicio")
        .establecerJson(jsonFoxtrot)
        .ejecutar();
    </script>
  
</body></html>