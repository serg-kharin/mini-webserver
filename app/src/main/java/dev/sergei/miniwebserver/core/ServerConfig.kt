package dev.sergei.miniwebserver.core

const val DEFAULT_PORT = 8080

// NanoHTTPD spools the whole multipart body to a temp file before we copy it into
// SAF, so an upload briefly needs this much free space on the temp volume. Capped
// at 2 GB to stay clear of internal-storage limits on small devices.
// This is the authoritative limit; if you change it, also update the client mirror
// in web/src/domain/config.ts (MAX_UPLOAD_BYTES).
const val MAX_UPLOAD_BYTES = 2L * 1024 * 1024 * 1024

// Suffix for the in-progress upload file; hidden from listings and replaced on
// completion. An orphan (from a killed upload) must not show up as a real file.
const val UPLOAD_TEMP_SUFFIX = ".part"
