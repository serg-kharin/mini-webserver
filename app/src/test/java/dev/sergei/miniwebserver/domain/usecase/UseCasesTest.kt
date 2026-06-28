package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.model.DirListing
import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.model.OpenFile
import dev.sergei.miniwebserver.domain.model.SearchResult
import dev.sergei.miniwebserver.domain.model.StorageKind
import dev.sergei.miniwebserver.domain.repository.StorageRepository
import org.junit.Assert.assertEquals
import org.junit.Test
import java.io.ByteArrayInputStream
import java.io.InputStream

private class FakeStorageRepository : StorageRepository {
    val seededFolders = listOf(Folder("id", "Music", StorageKind.INTERNAL))
    var uploaded: Triple<String, List<String>, String>? = null
    var uploadedOverwrite: Boolean? = null

    override fun getFolders() = seededFolders

    override fun addFolder(folderId: String) = Unit

    override fun removeFolder(folderId: String) = Unit

    override fun list(
        folderId: String,
        path: List<String>,
    ) = DirListing(emptyList(), emptyList())

    override fun search(
        folderId: String,
        query: String,
    ) = SearchResult(emptyList(), truncated = false)

    override fun createDirectory(
        folderId: String,
        path: List<String>,
        name: String,
    ) = Unit

    override fun delete(
        folderId: String,
        path: List<String>,
        name: String,
    ) = Unit

    override fun exists(
        folderId: String,
        path: List<String>,
        name: String,
    ) = false

    override fun open(
        folderId: String,
        path: List<String>,
        name: String,
    ) = OpenFile(ByteArrayInputStream(ByteArray(0)), 0L, "application/octet-stream")

    override fun upload(
        folderId: String,
        path: List<String>,
        name: String,
        source: InputStream,
        overwrite: Boolean,
    ) {
        uploaded = Triple(folderId, path, name)
        uploadedOverwrite = overwrite
    }
}

class UseCasesTest {
    private val repository = FakeStorageRepository()

    @Test
    fun getFoldersDelegatesToRepository() {
        assertEquals(repository.seededFolders, GetFolders(repository)())
    }

    @Test
    fun uploadFileDelegatesToRepository() {
        UploadFile(repository)("id", listOf("Album"), "song.flac", ByteArrayInputStream(ByteArray(0)), overwrite = true)
        assertEquals(Triple("id", listOf("Album"), "song.flac"), repository.uploaded)
        assertEquals(true, repository.uploadedOverwrite)
    }
}
