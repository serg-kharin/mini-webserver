package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.usecase.SearchCatalog
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.dto.toDto
import dev.sergei.miniwebserver.server.folderParam
import dev.sergei.miniwebserver.server.jsonResponse
import dev.sergei.miniwebserver.server.queryParam
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject

class SearchRoute
    @Inject
    constructor(
        private val searchCatalog: SearchCatalog,
        private val json: Json,
    ) : ApiRoute {
        override val method = Method.GET
        override val path = "/api/search"

        override fun handle(session: IHTTPSession): Response {
            val hits = searchCatalog(folderParam(session), queryParam(session, "q").orEmpty())
            return jsonResponse(json.encodeToString(hits.map { it.toDto() }))
        }
    }
