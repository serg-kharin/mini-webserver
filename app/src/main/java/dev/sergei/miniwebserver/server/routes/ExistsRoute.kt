package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.usecase.FileExists
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.folderParam
import dev.sergei.miniwebserver.server.jsonResponse
import dev.sergei.miniwebserver.server.pathParam
import dev.sergei.miniwebserver.server.queryParam
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import javax.inject.Inject

class ExistsRoute
    @Inject
    constructor(
        private val fileExists: FileExists,
    ) : ApiRoute {
        override val method = Method.GET
        override val path = "/api/exists"

        override fun handle(session: IHTTPSession): Response {
            val exists = fileExists(folderParam(session), pathParam(session), queryParam(session, "name").orEmpty())
            return jsonResponse("""{"exists":$exists}""")
        }
    }
