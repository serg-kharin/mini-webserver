package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.core.ActivityTracker
import dev.sergei.miniwebserver.domain.model.OpenFile
import dev.sergei.miniwebserver.domain.usecase.OpenFileForDownload
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Response
import io.mockk.every
import io.mockk.mockk
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.io.ByteArrayInputStream

class DownloadRouteTest {
    private val openFile = mockk<OpenFileForDownload>()
    private val route = DownloadRoute(openFile, ActivityTracker())
    private val size = 10L

    private fun givenFile() {
        every { openFile(any(), any(), any()) } returns
            OpenFile(ByteArrayInputStream(ByteArray(size.toInt())), size, "text/plain")
    }

    private fun session(range: String?): IHTTPSession {
        val headers = if (range == null) emptyMap() else mapOf("range" to range)
        return mockk {
            every { queryParameterString } returns "folder=f&name=a.txt"
            every { parameters } returns emptyMap()
            every { this@mockk.headers } returns headers
        }
    }

    @Test
    fun servesWholeFileWithoutRange() {
        givenFile()
        val response = route.handle(session(null))
        assertEquals(Response.Status.OK, response.status)
        assertEquals("bytes", response.getHeader("Accept-Ranges"))
        assertNull(response.getHeader("Content-Range"))
    }

    @Test
    fun servesPartialContentForRange() {
        givenFile()
        val response = route.handle(session("bytes=2-5"))
        assertEquals(Response.Status.PARTIAL_CONTENT, response.status)
        assertEquals("bytes 2-5/10", response.getHeader("Content-Range"))
    }

    @Test
    fun servesSuffixRange() {
        givenFile()
        val response = route.handle(session("bytes=-3"))
        assertEquals(Response.Status.PARTIAL_CONTENT, response.status)
        assertEquals("bytes 7-9/10", response.getHeader("Content-Range"))
    }

    @Test
    fun openEndedRangeRunsToTheEnd() {
        givenFile()
        val response = route.handle(session("bytes=4-"))
        assertEquals(Response.Status.PARTIAL_CONTENT, response.status)
        assertEquals("bytes 4-9/10", response.getHeader("Content-Range"))
    }

    @Test
    fun rejectsUnsatisfiableRange() {
        givenFile()
        val response = route.handle(session("bytes=20-30"))
        assertEquals(Response.Status.RANGE_NOT_SATISFIABLE, response.status)
        assertEquals("bytes */10", response.getHeader("Content-Range"))
    }
}
