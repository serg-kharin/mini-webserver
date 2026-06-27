package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.usecase.GetFolders
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.dto.toDto
import dev.sergei.miniwebserver.server.jsonResponse
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject

class FoldersRoute
    @Inject
    constructor(
        private val getFolders: GetFolders,
        private val json: Json,
    ) : ApiRoute {
        override val method = Method.GET
        override val path = "/api/folders"

        override fun handle(session: IHTTPSession): Response = jsonResponse(json.encodeToString(getFolders().map { it.toDto() }))
    }
