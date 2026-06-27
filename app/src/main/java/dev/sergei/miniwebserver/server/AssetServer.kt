package dev.sergei.miniwebserver.server

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import fi.iki.elonen.NanoHTTPD.Response
import fi.iki.elonen.NanoHTTPD.newChunkedResponse
import fi.iki.elonen.NanoHTTPD.newFixedLengthResponse
import java.io.IOException
import javax.inject.Inject

private const val ASSET_DIR = "web"
private const val INDEX = "index.html"

class AssetServer
    @Inject
    constructor(
        @ApplicationContext private val context: Context,
    ) {
        fun serve(uri: String): Response {
            val path = if (uri == "/" || uri.isBlank()) INDEX else uri.trimStart('/')
            return openAsset(path)
                ?: openAsset(INDEX)
                ?: newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Not found")
        }

        private fun openAsset(path: String): Response? =
            try {
                val stream = context.assets.open("$ASSET_DIR/$path")
                newChunkedResponse(Response.Status.OK, mimeForAsset(path), stream)
            } catch (e: IOException) {
                null
            }
    }

private fun mimeForAsset(path: String): String =
    when (path.substringAfterLast('.', "").lowercase()) {
        "html" -> "text/html; charset=utf-8"
        "js" -> "text/javascript"
        "css" -> "text/css"
        "json", "map" -> "application/json"
        "svg" -> "image/svg+xml"
        "png" -> "image/png"
        "ico" -> "image/x-icon"
        "woff2" -> "font/woff2"
        else -> "application/octet-stream"
    }
