package dev.sergei.miniwebserver.service

import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import androidx.core.app.ServiceCompat
import dagger.hilt.android.AndroidEntryPoint
import dev.sergei.miniwebserver.core.ActivityTracker
import dev.sergei.miniwebserver.core.ServerStateHolder
import dev.sergei.miniwebserver.server.WebServer
import javax.inject.Inject
import javax.inject.Provider

@AndroidEntryPoint
class HttpService : Service() {
    @Inject lateinit var serverProvider: Provider<WebServer>

    @Inject lateinit var serverState: ServerStateHolder

    @Inject lateinit var activityTracker: ActivityTracker

    private var server: WebServer? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private val idleHandler = Handler(Looper.getMainLooper())
    private val idleWatchdog =
        object : Runnable {
            override fun run() {
                if (activityTracker.idleFor(System.currentTimeMillis()) >= IDLE_TIMEOUT_MS) {
                    stopSelf()
                } else {
                    idleHandler.postDelayed(this, IDLE_CHECK_MS)
                }
            }
        }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int,
    ): Int {
        if (intent?.action == ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }
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
            activityTracker.touch(System.currentTimeMillis())
            idleHandler.postDelayed(idleWatchdog, IDLE_CHECK_MS)
        }
        return START_STICKY
    }

    override fun onDestroy() {
        idleHandler.removeCallbacks(idleWatchdog)
        server?.stop()
        server = null
        wakeLock?.let { if (it.isHeld) it.release() }
        wakeLock = null
        serverState.setRunning(false)
        super.onDestroy()
    }

    private fun acquireWakeLock(): PowerManager.WakeLock =
        getSystemService(PowerManager::class.java)
            .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, WAKELOCK_TAG)
            .apply { acquire() }

    companion object {
        const val ACTION_STOP = "dev.sergei.miniwebserver.action.STOP"
        private const val SOCKET_TIMEOUT = 5000
        private const val WAKELOCK_TAG = "MiniWebserver::server"
        private const val IDLE_TIMEOUT_MS = 30L * 60 * 1000
        private const val IDLE_CHECK_MS = 60L * 1000
    }
}
