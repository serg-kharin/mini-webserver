package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.usecase.CreateDirectory
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.folderParam
import dev.sergei.miniwebserver.server.okResponse
import dev.sergei.miniwebserver.server.pathParam
import dev.sergei.miniwebserver.server.queryParam
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import javax.inject.Inject

class MkdirRoute
    @Inject
    constructor(
        private val createDirectory: CreateDirectory,
    ) : ApiRoute {
        override val method = Method.POST
        override val path = "/api/mkdir"

        override fun handle(session: IHTTPSession): Response {
            createDirectory(folderParam(session), pathParam(session), queryParam(session, "name").orEmpty())
            return okResponse()
        }
    }
