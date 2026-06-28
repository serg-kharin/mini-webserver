package dev.sergei.miniwebserver.data

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

// Picks the app-private cache dir on whichever mounted volume has the most free
// space (usually the SD card). NanoHTTPD spools uploads there, so large transfers
// to the card don't fill up the small internal storage.
@Singleton
class UploadTempDirProvider
    @Inject
    constructor(
        @ApplicationContext private val context: Context,
    ) {
        fun dir(): File {
            val volumes = context.externalCacheDirs.filterNotNull() + context.cacheDir
            val best = volumes.maxByOrNull { it.usableSpace } ?: context.cacheDir
            return File(best, "uploads").apply { mkdirs() }
        }
    }
