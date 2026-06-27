package dev.sergei.miniwebserver.data

import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class MimeResolverInstrumentedTest {
    @Test
    fun resolvesCommonTypesViaPlatform() {
        assertEquals("text/plain", mimeOf("notes.txt"))
        assertEquals("application/json", mimeOf("data.json"))
    }

    @Test
    fun fallsBackForDsdAndUnknown() {
        assertEquals("audio/x-dsd", mimeOf("track.dsf"))
        assertEquals("application/octet-stream", mimeOf("mystery.zzz"))
    }
}
