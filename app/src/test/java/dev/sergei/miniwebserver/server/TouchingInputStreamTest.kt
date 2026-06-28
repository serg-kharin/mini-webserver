package dev.sergei.miniwebserver.server

import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Test
import java.io.ByteArrayInputStream

class TouchingInputStreamTest {
    @Test
    fun reportsActivityOnEachRead() {
        var touches = 0
        val stream = TouchingInputStream(ByteArrayInputStream(byteArrayOf(1, 2, 3))) { touches++ }

        stream.read()
        stream.read(ByteArray(2), 0, 2)

        assertEquals(2, touches)
    }

    @Test
    fun passesThroughTheUnderlyingBytes() {
        val stream = TouchingInputStream(ByteArrayInputStream(byteArrayOf(7, 8, 9))) { }
        assertArrayEquals(byteArrayOf(7, 8, 9), stream.readBytes())
    }
}
