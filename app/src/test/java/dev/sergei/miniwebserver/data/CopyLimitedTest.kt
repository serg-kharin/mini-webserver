package dev.sergei.miniwebserver.data

import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.model.StorageException
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream

class CopyLimitedTest {
    @Test
    fun copiesWhenWithinTheLimit() {
        val data = ByteArray(100) { it.toByte() }
        val output = ByteArrayOutputStream()
        copyLimited(ByteArrayInputStream(data), output, limit = 100)
        assertArrayEquals(data, output.toByteArray())
    }

    @Test
    fun rejectsWhenOverTheLimit() {
        val thrown =
            assertThrows(StorageException::class.java) {
                copyLimited(ByteArrayInputStream(ByteArray(101)), ByteArrayOutputStream(), limit = 100)
            }
        assertEquals(StorageError.UPLOAD_TOO_LARGE, thrown.error)
    }
}
