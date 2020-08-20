<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <base href="<?= \foxtrot::obtenerUrl() ?>">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">
    <link rel="stylesheet" href="recursos/css/foxtrot.css" combinar="">
    <link rel="stylesheet" href="recursos/css/tema-{tema}.css" combinar="" tema="">
    <link rel="stylesheet" href="aplicacion/recursos/css/estilos.css" combinar="">
    <link rel="stylesheet" href="aplicacion/cliente/vistas/{nombreVista}.css">
    <meta name="generator" content="Foxtrot 7">
    <title>{titulo}</title>
</head>
<body>
    <div id="foxtrot-cuerpo" class="componente vista contenedor" data-fxid="{idVista}2">
        <div class="componente contenedor container-fluid {idVista}contenedor-4 pb-4" data-fxid="{idVista}3">
            <h1 class="componente texto" data-fxid="{idVista}4">...&nbsp;</h1>
            <div class="formulario componente contenedor form {idVista}form-8" data-fxid="{idVista}7">
                <div class="componente contenedor {idVista}contenedor-23 cuerpo-formulario" data-fxid="{idVista}22">

/*campo
                    <div class="row contenedor componente fila {idVista}fila-10" data-fxid="{idVista}9-{n}">
                        <div class="contenedor componente columna {idVista}columna-12 col-12 col-md-2" data-fxid="{idVista}11-{n}">
                            <label class="componente texto" data-fxid="{idVista}5-{n}">{etiqueta}: {req}</label></div>
                        <div class="contenedor componente columna {idVista}columna-16 col-12 col-md-{tamano}" data-fxid="{idVista}15-{n}">
                            <div data-fxid="{idVista}17-{n}" class="componente {autofoco} campo {idVista}campo-{campo}">
                                <input class="form-control" type="text">
                            </div>
                        </div>
                    </div>
*/

                </div>
                <div class="componente contenedor {idVista}contenedor-17" data-fxid="{idVista}16"><a href="#" data-fxid="{idVista}63" class="componente btn btn-primary boton {idVista}boton-64 mr-2 predeterminado">Guardar</a><a href="#" data-fxid="{idVista}65" class="componente btn btn-secondary boton {idVista}boton-66 mr-2">Nuevo</a><a href="#" data-fxid="{idVista}67" class="componente btn btn-secondary boton {idVista}boton-68">Volver</a></div>
            </div>
        </div>
    </div>
    <div id="foxtrot-barra-precarga" class="aparece"></div>
    <script src="cliente/foxtrot.js"></script>
    <script src="aplicacion/cliente/controladores/{nombreVista}.js" controlador=""></script>
    <script src="aplicacion/cliente/aplicacion.js"></script>
    <script>
        var jsonFoxtrot = '{json}';
        ui.inicializar("{nombreVista}")
            .establecerJson(jsonFoxtrot)
            .ejecutar();
    </script>
</body>
</html>