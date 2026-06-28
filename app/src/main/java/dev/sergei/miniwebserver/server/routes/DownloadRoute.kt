package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.usecase.OpenFileForDownload
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.folderParam
import dev.sergei.miniwebserver.server.pathParam
import dev.sergei.miniwebserver.server.queryParam
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import fi.iki.elonen.NanoHTTPD.newFixedLengthResponse
import java.net.URLEncoder
import javax.inject.Inject

class DownloadRoute
    @Inject
    constructor(
        private val openFile: OpenFileForDownload,
    ) : ApiRoute {
        override val method = Method.GET
        override val path = "/api/download"

        // Plain <a download> links can't send the anti-CSRF header; a read-only
        // file fetch is safe (a cross-site page can't read the response).
        override val requiresCsrf = false

        override fun handle(session: IHTTPSession): Response {
            val name = queryParam(session, "name").orEmpty()
            val file = openFile(folderParam(session), pathParam(session), name)
            val response = newFixedLengthResponse(Response.Status.OK, file.mime, file.stream, file.size)
            response.addHeader("Content-Disposition", contentDisposition(name))
            return response
        }

        // RFC 5987 encoding so non-ASCII names (e.g. Cyrillic) survive the header.
        private fun contentDisposition(name: String): String {
            val encoded = URLEncoder.encode(name, "UTF-8").replace("+", "%20")
            return "attachment; filename*=UTF-8''$encoded"
        }
    }
