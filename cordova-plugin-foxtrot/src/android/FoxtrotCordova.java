package ar.foxtrot.cordova.plugin;

import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.widget.DatePicker;
import android.widget.TimePicker;
import android.widget.Toast;

import org.apache.cordova.*;
import org.json.JSONArray;
import org.json.JSONException;

import java.util.Calendar;
import java.util.Date;

public class FoxtrotCordova extends CordovaPlugin {
    private PrinterManager printerManager=null;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callback) throws JSONException {
		if(action.equalsIgnoreCase("imprimirTexto")) {
            this.imprimirTexto(args.optString(0), callback);
            return true;
        }

        if(action.equalsIgnoreCase("inicializar")) {
            this.inicializar(callback);
            return true;
        }

        if(action.equalsIgnoreCase("alert")) {
            this.alert(args.optString(0), callback);
            return true;
        }

        if(action.equalsIgnoreCase("confirm")) {
            this.confirm(args.optString(0), callback);
            return true;
        }

        if(action.equalsIgnoreCase("dialogoFecha")) {
            this.dialogoFecha(args.optString(0), callback);
            return true;
        }

        if(action.equalsIgnoreCase("dialogoHora")) {
            this.dialogoHora(args.optString(0), callback);
            return true;
        }

        return false;
    }

    private void inicializar(CallbackContext callback) {
        printerManager=new PrinterManager(obtenerContexto());
        printerManager.afterInject();
    }

    private void imprimirTexto(String cuerpo, CallbackContext callback) {
        if(printerManager==null||!printerManager.isPrinterReady()) {
            Toast.makeText(obtenerContexto(), "La impresora no está lista.", Toast.LENGTH_LONG).show();
            return;
        }
        printerManager.printJob(new PrinterJob(cuerpo));
    }

    private void alert(String mensaje, CallbackContext callback) {
        DialogInterface.OnClickListener dialogClickListener = new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
                callback.success();
            }
        };

        new AlertDialog.Builder(obtenerContexto())
            .setMessage(mensaje)
            .setPositiveButton("Aceptar", dialogClickListener)
            .create()
            .show();
    }

    private void confirm(String mensaje, CallbackContext callback) {
        DialogInterface.OnClickListener dialogClickListener = new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
                callback.success(which==DialogInterface.BUTTON_POSITIVE?1:0);
            }
        };

        new AlertDialog.Builder(obtenerContexto())
            .setMessage(mensaje)
            .setPositiveButton("Si", dialogClickListener)
            .setNegativeButton("No", dialogClickListener)
            .create()
            .show();
    }

    private void dialogoFecha(String fecha, CallbackContext callback) {
        Calendar c = Calendar.getInstance();
        int ano=c.get(Calendar.YEAR),
            mes=c.get(Calendar.MONTH),
            dia=c.get(Calendar.DATE);
        
        if(!fecha.equals("")&&!fecha.equals("null")) {
            try {
                String[] partes = fecha.split("/");
                ano = Integer.parseInt(partes[2]);
                mes = Integer.parseInt(partes[1]) - 1;
                dia = Integer.parseInt(partes[0]);
            } catch(Exception x) { }
        }
        
        new DatePickerDialog(obtenerContexto(),
            new DatePickerDialog.OnDateSetListener() {
                @Override
                public void onDateSet(DatePicker view, int year, int monthOfYear, int dayOfMonth) {
                    callback.success(String.valueOf(dayOfMonth) + "/" + (monthOfYear<10?"0":"") + String.valueOf(monthOfYear + 1) + "/" + String.valueOf(year));
                }
            }, ano, mes, dia).show();
    }

    private void dialogoHora(String hora, CallbackContext callback) {
        Calendar c = Calendar.getInstance();
        int hs=c.get(Calendar.HOUR),
            minutos=c.get(Calendar.MINUTE);

        if(!hora.equals("")&&!hora.equals("null")) {
            try {
                String[] partes = hora.split(":");
                hs = Integer.parseInt(partes[0]);
                minutos = Integer.parseInt(partes[1]);
            } catch(Exception x) { }
        }

        new TimePickerDialog(obtenerContexto(),
            new TimePickerDialog.OnTimeSetListener() {
                @Override
                public void onTimeSet(TimePicker view, int hourOfDay, int minute) {
                    callback.success(String.valueOf(hourOfDay) + ":" + (minute<10?"0":"") + String.valueOf(minute));
                }
            }, hs, minutos, true).show();
    }

    private Context obtenerContexto() {
        return this.cordova.getActivity();
    }
}
