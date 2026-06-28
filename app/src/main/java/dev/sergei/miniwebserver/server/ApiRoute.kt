package dev.sergei.miniwebserver.server

import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response

interface ApiRoute {
    val method: Method
    val path: String

    // Whether the route needs the anti-CSRF header. Safe, read-only downloads
    // opt out so the browser can fetch them via a plain link.
    val requiresCsrf: Boolean
        get() = true

    fun handle(session: IHTTPSession): Response
}
