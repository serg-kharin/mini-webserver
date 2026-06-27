package dev.sergei.miniwebserver.domain.util

import org.junit.Assert.assertEquals
import org.junit.Test

class PathUtilsTest {
    @Test
    fun splitsSegments() {
        assertEquals(listOf("Artist", "Album"), splitPath("Artist/Album"))
    }

    @Test
    fun dropsBlankSegments() {
        assertEquals(listOf("a", "b"), splitPath("/a//b/"))
    }

    @Test
    fun nullIsEmpty() {
        assertEquals(emptyList<String>(), splitPath(null))
    }
}
