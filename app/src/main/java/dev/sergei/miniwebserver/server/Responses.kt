package dev.sergei.miniwebserver.server

import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.util.splitPath
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Response
import fi.iki.elonen.NanoHTTPD.newFixedLengthResponse
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.net.URLDecoder

private const val JSON_MIME = "application/json; charset=utf-8"
private const val HTTP_PAYLOAD_TOO_LARGE = 413
private const val HTTP_CONFLICT = 409

private val responseJson = Json { encodeDefaults = true }

@Serializable
private data class ResultBody(val ok: Boolean, val error: String? = null)

// NanoHTTPD's Status enum lacks these codes, so supply them as custom statuses.
private val payloadTooLarge = customStatus(HTTP_PAYLOAD_TOO_LARGE, "413 Payload Too Large")
private val conflict = customStatus(HTTP_CONFLICT, "409 Conflict")

private fun customStatus(
    code: Int,
    description: String,
): Response.IStatus =
    object : Response.IStatus {
        override fun getRequestStatus() = code

        override fun getDescription() = description
    }

fun jsonResponse(body: String): Response = newFixedLengthResponse(Response.Status.OK, JSON_MIME, body)

fun okResponse(): Response = jsonResponse(responseJson.encodeToString(ResultBody(ok = true)))

fun forbiddenResponse(): Response =
    newFixedLengthResponse(
        Response.Status.FORBIDDEN,
        JSON_MIME,
        responseJson.encodeToString(ResultBody(ok = false, error = "forbidden")),
    )

// Blocks cross-site requests: browsers can't set a custom header on a no-cors
// fetch or a form submit, so requiring one keeps other sites from calling the API.
fun hasCsrfHeader(session: IHTTPSession): Boolean = session.headers["x-requested-with"] != null

fun errorResponse(error: StorageError): Response =
    newFixedLengthResponse(statusFor(error), JSON_MIME, responseJson.encodeToString(ResultBody(ok = false, error = error.code)))

private fun statusFor(error: StorageError): Response.IStatus =
    when (error) {
        StorageError.UPLOAD_TOO_LARGE -> payloadTooLarge
        StorageError.FILE_EXISTS -> conflict
        StorageError.CREATE_FAILED,
        StorageError.MKDIR_FAILED,
        StorageError.DELETE_FAILED,
        StorageError.UNKNOWN,
        -> Response.Status.INTERNAL_ERROR
        else -> Response.Status.BAD_REQUEST
    }

// Reads a parameter from the raw query string in UTF-8. NanoHTTPD decodes
// multipart headers with the wrong charset, so file names ride in the query.
fun queryParam(
    session: IHTTPSession,
    key: String,
): String? {
    val raw = session.queryParameterString ?: return session.parameters[key]?.firstOrNull()
    for (pair in raw.split("&")) {
        val separator = pair.indexOf('=')
        if (separator <= 0) continue
        if (URLDecoder.decode(pair.substring(0, separator), "UTF-8") == key) {
            return URLDecoder.decode(pair.substring(separator + 1), "UTF-8")
        }
    }
    return session.parameters[key]?.firstOrNull()
}

fun folderParam(session: IHTTPSession): String = queryParam(session, "folder").orEmpty()

fun pathParam(session: IHTTPSession): List<String> = splitPath(queryParam(session, "path"))
