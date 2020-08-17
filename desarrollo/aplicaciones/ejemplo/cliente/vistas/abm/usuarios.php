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
<title>Usuarios</title></head>

<body>
    <div id="foxtrot-cuerpo" class="componente contenedor vista" data-fxid="abm-usuarios-2">
        <div class="componente contenedor container-fluid abm-usuarios-contenedor-33 d-flex flex-column" data-fxid="abm-usuarios-4">
            <h1 class="componente texto" data-fxid="abm-usuarios-34">Usuarios</h1>
            <div class="row contenedor componente fila" data-fxid="abm-usuarios-56">
                <div class="contenedor componente abm-usuarios-columna-58 col- col-12 col-lg-6 col-xl-8 columna" data-fxid="abm-usuarios-57"><a href="#" data-fxid="abm-usuarios-35" class="componente btn btn-primary abm-usuarios-boton-36 boton">Crear nuevo</a></div>
                <div class="contenedor componente abm-usuarios-columna-4 col-12 col-lg-6 col-xl-4 columna" data-fxid="abm-usuarios-3">
                    <div class="row contenedor componente fila abm-usuarios-fila-2 mt-3 mt-lg-0" data-fxid="abm-usuarios-5">
                        <div class="contenedor componente abm-usuarios-columna-15 col-9 columna" data-fxid="abm-usuarios-8">
                            <div data-fxid="abm-usuarios-10" class="componente abm-usuarios-campo-filtro campo"><input class="form-control" type="text" placeholder="Filtrar..."></div>
                        </div>
                        <div class="contenedor componente abm-usuarios-columna-14 col-3 columna" data-fxid="abm-usuarios-11"><a href="#" data-fxid="abm-usuarios-12" class="componente btn abm-usuarios-boton-13 d-block btn-secondary boton">Filtrar<br></a></div>
                    </div>
                </div>
            </div>
            <div class="formulario componente contenedor abm-usuarios-form-38 formulario-tabla mt-4 form" data-fxid="abm-usuarios-37">
                <div data-fxid="abm-usuarios-39" class="componente ocultar-contenidos abm-usuarios-tabla-tabla tabla">
                    <div class="table-responsive">
                        <table class="table table-stripped table-hover contenedor" cellspacing="0">
                            <tbody class="contenedor">
                                <tr data-fxid="abm-usuarios-40" class="componente contenedor abm-usuarios-tabla-fila-41 tabla-fila">
                                    <td data-fxid="abm-usuarios-42" class="componente contenedor abm-usuarios-tabla-columna-43 tabla-columna"><span class="etiqueta componente abm-usuarios-etiqueta-45" data-fxid="abm-usuarios-44"></span></td>
                                    <td data-fxid="abm-usuarios-46" class="componente contenedor abm-usuarios-tabla-columna-47 tabla-columna"><span class="etiqueta componente abm-usuarios-etiqueta-49" data-fxid="abm-usuarios-48"></span></td>
                                    <td data-fxid="abm-usuarios-50" class="componente contenedor abm-usuarios-tabla-columna-51 tabla-columna"><a href="#" data-fxid="abm-usuarios-52" class="componente btn abm-usuarios-boton-54 boton">Modificar</a><a href="#" data-fxid="abm-usuarios-53" class="componente btn abm-usuarios-boton-55 boton">Eliminar</a></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script src="cliente/foxtrot.js"></script>
    <script src="aplicacion/cliente/controladores/abm/usuarios.js" controlador=""></script>
    <script src="aplicacion/cliente/aplicacion.js"></script>
    <script>
        var jsonFoxtrot='{"version":1,"componentes":[{"id":"abm-usuarios-2","nombre":null,"componente":"vista","propiedades":{"titulo":"Usuarios"}},{"id":"abm-usuarios-4","nombre":null,"selector":".abm-usuarios-contenedor-33","componente":"contenedor","propiedades":{"tipo":"fluido","alto":{"g":"100vh"},"estructura":{"g":"flexVertical"}}},{"id":"abm-usuarios-34","nombre":null,"selector":null,"componente":"texto","propiedades":{"formato":"h1"}},{"id":"abm-usuarios-35","nombre":null,"selector":".abm-usuarios-boton-36","componente":"boton","propiedades":{"tipo":"boton","estilo":"primary","click":"ir:abm/usuario","menuContextual":""}},{"id":"abm-usuarios-37","nombre":null,"selector":".abm-usuarios-form-38","componente":"form","propiedades":{"margen":{"g":""},"clase":"formulario-tabla mt-4","color":{"g":""},"flex":{"g":"99"}}},{"id":"abm-usuarios-39","nombre":"tabla","selector":".abm-usuarios-tabla-tabla","componente":"tabla","propiedades":{"ocultarContenidos":true,"vacia":"Sin datos.","margen":{"g":""}}},{"id":"abm-usuarios-40","nombre":null,"selector":".abm-usuarios-tabla-fila-41","componente":"tabla-fila","propiedades":{}},{"id":"abm-usuarios-42","nombre":null,"selector":".abm-usuarios-tabla-columna-43","componente":"tabla-columna","propiedades":{"encabezado":"Nombre","encabezadoActivo":true}},{"id":"abm-usuarios-44","nombre":null,"selector":".abm-usuarios-etiqueta-45","componente":"etiqueta","propiedades":{"propiedad":"nombre"}},{"id":"abm-usuarios-46","nombre":null,"selector":".abm-usuarios-tabla-columna-47","componente":"tabla-columna","propiedades":{"encabezado":"Usuario","encabezadoActivo":true}},{"id":"abm-usuarios-48","nombre":null,"selector":".abm-usuarios-etiqueta-49","componente":"etiqueta","propiedades":{"propiedad":"usuario","alto":{"g":""}}},{"id":"abm-usuarios-50","nombre":null,"selector":".abm-usuarios-tabla-columna-51","componente":"tabla-columna","propiedades":{"encabezado":"Opciones","encabezadoActivo":true}},{"id":"abm-usuarios-52","nombre":null,"selector":".abm-usuarios-boton-54","componente":"boton","propiedades":{"tipo":"boton","click":"ir:abm/usuario/?id={id}","menuContextual":"","intro":""}},{"id":"abm-usuarios-53","nombre":null,"selector":".abm-usuarios-boton-55","componente":"boton","propiedades":{"tipo":"boton","click":"eliminar","menuContextual":""}},{"id":"abm-usuarios-56","nombre":null,"selector":null,"componente":"fila","propiedades":{}},{"id":"abm-usuarios-57","nombre":null,"selector":".abm-usuarios-columna-58","componente":"columna","propiedades":{"columna":{"g":"12","lg":"6","xl":"8"}}},{"id":"abm-usuarios-3","nombre":"","selector":".abm-usuarios-columna-4","componente":"columna","propiedades":{"ancho":{"g":""},"columna":{"g":"12","lg":"6","xl":"4"},"clase":""}},{"id":"abm-usuarios-5","nombre":null,"selector":".abm-usuarios-fila-2","componente":"fila","propiedades":{"clase":"mt-3 mt-lg-0","color":{"g":"","lg":""}}},{"id":"abm-usuarios-8","nombre":null,"selector":".abm-usuarios-columna-15","componente":"columna","propiedades":{"columna":{"g":"9"}}},{"id":"abm-usuarios-10","nombre":"filtro","selector":".abm-usuarios-campo-filtro","componente":"campo","propiedades":{"relleno":"Filtrar...","click":"","intro":"cargarDatos","menuContextual":"","clase":"","color":{"md":"red"}}},{"id":"abm-usuarios-11","nombre":null,"selector":".abm-usuarios-columna-14","componente":"columna","propiedades":{"columna":{"g":"3"}}},{"id":"abm-usuarios-12","nombre":null,"selector":".abm-usuarios-boton-13","componente":"boton","propiedades":{"tipo":"boton","menuContextual":"","click":"cargarDatos","estructura":{"g":"bloque"},"estilo":"secondary"}}],"nombre":"abm/usuarios"}';
        ui.inicializar("abm/usuarios")
            .establecerJson(jsonFoxtrot)
            .ejecutar();
    </script>



</body></html>