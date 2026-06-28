package dev.sergei.miniwebserver.service

import android.annotation.SuppressLint
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.ServiceCompat
import dagger.hilt.android.AndroidEntryPoint
import dev.sergei.miniwebserver.core.ServerStateHolder
import dev.sergei.miniwebserver.server.WebServer
import javax.inject.Inject
import javax.inject.Provider

@AndroidEntryPoint
class HttpService : Service() {
    @Inject lateinit var serverProvider: Provider<WebServer>

    @Inject lateinit var serverState: ServerStateHolder

    private var server: WebServer? = null
    private var wakeLock: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        ServiceCompat.startForeground(
            this,
            ServerNotification.NOTIF_ID,
            ServerNotification.build(this),
            ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC,
        )
        if (server == null) {
            server = serverProvider.get().also { it.start(SOCKET_TIMEOUT, false) }
            wakeLock = acquireWakeLock()
            serverState.setRunning(true)
        }
        return START_STICKY
    }

    override fun onDestroy() {
        server?.stop()
        server = null
        wakeLock?.let { if (it.isHeld) it.release() }
        wakeLock = null
        serverState.setRunning(false)
        super.onDestroy()
    }

    // Held for the whole server lifetime and released in onDestroy; if the process
    // is killed the OS frees the partial wake lock anyway, so no timeout is needed.
    @SuppressLint("WakelockTimeout")
    private fun acquireWakeLock(): PowerManager.WakeLock =
        getSystemService(PowerManager::class.java)
            .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, WAKELOCK_TAG)
            .apply { acquire() }

    private companion object {
        const val SOCKET_TIMEOUT = 5000
        const val WAKELOCK_TAG = "MiniWebserver::server"
    }
}
