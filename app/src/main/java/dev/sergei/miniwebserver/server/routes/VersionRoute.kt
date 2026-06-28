package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.usecase.GetAppVersion
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.jsonResponse
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import javax.inject.Inject

class VersionRoute
    @Inject
    constructor(
        private val getAppVersion: GetAppVersion,
    ) : ApiRoute {
        override val method = Method.GET
        override val path = "/api/version"

        override fun handle(session: IHTTPSession): Response = jsonResponse("""{"app":"${getAppVersion()}"}""")
    }
