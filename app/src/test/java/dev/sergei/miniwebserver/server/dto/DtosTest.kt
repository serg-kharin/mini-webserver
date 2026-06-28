package dev.sergei.miniwebserver.server.dto

import dev.sergei.miniwebserver.domain.model.DirListing
import dev.sergei.miniwebserver.domain.model.FileEntry
import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.model.SearchHit
import dev.sergei.miniwebserver.domain.model.SearchResult
import dev.sergei.miniwebserver.domain.model.StorageKind
import org.junit.Assert.assertEquals
import org.junit.Test

class DtosTest {
    @Test
    fun folderMapsStorageToLowercaseCode() {
        assertEquals("internal", Folder("id", "Music", StorageKind.INTERNAL).toDto().storage)
        assertEquals("sd", Folder("id", "Music", StorageKind.SD).toDto().storage)
        assertEquals("unknown", Folder("id", "Music", StorageKind.UNKNOWN).toDto().storage)
    }

    @Test
    fun dirListingMapsEntries() {
        val dto = DirListing(listOf("Album"), listOf(FileEntry("song.flac", 10))).toDto()
        assertEquals(listOf("Album"), dto.dirs)
        assertEquals("song.flac", dto.files.single().name)
        assertEquals(10L, dto.files.single().size)
    }

    @Test
    fun searchHitMapsFields() {
        val dto = SearchHit("song.flac", "Artist/Album", isDir = false, size = 42).toDto()
        assertEquals("song.flac", dto.name)
        assertEquals("Artist/Album", dto.path)
        assertEquals(false, dto.dir)
        assertEquals(42L, dto.size)
    }

    @Test
    fun searchResultMapsHitsAndTruncation() {
        val dto = SearchResult(listOf(SearchHit("a.flac", "", isDir = false, size = 1)), truncated = true).toDto()
        assertEquals(1, dto.hits.size)
        assertEquals("a.flac", dto.hits.single().name)
        assertEquals(true, dto.truncated)
    }
}
