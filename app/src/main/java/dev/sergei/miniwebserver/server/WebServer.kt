package dev.sergei.miniwebserver.server

import android.util.Log
import dev.sergei.miniwebserver.core.ActivityTracker
import dev.sergei.miniwebserver.core.DEFAULT_PORT
import dev.sergei.miniwebserver.data.UploadTempDirProvider
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
        private val activityTracker: ActivityTracker,
        tempDir: UploadTempDirProvider,
    ) : NanoHTTPD("0.0.0.0", DEFAULT_PORT) {
        private val table: Map<Pair<Method, String>, ApiRoute> =
            routes.associateBy { it.method to it.path }

        init {
            setTempFileManagerFactory(UploadTempFiles(tempDir.dir()))
        }

        override fun serve(session: IHTTPSession): Response {
            // begin/end brackets the request (covers a slow upload spooled inside
            // serve); streaming responses keep touching the tracker as they're read.
            activityTracker.begin()
            activityTracker.touch(System.currentTimeMillis())
            return try {
                val route = table[session.method to session.uri]
                when {
                    route == null -> assetServer.serve(session.uri)
                    route.requiresCsrf && !hasCsrfHeader(session) -> forbiddenResponse()
                    else -> route.handle(session)
                }
            } catch (e: StorageException) {
                errorResponse(e.error)
            } catch (e: Exception) {
                Log.e(TAG, "Request failed: ${session.method} ${session.uri}", e)
                errorResponse(StorageError.UNKNOWN)
            } finally {
                activityTracker.end(System.currentTimeMillis())
            }
        }
    }
