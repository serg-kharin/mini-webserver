package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.usecase.DeleteEntry
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.folderParam
import dev.sergei.miniwebserver.server.okResponse
import dev.sergei.miniwebserver.server.pathParam
import dev.sergei.miniwebserver.server.queryParam
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import javax.inject.Inject

class DeleteRoute
    @Inject
    constructor(
        private val deleteEntry: DeleteEntry,
    ) : ApiRoute {
        override val method = Method.POST
        override val path = "/api/delete"

        override fun handle(session: IHTTPSession): Response {
            deleteEntry(folderParam(session), pathParam(session), queryParam(session, "name").orEmpty())
            return okResponse()
        }
    }
