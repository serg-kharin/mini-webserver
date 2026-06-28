package dev.sergei.miniwebserver.domain.model

import java.io.InputStream

// A file opened for download: its bytes plus the metadata needed for headers.
data class OpenFile(
    val stream: InputStream,
    val size: Long,
    val mime: String,
)
