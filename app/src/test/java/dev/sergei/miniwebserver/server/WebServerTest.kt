package dev.sergei.miniwebserver.server

import dev.sergei.miniwebserver.core.ActivityTracker
import dev.sergei.miniwebserver.data.UploadTempDirProvider
import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.model.StorageException
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import fi.iki.elonen.NanoHTTPD.newFixedLengthResponse
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.Assert.assertEquals
import org.junit.Assert.assertSame
import org.junit.Test
import java.io.File

class WebServerTest {
    private val assetServer = mockk<AssetServer>()
    private val activityTracker = ActivityTracker()
    private val tempDir =
        mockk<UploadTempDirProvider> {
            every { dir() } returns File(System.getProperty("java.io.tmpdir") ?: ".")
        }

    private fun server(route: ApiRoute) = WebServer(setOf(route), assetServer, activityTracker, tempDir)

    private fun fakeRoute(handler: (IHTTPSession) -> Response) =
        object : ApiRoute {
            override val method = Method.POST
            override val path = "/api/test"

            override fun handle(session: IHTTPSession): Response = handler(session)
        }

    private fun session(
        method: Method,
        uri: String,
        headers: Map<String, String> = emptyMap(),
    ): IHTTPSession {
        val session = mockk<IHTTPSession>()
        every { session.method } returns method
        every { session.uri } returns uri
        every { session.headers } returns headers
        return session
    }

    @Test
    fun rejectsApiCallWithoutCsrfHeader() {
        var handled = false
        val server =
            server(
                fakeRoute {
                    handled = true
                    okResponse()
                },
            )

        val response = server.serve(session(Method.POST, "/api/test"))

        assertEquals(Response.Status.FORBIDDEN, response.status)
        assertEquals(false, handled)
    }

    @Test
    fun dispatchesApiCallWithCsrfHeader() {
        val expected = okResponse()
        val server = server(fakeRoute { expected })

        val response = server.serve(session(Method.POST, "/api/test", mapOf("x-requested-with" to "fetch")))

        assertSame(expected, response)
    }

    @Test
    fun unknownPathFallsThroughToAssets() {
        val asset = newFixedLengthResponse("index")
        every { assetServer.serve("/index.html") } returns asset
        val server = server(fakeRoute { okResponse() })

        val response = server.serve(session(Method.GET, "/index.html"))

        assertSame(asset, response)
        verify { assetServer.serve("/index.html") }
    }

    @Test
    fun mapsStorageExceptionToErrorStatus() {
        val server = server(fakeRoute { throw StorageException(StorageError.UPLOAD_TOO_LARGE) })

        val response = server.serve(session(Method.POST, "/api/test", mapOf("x-requested-with" to "fetch")))

        assertEquals(413, response.status.requestStatus)
    }

    @Test
    fun mapsUnexpectedExceptionToUnknown() {
        val server = server(fakeRoute { error("boom") })

        val response = server.serve(session(Method.POST, "/api/test", mapOf("x-requested-with" to "fetch")))

        assertEquals(500, response.status.requestStatus)
    }
}
