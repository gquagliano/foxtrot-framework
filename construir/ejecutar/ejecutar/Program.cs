/**
 * Copyright, 2021, Gabriel Quagliano. Bajo licencia Apache 2.0.
 * 
 * Esta pequeña utilidad se implementa en conjunto con la función ejecutar() en PHP para ejecutar comandos sin esperar su resolución y permitiendo que
 * continúe su ejecución luego de finalizada la solicitud.
 * 
 * La razón por la cual se realiza de esta forma es que no es posible en forma fehaciente y simple ejecutar comandos desde PHP en Windows sin esperar el resultado, 
 * mientras que trucos como utilizar "start /B" no es equivalente a ejecutar el comando directamente en la consola, por lo que vuelven más complejo el proceso.
 * 
 * ejecutar.exe "ruta de trabajo" comando "argumentos" [usuario contraseña]
 * 
 * @author Gabriel Quagliano - gabriel.quagliano@gmail.com
 * @version 1.0
 */

using System.Diagnostics;
using System.Net;

namespace ejecutar {
    class Program {
        static void Main(string[] args) {
            string ruta = args[0],
                comando = args[1],
                argumentos = args[2],
                usuario=null,
                contrasena=null;
            if (args.Length == 5) {
                usuario = args[3];
                contrasena = args[4];
            }
            
            ProcessStartInfo pInfo = new ProcessStartInfo(comando, argumentos);
            pInfo.UseShellExecute = false;
            pInfo.RedirectStandardInput = true;
            pInfo.RedirectStandardError = true;
            pInfo.RedirectStandardOutput = true;
            pInfo.WindowStyle = ProcessWindowStyle.Normal;
            pInfo.WorkingDirectory = ruta;
            pInfo.LoadUserProfile = true;
            if (usuario != null) pInfo.UserName = usuario;
            if (contrasena != null) pInfo.Password = new NetworkCredential(usuario, contrasena).SecurePassword;
            Process.Start(pInfo);
        }
    }
}
