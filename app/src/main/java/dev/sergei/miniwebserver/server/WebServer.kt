package dev.sergei.miniwebserver.server

import android.util.Log
import dev.sergei.miniwebserver.core.DEFAULT_PORT
import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.model.StorageException
import fi.iki.elonen.NanoHTTPD
import javax.inject.Inject

private const val TAG = "WebServer"

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
                val route = table[session.method to session.uri]
                when {
                    route == null -> assetServer.serve(session.uri)
                    !hasCsrfHeader(session) -> forbiddenResponse()
                    else -> route.handle(session)
                }
            } catch (e: StorageException) {
                errorResponse(e.error)
            } catch (e: Exception) {
                Log.e(TAG, "Request failed: ${session.method} ${session.uri}", e)
                errorResponse(StorageError.UNKNOWN)
            }
    }
