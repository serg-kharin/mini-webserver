package dev.sergei.miniwebserver.core

const val DEFAULT_PORT = 8080

// NanoHTTPD spools the whole multipart body to a temp file before we copy it into
// SAF, so an upload briefly needs this much free space on the temp volume. Capped
// at 2 GB to stay clear of internal-storage limits on small devices.
const val MAX_UPLOAD_BYTES = 2L * 1024 * 1024 * 1024
