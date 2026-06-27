package dev.sergei.miniwebserver.server

import dev.sergei.miniwebserver.core.DEFAULT_PORT
import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.model.StorageException
import fi.iki.elonen.NanoHTTPD
import javax.inject.Inject

class WebServer
    @Inject
    constructor(
        routes: Set<@JvmSuppressWildcards ApiRoute>,
        private val assetServer: AssetServer,
    ) : NanoHTTPD("0.0.0.0", DEFAULT_PORT) {
        private val table: Map<Pair<Method, String>, ApiRoute> =
            routes.associateBy { it.method to it.path }

        override fun serve(session: IHTTPSession): Response =
            try {
                table[session.method to session.uri]?.handle(session) ?: assetServer.serve(session.uri)
            } catch (e: StorageException) {
                errorResponse(e.error)
            } catch (e: Exception) {
                errorResponse(StorageError.UNKNOWN)
            }
    }
