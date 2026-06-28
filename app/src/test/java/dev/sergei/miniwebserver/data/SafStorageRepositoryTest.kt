package dev.sergei.miniwebserver.data

import android.content.ContentResolver
import android.content.Context
import android.content.UriPermission
import android.net.Uri
import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.model.StorageException
import io.mockk.every
import io.mockk.mockk
import org.junit.Assert.assertEquals
import org.junit.Test
import java.io.ByteArrayInputStream

class SafStorageRepositoryTest {
    private val resolver = mockk<ContentResolver>()
    private val context =
        mockk<Context> {
            every { contentResolver } returns resolver
        }
    private val repo = SafStorageRepository(context)

    private fun grant(folderId: String) {
        val uri = mockk<Uri>()
        every { uri.toString() } returns folderId
        val permission = mockk<UriPermission>()
        every { permission.isWritePermission } returns true
        every { permission.uri } returns uri
        every { resolver.persistedUriPermissions } returns listOf(permission)
    }

    private fun errorFrom(block: () -> Unit): StorageError {
        val thrown = runCatching { block() }.exceptionOrNull()
        return (thrown as StorageException).error
    }

    @Test
    fun publicCallsRejectUngrantedFolder() {
        every { resolver.persistedUriPermissions } returns emptyList()
        val id = "tree:unknown"
        val stream = ByteArrayInputStream(byteArrayOf())

        assertEquals(StorageError.FOLDER_NOT_GRANTED, errorFrom { repo.list(id, emptyList()) })
        assertEquals(StorageError.FOLDER_NOT_GRANTED, errorFrom { repo.search(id, "q") })
        assertEquals(StorageError.FOLDER_NOT_GRANTED, errorFrom { repo.createDirectory(id, emptyList(), "New") })
        assertEquals(StorageError.FOLDER_NOT_GRANTED, errorFrom { repo.delete(id, emptyList(), "f") })
        assertEquals(StorageError.FOLDER_NOT_GRANTED, errorFrom { repo.exists(id, emptyList(), "f") })
        assertEquals(StorageError.FOLDER_NOT_GRANTED, errorFrom { repo.open(id, emptyList(), "f") })
        assertEquals(StorageError.FOLDER_NOT_GRANTED, errorFrom { repo.upload(id, emptyList(), "f", stream, false) })
    }

    @Test
    fun grantedFolderPassesGuardThenValidatesInput() {
        val id = "tree:granted"
        grant(id)
        val stream = ByteArrayInputStream(byteArrayOf())

        // requireGranted passes, so we reach the per-call validation instead of FOLDER_NOT_GRANTED.
        assertEquals(StorageError.DELETE_NO_NAME, errorFrom { repo.delete(id, emptyList(), "") })
        assertEquals(StorageError.NO_FILE, errorFrom { repo.upload(id, emptyList(), "", stream, false) })
    }
}
