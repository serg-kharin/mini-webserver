package dev.sergei.miniwebserver.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import dev.sergei.miniwebserver.R
import dev.sergei.miniwebserver.core.DEFAULT_PORT
import dev.sergei.miniwebserver.ui.MainActivity

object ServerNotification {
    const val NOTIF_ID = 1
    private const val CHANNEL_ID = "miniwebserver_server"

    fun build(context: Context): Notification {
        ensureChannel(context)
        val openApp =
            PendingIntent.getActivity(
                context,
                0,
                Intent(context, MainActivity::class.java),
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
            )
        val stop =
            PendingIntent.getService(
                context,
                1,
                Intent(context, HttpService::class.java).setAction(HttpService.ACTION_STOP),
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
            )
        return NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(context.getString(R.string.notification_title))
            .setContentText(context.getString(R.string.notification_text, DEFAULT_PORT))
            .setSmallIcon(android.R.drawable.stat_sys_upload)
            .setOngoing(true)
            .setContentIntent(openApp)
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                context.getString(R.string.notification_stop),
                stop,
            )
            .build()
    }

    private fun ensureChannel(context: Context) {
        val channel =
            NotificationChannel(
                CHANNEL_ID,
                context.getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW,
            )
        context.getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }
}
