<?php
/**
 * Copyright, 2020, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

define('_inc',1);

//include(__DIR__.'/../servidor/foxtrot.php');
//foxtrot::inicializar();
?>
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="stylesheet" href="../recursos/css/bootstrap.min.css">
    <link rel="stylesheet" href="../recursos/css/foxtrot.css">
    <link rel="stylesheet" href="editor.css">
    <title>Editor de programación visual</title>
  </head>
  <body class="foxtrot-editor">
    <div class="container-fluid pt-4 pb-4 d-flex flex-column align-items-stretch">
        <div class="form-group row">
            <label class="col col-form-label">Controlador:</label>
            <div class="col-2">
                <input type="text" class="form-control form-control-sm" id="controlador">
            </div>
            <label class="col col-form-label">Método:</label>
            <div class="col-2">
                <input type="text" class="form-control form-control-sm" id="metodo">
            </div>
            <div class="col-5"></div>
            <div class="col">
                <button type="button" class="btn btn-primary btn-sm btn-block">Guardar</button>
            </div>
        </div>

        <div class="row cuerpo align-items-stretch">
            <div class="col-2">
                <div id="bloques">
                    <h1>Componentes</h1>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Leer propiedad</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Establecer propiedad</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de componente</button>

                    <h1>Cliente - Servidor</h1>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Enviar formulario</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de controlador</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de aplicación</button>

                    <h1>Control</h1>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Si</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Repetir</button>

                    <h1>Interfaz</h1>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de ui</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de foxtrot</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Sesión</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de controlador</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de aplicación</button>

                    <h1>Servidor</h1>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Consulta</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de controlador</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de aplicación</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Método de foxtrot</button>
                    <button type="button" class="btn btn-secondary btn-sm btn-block">Sesión</button>
                </div>

            </div>
            <div class="col-5">
                <div id="cliente">
                    <h1>Cliente</h1>

                    <div class="bloque flecha">
                        <h2>Enviar formulario</h2>
                    </div>

                    <div class="bloque" style="top:272px">
                        <h2>Si</h2>
                        <p><label>Condición</label> retorno</p>

                        <div class="row ramificacion align-items-stretch">
                            <div class="col">
                                <div>
                                    <h3>Verdadero</h3>                                
                                    <div class="bloque">
                                        <h2>Navegación</h2>
                                        <p><label>Destino</label> <span>principal</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <div>
                                    <h3>Falso</h3>
                                    <div class="bloque">
                                        <h2>Alerta</h2>
                                        <p><label>Mensaje</label> <span>Datos de acceso inválidos.</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                
            </div>
            <div class="col-5">
                <div id="servidor">
                    <h1>Servidor</h1>

                    <div class="bloque">
                        <h2>Consulta</h2>
                        <p><label>Modelo</label> <span>usuarios</span></p>
                        <p><label>Condición</label> <span>usuario=formulario.usuario</span></p>
                        <p><label>Asignar a</label> <span>$usuario</span></p>
                    </div>

                    <div class="bloque">
                        <h2>Método</h2>
                        <p><label>Método</label> <span>usuarios.validarContrasena</span></p>
                        <p><label>Parámetros</label> <span>$usuario, formulario.contrasena</span></p>
                        <p><label>Asignar a</label> <span>resultado</span></p>
                    </div>

                    <div class="bloque flecha">
                        <h2>Si</h2>
                        <p><label>Condición</label> resultado</p>

                        <div class="row ramificacion align-items-stretch">
                            <div class="col">
                                <div>
                                    <h3>Verdadero</h3>                                
                                    <div class="bloque">
                                        <h2>Iniciar sesión</h2>
                                        <p><label>Datos privados</label> <span>$usuario</span></p>
                                        <p><label>Condición</label> <span>usuario=formulario.usuario</span></p>
                                    </div>
                                    <div class="bloque">
                                        <h2>Retorno</h2>
                                        <p><label>Valor</label> <span>verdadero</span></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <div>
                                    <h3>Falso</h3>
                                    <div class="bloque">
                                        <h2>Retorno</h2>
                                        <p><label>Valor</label> <span>falso</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                
            </div>
        </div>
    </div>

    <style>
        .container-fluid {
            min-height: 100vh;
        }
        .cuerpo {
            flex: 1;
        }
        #cliente,#servidor {
            background-color: #f1f4f7;
            border-radius: 2px;
            min-height: 100%;
            position: relative;
        }
        #cliente h1,
        #servidor h1,
        h3 {
            text-transform: uppercase;
            font-size: 15px;
            background: #ced4da;
            padding: 7px 13px;
            margin-bottom: 20px;
            border-top-left-radius: 2px;
            border-top-right-radius: 2px;
        }
        .bloque {
            background-color: #fff;
            border-radius: 2px;
            margin: 20px;
            margin-top: 0;
            position: relative;
            padding: 13px;         
        }
        h2 {
            text-transform: uppercase;
            font-size: 15px;
            margin-bottom: 9px;
        }
        .bloque p {
            margin-bottom: 13px;
            display: flex;
            align-items: baseline;
        }
        .bloque p span {
            flex: 1;
        }
        .bloque p label {
            margin: 0;
            display: inline-block;
            background-color: #ced4da;
            padding: 5px 7px;
            border-radius: 4px;
            margin-right: 5px;
            flex-grow: 0;
        }
        .bloque>:last-child {
            margin-bottom: 0!important;
        }
        .bloque::before {
            content: "";
            position: absolute;
            left: 30px;
            width: 3px;
            height: 20px;
            background-color: #000;
            bottom: -20px;
        }
        .bloque:last-child::before,
        .bloque.flecha::before {
            display: none;
        }
        .flecha::after {
            content: "";
            position: absolute;
            background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDQ3Ni4yMTMgNDc2LjIxMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDc2LjIxMyA0NzYuMjEzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8cG9seWdvbiBwb2ludHM9IjM0NS42MDYsMTA3LjUgMzI0LjM5NCwxMjguNzEzIDQxOC43ODcsMjIzLjEwNyAwLDIyMy4xMDcgMCwyNTMuMTA3IDQxOC43ODcsMjUzLjEwNyAzMjQuMzk0LDM0Ny41IA0KCTM0NS42MDYsMzY4LjcxMyA0NzYuMjEzLDIzOC4xMDYgIi8+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8L3N2Zz4NCg==);
            width: 50px;
            height: 28px;
            background-repeat: no-repeat;
            background-position: center;
            background-size: cover;
            right: -60px;
            top: 10px;
            z-index: 99;
        }
        #servidor .flecha::after {
            transform: rotate(180deg);
            right: auto;
            left: -60px;
        }
        .ramificacion .col>div {            
            background-color: #f1f4f7;
            border-radius: 2px;
            min-height: 100%;
            position: relative;
        }
        h3 {
            font-size: 13px;
            margin-bottom: 10px;
        }
        .ramificacion .bloque {
            margin: 10px;
        }
        .ramificacion .bloque::after {
            height: 10px;
            bottom: -10px;
        }
        #bloques h1 {
            font-size: 15px;
            text-transform: uppercase;
            margin: 21px 0;
        }
        #bloques h1:first-child {
            margin-top: 7px;
        }
        .btn-secondary {
            background-color: #f1f4f7;
            border-color: #f1f4f7;
        }
    </style>
  </body>
</html>