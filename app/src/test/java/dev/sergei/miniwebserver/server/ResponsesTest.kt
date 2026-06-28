package dev.sergei.miniwebserver.server

import dev.sergei.miniwebserver.domain.model.StorageError
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import io.mockk.every
import io.mockk.mockk
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ResponsesTest {
    @Test
    fun uploadTooLargeMapsTo413() {
        assertEquals(413, errorResponse(StorageError.UPLOAD_TOO_LARGE).status.requestStatus)
    }

    @Test
    fun failuresMapToInternalError() {
        val internal =
            listOf(
                StorageError.CREATE_FAILED,
                StorageError.MKDIR_FAILED,
                StorageError.DELETE_FAILED,
                StorageError.UNKNOWN,
            )
        internal.forEach {
            assertEquals(500, errorResponse(it).status.requestStatus)
        }
    }

    @Test
    fun badInputMapsToBadRequest() {
        val badRequest =
            listOf(
                StorageError.FOLDER_NOT_GRANTED,
                StorageError.NO_FILE,
                StorageError.MKDIR_EMPTY_NAME,
                StorageError.DELETE_NO_NAME,
            )
        badRequest.forEach {
            assertEquals(400, errorResponse(it).status.requestStatus)
        }
    }

    @Test
    fun csrfHeaderDetected() {
        assertTrue(hasCsrfHeader(sessionWithHeaders(mapOf("x-requested-with" to "fetch"))))
        assertFalse(hasCsrfHeader(sessionWithHeaders(emptyMap())))
    }

    @Test
    fun queryParamDecodesUtf8() {
        val session = mockk<IHTTPSession>()
        every { session.queryParameterString } returns "name=%D0%9C%D1%83%D0%B7%D1%8B%D0%BA%D0%B0"
        assertEquals("Музыка", queryParam(session, "name"))
    }

    private fun sessionWithHeaders(headers: Map<String, String>): IHTTPSession {
        val session = mockk<IHTTPSession>()
        every { session.headers } returns headers
        return session
    }
}
