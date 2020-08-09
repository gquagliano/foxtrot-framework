package ar.foxtrot.cordova.plugin;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.os.Handler;
import android.support.annotation.UiThread;
import android.util.Log;
import android.widget.Toast;

import java.util.LinkedList;
import java.util.List;

public class PrinterManager {
    private static final String ANDROID_USB_PERMISSION = "ar.foxtrot.cordova.plugin;.ACTION_USB_PERMISSION";
    private static final int recheckRate = 1000;
    private static final int bulkModeTimeout = 5000;

    UsbManager usbManager;

    Context ctx;

    private UsbDevice usbDevice;
    private boolean printerReady = false;
    private List<PrinterJob> printerJobList = new LinkedList<>();
    private final PrinterConnection currentConnection = new PrinterConnection();

    public PrinterManager(Context c) {
        ctx = c;
        usbManager = (UsbManager) ctx.getSystemService(ctx.USB_SERVICE);
    }

    public void afterInject() {
        registerReceivers();

        try {
            List<UsbDevice> devices = UsbDeviceFilter.getMatchingHostDevices(ctx);

            if (devices.size() > 0) {
                askUsbPermissions(devices.get(0));
            }
        } catch (Exception e) { }
    }

    public void unRegisterReceivers() {
        try {
            ctx.unregisterReceiver(usbBroadcastReceiver);
        } catch (Exception e) {
            // No need to handle
        }
    }

    public void registerReceivers() {
        IntentFilter filter = new IntentFilter(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
        filter.addAction(ANDROID_USB_PERMISSION);
        ctx.registerReceiver(usbBroadcastReceiver, filter);
    }

    public boolean isPrinterReady() {
        return printerReady;
    }

    public int currentJobs() {
        return printerJobList.size();
    }

    public void printJob(final PrinterJob job) {
        synchronized (printerJobList) {
            this.printerJobList.add(job);
        }
    }

    protected void processPrinterJobs() {
        if (printerReady) {
            synchronized (printerJobList) {
                if (printerJobList.size() > 0) {
                    synchronized (currentConnection) {
                        PrinterConnection newConn = getAndOpenPrinterConnection();
                        if (newConn != null) {

                            currentConnection.setPrinterConnection(newConn);
                            while (printerJobList.size() > 0) {
                                final PrinterJob job = printerJobList.get(0);
                                if (executePrintJob(currentConnection, job)) {
                                    printerJobList.remove(0);
                                } else {
                                    break;
                                }
                            }

                            currentConnection.closeConnection();
                        } else {
                        }
                    }
                }
            }
        }

        checkPrintJobs();
    }

    public void checkPrintJobs() {
        new Handler().postDelayed(new Runnable() {
            public void run() {
                processPrinterJobs();
            }
        }, recheckRate);
    }

    private boolean executePrintJob(final PrinterConnection printerConnection, final PrinterJob job) {
        return printerConnection.active && printerConnection.connection.bulkTransfer(
                printerConnection.endPoint, job.text.getBytes(), job.text.getBytes().length, bulkModeTimeout) >= 0;
    }

    private PrinterConnection getAndOpenPrinterConnection() {
        PrinterConnection printerConnection = null;
        if (usbManager.hasPermission(usbDevice)) {
            UsbInterface iface = usbDevice.getInterface(0);
            for (int i = 0; i < iface.getEndpointCount(); i++) {
                final UsbEndpoint endPoint = iface.getEndpoint(i);
                if (endPoint.getType() == UsbConstants.USB_ENDPOINT_XFER_BULK && endPoint.getDirection() == UsbConstants.USB_DIR_OUT) {
                    printerConnection = new PrinterConnection();
                    printerConnection.connection = usbManager.openDevice(usbDevice);

                    if (printerConnection.connection == null) {
                        return null;
                    }

                    printerConnection.iface = iface;
                    printerConnection.endPoint = endPoint;
                    printerConnection.connection.claimInterface(iface, true);
                    printerConnection.active = true;
                    break;
                }
            }
        }

        return printerConnection;
    }

    private void askUsbPermissions(UsbDevice device) {
        PendingIntent permissionIntent = PendingIntent.getBroadcast(ctx, 0, new Intent(ANDROID_USB_PERMISSION), 0);
        usbManager.requestPermission(device, permissionIntent);
    }

    private final BroadcastReceiver usbBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (UsbManager.ACTION_USB_DEVICE_ATTACHED.equals(intent.getAction())) {
                UsbDevice dev = (UsbDevice) intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                askUsbPermissions(dev);
            } else if (UsbManager.ACTION_USB_DEVICE_DETACHED.equals(intent.getAction())) {
                if (usbDevice != null) {
                    synchronized (currentConnection) {
                        currentConnection.closeConnection();
                    }
                }
            } else if (ANDROID_USB_PERMISSION.equals(intent.getAction())) {
                synchronized (this) {
                    usbDevice = (UsbDevice) intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    printerReady = (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false) && usbDevice != null);
                    Toast.makeText(ctx, "Impresora conectada.", Toast.LENGTH_LONG).show();
                    checkPrintJobs();
                }
            }
        }
    };

    private class PrinterConnection {
        UsbDeviceConnection connection = null;
        UsbEndpoint endPoint = null;
        UsbInterface iface = null;
        boolean active = false;

        public void setPrinterConnection(final PrinterConnection printerConnection) {
            if (printerConnection != null) {
                this.connection = printerConnection.connection;
                this.endPoint = printerConnection.endPoint;
                this.iface = printerConnection.iface;
                this.active = printerConnection.active;
            }
        }

        public void closeConnection() {
            if (active) {
                connection.releaseInterface(iface);
                active = false;
                connection = null;
                endPoint = null;
                iface = null;
            } else {
            }
        }
    }
}
