package dev.sergei.miniwebserver.server

import android.content.Context
import android.content.res.AssetManager
import fi.iki.elonen.NanoHTTPD.Response
import io.mockk.every
import io.mockk.mockk
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.IOException

class AssetServerTest {
    private val assets = mockk<AssetManager>()
    private val context =
        mockk<Context> {
            every { assets } returns this@AssetServerTest.assets
        }
    private val server = AssetServer(context)

    private fun present(vararg paths: String) {
        every { assets.open(any()) } answers {
            val requested = firstArg<String>()
            if (requested in paths) ByteArrayInputStream(byteArrayOf(1)) else throw IOException()
        }
    }

    @Test
    fun rootServesIndexHtml() {
        present("web/index.html")
        val response = server.serve("/")
        assertEquals(Response.Status.OK, response.status)
        assertTrue(response.mimeType.startsWith("text/html"))
    }

    @Test
    fun knownAssetIsServedWithMime() {
        present("web/assets/app.js")
        val response = server.serve("/assets/app.js")
        assertEquals(Response.Status.OK, response.status)
        assertEquals("text/javascript", response.mimeType)
    }

    @Test
    fun unknownPathFallsBackToIndex() {
        present("web/index.html")
        val response = server.serve("/deep/link")
        assertEquals(Response.Status.OK, response.status)
        assertTrue(response.mimeType.startsWith("text/html"))
    }

    @Test
    fun missingIndexReturnsNotFound() {
        present()
        val response = server.serve("/whatever")
        assertEquals(Response.Status.NOT_FOUND, response.status)
    }
}
