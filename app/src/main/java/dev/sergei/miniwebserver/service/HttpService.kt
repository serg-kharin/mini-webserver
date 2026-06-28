package dev.sergei.miniwebserver.service

import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.IBinder
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
            serverState.setRunning(true)
        }
        return START_STICKY
    }

    override fun onDestroy() {
        server?.stop()
        server = null
        serverState.setRunning(false)
        super.onDestroy()
    }

    private companion object {
        const val SOCKET_TIMEOUT = 5000
    }
}
