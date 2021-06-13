<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <base href="<?=\foxtrot::obtenerUrl()?>">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover, maximum-scale=1, user-scalable=0">
    <link rel="stylesheet" href="recursos/css/foxtrot.css" combinar="foxtrot">
    <link rel="stylesheet" href="recursos/css/tema-{tema}.css" combinar="foxtrot" tema="">
    <link rel="stylesheet" href="aplicacion/recursos/css/estilos.css" combinar="aplicacion">
    <link rel="stylesheet" href="aplicacion/cliente/vistas/{nombreVista}.css" combinar="aplicacion">
    <meta name="generator" content="Foxtrot 7">
    <title>{titulo}</title>
</head>

<body>
    <div id="foxtrot-cuerpo" class="componente contenedor vista" data-fxid="{idVista}2">
        <div class="componente contenedor {idVista}contenedor-33 container-fluid d-flex flex-column" data-fxid="{idVista}4">
            <h1 class="componente texto m-0 py-5" data-fxid="{idVista}34">{titulo}</h1>
            <div class="row contenedor componente fila" data-fxid="{idVista}56">
                <div class="contenedor componente {idVista}columna-58 col- col-12 col-lg-6 col-xl-8 columna" data-fxid="{idVista}57">
<!superior-multinivel
                    <a href="#" data-fxid="{idVista}59" class="componente btn {idVista}boton-59 boton">🡐 Volver</a>
!>
                    <a href="#" data-fxid="{idVista}35" class="componente btn btn-primary {idVista}boton-36 boton">Nuevo {singular}</a>
                </div>
                <div class="contenedor componente {idVista}columna-4 col-12 col-lg-6 col-xl-4 columna" data-fxid="{idVista}3">
                    <div class="row contenedor componente fila {idVista}fila-2 mt-3 mt-lg-0" data-fxid="{idVista}5">
                        <div class="contenedor componente {idVista}columna-15 col-9 columna" data-fxid="{idVista}8">
                            <div data-fxid="{idVista}10" class="componente {idVista}campo-filtro campo"><input class="form-control" type="text" placeholder="Filtrar..."></div>
                        </div>
                        <div class="contenedor componente {idVista}columna-14 col-3 columna" data-fxid="{idVista}11"><a href="#" data-fxid="{idVista}12" class="componente btn {idVista}boton-13 d-block btn-secondary boton">Filtrar<br></a></div>
                    </div>
                </div>
            </div>
            <div class="formulario componente contenedor {idVista}form-38 form formulario-tabla mt-4 mb-4" data-fxid="{idVista}37">
                <div data-fxid="{idVista}39" class="componente ocultar-contenidos {idVista}tabla-tabla tabla">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover contenedor" cellspacing="0">
                            <tbody class="contenedor">
                                <tr data-fxid="{idVista}40" class="componente contenedor {idVista}tabla-fila-41 tabla-fila">
                                    <td data-fxid="{idVista}42" class="componente contenedor {idVista}tabla-columna-43 tabla-columna"><span class="etiqueta componente {idVista}etiqueta-45" data-fxid="{idVista}44"></span></td>
<!campo
                                    <td data-fxid="{idVista}46-{n}" class="componente contenedor {idVista}tabla-columna-47 tabla-columna"><span class="etiqueta componente {idVista}etiqueta-49" data-fxid="{idVista}48-{n}"></span></td>
!>
                                    <td data-fxid="{idVista}50" class="componente contenedor {idVista}tabla-columna-51 tabla-columna">
                                        <a href="#" data-fxid="{idVista}52" class="componente btn {idVista}boton-54 boton predeterminado">Modificar</a>
                                        <a href="#" data-fxid="{idVista}53" class="componente btn {idVista}boton-55 boton">Eliminar</a>
<!siguiente-multinivel
                                        <a href="#" data-fxid="{idVista}60" class="componente btn {idVista}boton-60 ml-3 boton">{siguiente} 🡒</a>
!>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="row contenedor componente fila {idVista}fila-21 mb-4 align-items-center" data-fxid="{idVista}9">
                <div class="contenedor componente columna {idVista}columna-17 col-6" data-fxid="{idVista}13"><span class="etiqueta componente {idVista}etiqueta-cantidad mr-2" data-fxid="{idVista}18"></span><span class="componente texto" data-fxid="{idVista}17">elementos.</span></div>
                <div class="contenedor componente columna {idVista}columna-16 col-6" data-fxid="{idVista}14">
                    <div data-fxid="{idVista}19" class="componente desplegable {idVista}desplegable-20 float-right"><select class="custom-select"></select></div><span class="componente texto {idVista}texto-7 float-right mt-1 mr-2" data-fxid="{idVista}6">Página:</span>
                </div>
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