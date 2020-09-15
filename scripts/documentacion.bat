@echo off

rem --------------------------------
rem ./documentacion [php] [js]
rem --------------------------------

set php=false
set js=false

if "%1"=="php" (set php=true)
if "%2"=="php" (set php=true)

if "%1"=="js" (set js=true)
if "%2"=="js" (set js=true)

if %php%==true (php ../../phpDocumentor-2.9.1/bin/phpdoc.php -d "../fuente/servidor" -t "../docs/phpdoc")
if %js%==true (jsdoc -r "../fuente/cliente" -d "../docs/jsdoc")

    