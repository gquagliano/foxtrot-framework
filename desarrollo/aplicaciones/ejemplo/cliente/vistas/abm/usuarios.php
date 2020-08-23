<!doctype html><html lang="es"><head>
    <meta charset="utf-8">
    <base href="<?=\foxtrot::obtenerUrl()?>">
    <meta name="msapplication-tap-highlight" content="no">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover">
    <link rel="stylesheet" href="recursos/css/foxtrot.css" combinar="">
    <link rel="stylesheet" href="recursos/css/tema-sistema.css" combinar="" tema="">
    <link rel="stylesheet" href="aplicacion/recursos/css/estilos.css" combinar="">
    <link rel="stylesheet" href="aplicacion/cliente/vistas/abm/usuarios.css">
    <meta name="generator" content="Foxtrot 7">
    <title>Usuarios</title>
</head>

<body>
    <div id="foxtrot-cuerpo" class="componente contenedor vista" data-fxid="abm-usuarios-2">
        <div class="componente contenedor abm-usuarios-contenedor-33 container-fluid d-flex flex-column" data-fxid="abm-usuarios-4">
            <h1 class="componente texto" data-fxid="abm-usuarios-34">Usuarios</h1>
            <div class="row contenedor componente fila" data-fxid="abm-usuarios-56">
                <div class="contenedor componente abm-usuarios-columna-58 col- col-12 col-lg-6 col-xl-8 columna" data-fxid="abm-usuarios-57"><a href="#" data-fxid="abm-usuarios-35" class="componente btn btn-primary abm-usuarios-boton-36 boton">Nuevo usuario</a></div>
                <div class="contenedor componente abm-usuarios-columna-4 col-12 col-lg-6 col-xl-4 columna" data-fxid="abm-usuarios-3">
                    <div class="row contenedor componente fila abm-usuarios-fila-2 mt-3 mt-lg-0" data-fxid="abm-usuarios-5">
                        <div class="contenedor componente abm-usuarios-columna-15 col-9 columna" data-fxid="abm-usuarios-8">
                            <div data-fxid="abm-usuarios-10" class="componente abm-usuarios-campo-filtro campo"><input class="form-control" type="text" placeholder="Filtrar..."></div>
                        </div>
                        <div class="contenedor componente abm-usuarios-columna-14 col-3 columna" data-fxid="abm-usuarios-11"><a href="#" data-fxid="abm-usuarios-12" class="componente btn abm-usuarios-boton-13 d-block btn-secondary boton">Filtrar<br></a></div>
                    </div>
                </div>
            </div>
            <div class="formulario componente contenedor abm-usuarios-form-38 form formulario-tabla mt-4 mb-4" data-fxid="abm-usuarios-37">
                <div data-fxid="abm-usuarios-39" class="componente ocultar-contenidos abm-usuarios-tabla-tabla tabla">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover contenedor" cellspacing="0">
                            <tbody class="contenedor">
                                <tr data-fxid="abm-usuarios-40" class="componente contenedor abm-usuarios-tabla-fila-41 tabla-fila">
                                    <td data-fxid="abm-usuarios-42" class="componente contenedor abm-usuarios-tabla-columna-43 tabla-columna"><span class="etiqueta componente abm-usuarios-etiqueta-45" data-fxid="abm-usuarios-44"></span></td>

                                    <td data-fxid="abm-usuarios-46-2" class="componente contenedor abm-usuarios-tabla-columna-47 tabla-columna"><span class="etiqueta componente abm-usuarios-etiqueta-49" data-fxid="abm-usuarios-48-2"></span></td><td data-fxid="abm-usuarios-46-1" class="componente contenedor abm-usuarios-tabla-columna-47 tabla-columna"><span class="etiqueta componente abm-usuarios-etiqueta-49" data-fxid="abm-usuarios-48-1"></span></td>

                                    

                                    <td data-fxid="abm-usuarios-46-3" class="componente contenedor abm-usuarios-tabla-columna-47 tabla-columna"><span class="etiqueta componente abm-usuarios-etiqueta-49" data-fxid="abm-usuarios-48-3"></span></td>

                                    

                                    

                                    

                                    <td data-fxid="abm-usuarios-50" class="componente contenedor abm-usuarios-tabla-columna-51 tabla-columna"><a href="#" data-fxid="abm-usuarios-52" class="componente btn abm-usuarios-boton-54 boton">Modificar</a><a href="#" data-fxid="abm-usuarios-53" class="componente btn abm-usuarios-boton-55 boton">Eliminar</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="row contenedor componente fila abm-usuarios-fila-21 mb-4 align-items-center" data-fxid="abm-usuarios-9">
                <div class="contenedor componente columna abm-usuarios-columna-17 col-6" data-fxid="abm-usuarios-13"><span class="etiqueta componente abm-usuarios-etiqueta-cantidad mr-2" data-fxid="abm-usuarios-18"></span><span class="componente texto" data-fxid="abm-usuarios-17">elementos.</span></div>
                <div class="contenedor componente columna abm-usuarios-columna-16 col-6" data-fxid="abm-usuarios-14">
                    <div data-fxid="abm-usuarios-19" class="componente desplegable abm-usuarios-desplegable-20 float-right"><select class="custom-select"></select></div><span class="componente texto abm-usuarios-texto-7 float-right mt-1 mr-2" data-fxid="abm-usuarios-6">Página:</span>
                </div>
            </div>
        </div>
    </div>
    <div id="foxtrot-barra-precarga" class="aparece"></div>
    <script src="cliente/foxtrot.js"></script>
    <script src="aplicacion/cliente/controladores/abm/usuarios.js" controlador=""></script>
    <script src="aplicacion/cliente/aplicacion.js"></script>
    <script>
        var jsonFoxtrot='{"version":1,"componentes":[{"id":"abm-usuarios-2","componente":"vista","propiedades":{"titulo":"Usuarios"}},{"id":"abm-usuarios-4","selector":".abm-usuarios-contenedor-33","componente":"contenedor","propiedades":{"tipo":"fluido","alto":{"g":"100vh"},"estructura":{"g":"flexVertical"}}},{"id":"abm-usuarios-34","componente":"texto","propiedades":{"formato":"h1"}},{"id":"abm-usuarios-35","selector":".abm-usuarios-boton-36","componente":"boton","propiedades":{"tipo":"boton","estilo":"primary","click":"ir:abm/usuario"}},{"id":"abm-usuarios-37","selector":".abm-usuarios-form-38","componente":"form","propiedades":{"clase":"formulario-tabla mt-4 mb-4","flex":{"g":"1"}}},{"id":"abm-usuarios-39","nombre":"tabla","selector":".abm-usuarios-tabla-tabla","componente":"tabla","propiedades":{"ocultarContenidos":true,"vacia":"Sin datos."}},{"id":"abm-usuarios-40","selector":".abm-usuarios-tabla-fila-41","componente":"tabla-fila"},{"id":"abm-usuarios-42","selector":".abm-usuarios-tabla-columna-43","componente":"tabla-columna","propiedades":{"encabezado":"Código","encabezadoActivo":true,"columna":"id"}},{"id":"abm-usuarios-44","selector":".abm-usuarios-etiqueta-45","componente":"etiqueta","propiedades":{"propiedad":"id"}},{"id":"abm-usuarios-46-1","selector":".abm-usuarios-tabla-columna-47","componente":"tabla-columna","propiedades":{"encabezado":"Nombre","encabezadoActivo":true,"columna":"nombre"}},{"id":"abm-usuarios-48-1","selector":".abm-usuarios-etiqueta-49","componente":"etiqueta","propiedades":{"propiedad":"nombre"}},{"id":"abm-usuarios-46-2","selector":".abm-usuarios-tabla-columna-47","componente":"tabla-columna","propiedades":{"encabezado":"Nivel de acceso","encabezadoActivo":true,"columna":"nivel"}},{"id":"abm-usuarios-48-2","selector":".abm-usuarios-etiqueta-49","componente":"etiqueta","propiedades":{"contenido":"{aplicacion.nivelesUsuario[nivel]}"}},{"id":"abm-usuarios-46-3","selector":".abm-usuarios-tabla-columna-47","componente":"tabla-columna","propiedades":{"encabezado":"Nombre de usuario","encabezadoActivo":true,"columna":"usuario"}},{"id":"abm-usuarios-48-3","selector":".abm-usuarios-etiqueta-49","componente":"etiqueta","propiedades":{"propiedad":"usuario"}},{"id":"abm-usuarios-50","selector":".abm-usuarios-tabla-columna-51","componente":"tabla-columna","propiedades":{"encabezado":"Opciones"}},{"id":"abm-usuarios-52","selector":".abm-usuarios-boton-54","componente":"boton","propiedades":{"tipo":"boton","click":"ir:abm/usuario/?id={id}"}},{"id":"abm-usuarios-53","selector":".abm-usuarios-boton-55","componente":"boton","propiedades":{"tipo":"boton","click":"eliminar"}},{"id":"abm-usuarios-56","componente":"fila"},{"id":"abm-usuarios-57","selector":".abm-usuarios-columna-58","componente":"columna","propiedades":{"columna":{"g":"12","lg":"6","xl":"8"}}},{"id":"abm-usuarios-3","selector":".abm-usuarios-columna-4","componente":"columna","propiedades":{"columna":{"g":"12","lg":"6","xl":"4"}}},{"id":"abm-usuarios-5","selector":".abm-usuarios-fila-2","componente":"fila","propiedades":{"clase":"mt-3 mt-lg-0"}},{"id":"abm-usuarios-8","selector":".abm-usuarios-columna-15","componente":"columna","propiedades":{"columna":{"g":"9"}}},{"id":"abm-usuarios-10","nombre":"filtro","selector":".abm-usuarios-campo-filtro","componente":"campo","propiedades":{"relleno":"Filtrar...","intro":"filtrar"}},{"id":"abm-usuarios-11","selector":".abm-usuarios-columna-14","componente":"columna","propiedades":{"columna":{"g":"3"}}},{"id":"abm-usuarios-12","selector":".abm-usuarios-boton-13","componente":"boton","propiedades":{"tipo":"boton","click":"filtrar","estructura":{"g":"bloque"},"estilo":"secondary"}},{"id":"abm-usuarios-9","selector":".abm-usuarios-fila-21","componente":"fila","propiedades":{"clase":"mb-4","justificacionItems":{"g":"centro"}}},{"id":"abm-usuarios-13","selector":".abm-usuarios-columna-17","componente":"columna","propiedades":{"columna":{"g":"6"}}},{"id":"abm-usuarios-14","selector":".abm-usuarios-columna-16","componente":"columna","propiedades":{"columna":{"g":"6"}}},{"id":"abm-usuarios-17","componente":"texto","propiedades":{"formato":"enLinea"}},{"id":"abm-usuarios-18","nombre":"cantidad","selector":".abm-usuarios-etiqueta-cantidad","componente":"etiqueta","propiedades":{"clase":"mr-2"}},{"id":"abm-usuarios-19","nombre":"pagina","selector":".abm-usuarios-desplegable-20","componente":"desplegable","propiedades":{"flotar":{"g":"derecha"},"modificacion":"cargarDatos"}},{"id":"abm-usuarios-6","selector":".abm-usuarios-texto-7","componente":"texto","propiedades":{"formato":"enLinea","flotar":{"g":"derecha"},"clase":"mt-1 mr-2"}}],"nombre":"abm/usuarios"}';
        ui.inicializar("abm/usuarios")
            .establecerJson(jsonFoxtrot)
            .ejecutar();
    </script>





</body></html>