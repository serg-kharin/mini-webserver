package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.core.ActivityTracker
import dev.sergei.miniwebserver.domain.model.OpenFile
import dev.sergei.miniwebserver.domain.usecase.OpenFileForDownload
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.TouchingInputStream
import dev.sergei.miniwebserver.server.folderParam
import dev.sergei.miniwebserver.server.pathParam
import dev.sergei.miniwebserver.server.queryParam
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import fi.iki.elonen.NanoHTTPD.newFixedLengthResponse
import java.io.InputStream
import java.net.URLEncoder
import javax.inject.Inject

private const val BYTES_PREFIX = "bytes="

private data class ByteRange(val start: Long, val end: Long)

class DownloadRoute
    @Inject
    constructor(
        private val openFile: OpenFileForDownload,
        private val activityTracker: ActivityTracker,
    ) : ApiRoute {
        override val method = Method.GET
        override val path = "/api/download"

        // Plain <a download> links can't send the anti-CSRF header; a read-only
        // file fetch is safe (a cross-site page can't read the response).
        override val requiresCsrf = false

        override fun handle(session: IHTTPSession): Response {
            val name = queryParam(session, "name").orEmpty()
            val file = openFile(folderParam(session), pathParam(session), name)
            val header = session.headers["range"]
            val response =
                when {
                    header == null -> fullResponse(file)
                    else -> rangeResponse(file, parseRange(header, file.size))
                }
            response.addHeader("Accept-Ranges", "bytes")
            response.addHeader("X-Content-Type-Options", "nosniff")
            response.addHeader("Content-Disposition", contentDisposition(name))
            return response
        }

        private fun fullResponse(file: OpenFile): Response =
            newFixedLengthResponse(Response.Status.OK, file.mime, touching(file.stream), file.size)

        // Serve the requested slice as 206, or 416 if the range is unsatisfiable.
        private fun rangeResponse(
            file: OpenFile,
            range: ByteRange?,
        ): Response {
            if (range == null) {
                file.stream.close()
                val response = newFixedLengthResponse(Response.Status.RANGE_NOT_SATISFIABLE, "text/plain", "")
                response.addHeader("Content-Range", "bytes */${file.size}")
                return response
            }
            skipFully(file.stream, range.start)
            val length = range.end - range.start + 1
            val response =
                newFixedLengthResponse(Response.Status.PARTIAL_CONTENT, file.mime, touching(file.stream), length)
            response.addHeader("Content-Range", "bytes ${range.start}-${range.end}/${file.size}")
            return response
        }

        private fun touching(stream: InputStream): InputStream =
            TouchingInputStream(stream) { activityTracker.touch(System.currentTimeMillis()) }

        // RFC 5987 encoding so non-ASCII names (e.g. Cyrillic) survive the header.
        private fun contentDisposition(name: String): String {
            val encoded = URLEncoder.encode(name, "UTF-8").replace("+", "%20")
            return "attachment; filename*=UTF-8''$encoded"
        }
    }

// Parses a single "bytes=start-end" range; null if absent/malformed/unsatisfiable.
private fun parseRange(
    header: String,
    size: Long,
): ByteRange? {
    if (size <= 0 || !header.startsWith(BYTES_PREFIX)) return null
    val spec = header.removePrefix(BYTES_PREFIX).substringBefore(',').trim()
    val dash = spec.indexOf('-')
    if (dash < 0) return null
    val startText = spec.substring(0, dash).trim()
    val endText = spec.substring(dash + 1).trim()
    val range = if (startText.isEmpty()) suffixRange(endText, size) else explicitRange(startText, endText, size)
    return range?.takeIf { it.start in 0 until size && it.end >= it.start }
        ?.let { ByteRange(it.start, it.end.coerceAtMost(size - 1)) }
}

private fun suffixRange(
    endText: String,
    size: Long,
): ByteRange? {
    val count = endText.toLongOrNull() ?: return null
    return if (count <= 0) null else ByteRange((size - count).coerceAtLeast(0), size - 1)
}

private fun explicitRange(
    startText: String,
    endText: String,
    size: Long,
): ByteRange? {
    val start = startText.toLongOrNull() ?: return null
    val end = if (endText.isEmpty()) size - 1 else endText.toLongOrNull() ?: return null
    return ByteRange(start, end)
}

private fun skipFully(
    stream: InputStream,
    count: Long,
) {
    var remaining = count
    while (remaining > 0) {
        val skipped = stream.skip(remaining)
        if (skipped > 0) {
            remaining -= skipped
        } else if (stream.read() < 0) {
            break
        } else {
            remaining--
        }
    }
}
