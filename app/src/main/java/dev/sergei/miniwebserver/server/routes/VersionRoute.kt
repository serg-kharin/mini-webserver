package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.usecase.GetAppVersion
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.jsonResponse
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject

@Serializable
private data class VersionBody(val app: String)

class VersionRoute
    @Inject
    constructor(
        private val getAppVersion: GetAppVersion,
        private val json: Json,
    ) : ApiRoute {
        override val method = Method.GET
        override val path = "/api/version"

        override fun handle(session: IHTTPSession): Response = jsonResponse(json.encodeToString(VersionBody(getAppVersion())))
    }
