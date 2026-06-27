package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.usecase.ListDirectory
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.dto.toDto
import dev.sergei.miniwebserver.server.folderParam
import dev.sergei.miniwebserver.server.jsonResponse
import dev.sergei.miniwebserver.server.pathParam
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject

class ListRoute
    @Inject
    constructor(
        private val listDirectory: ListDirectory,
        private val json: Json,
    ) : ApiRoute {
        override val method = Method.GET
        override val path = "/api/list"

        override fun handle(session: IHTTPSession): Response {
            val listing = listDirectory(folderParam(session), pathParam(session))
            return jsonResponse(json.encodeToString(listing.toDto()))
        }
    }
