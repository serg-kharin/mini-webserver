package dev.sergei.miniwebserver.server

import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response

interface ApiRoute {
    val method: Method
    val path: String

    fun handle(session: IHTTPSession): Response
}
