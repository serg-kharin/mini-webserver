package dev.sergei.miniwebserver.data

import android.webkit.MimeTypeMap
import java.util.Locale

// Hi-res audio formats the platform doesn't recognize.
private val EXTRA_MIME =
    mapOf(
        "dsf" to "audio/x-dsd",
        "dff" to "audio/x-dsd",
    )

fun mimeOf(name: String): String {
    val extension = name.substringAfterLast('.', "").lowercase(Locale.ROOT)
    return MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
        ?: EXTRA_MIME[extension]
        ?: "application/octet-stream"
}
