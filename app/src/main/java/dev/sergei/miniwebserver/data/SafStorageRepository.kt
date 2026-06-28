package dev.sergei.miniwebserver.data

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.DocumentsContract
import android.util.Log
import androidx.documentfile.provider.DocumentFile
import dagger.hilt.android.qualifiers.ApplicationContext
import dev.sergei.miniwebserver.core.MAX_UPLOAD_BYTES
import dev.sergei.miniwebserver.core.UPLOAD_TEMP_SUFFIX
import dev.sergei.miniwebserver.data.saf.listChildren
import dev.sergei.miniwebserver.data.saf.resolveDir
import dev.sergei.miniwebserver.data.saf.resolveOrCreateDir
import dev.sergei.miniwebserver.data.saf.searchTree
import dev.sergei.miniwebserver.domain.model.DirListing
import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.model.OpenFile
import dev.sergei.miniwebserver.domain.model.SearchResult
import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.model.StorageException
import dev.sergei.miniwebserver.domain.repository.StorageRepository
import dev.sergei.miniwebserver.domain.util.storageKindOf
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import javax.inject.Inject
import javax.inject.Singleton

private const val TAG = "SafStorageRepository"
private const val MAX_SEARCH_RESULTS = 500
private const val MAX_SEARCH_DIRS = 5000
private const val GRANT_FLAGS =
    Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION

@Singleton
class SafStorageRepository
    @Inject
    constructor(
        @ApplicationContext private val context: Context,
    ) : StorageRepository {
        override fun getFolders(): List<Folder> =
            context.contentResolver.persistedUriPermissions
                .filter { it.isWritePermission }
                .mapNotNull { permission ->
                    val name = DocumentFile.fromTreeUri(context, permission.uri)?.name ?: return@mapNotNull null
                    val treeId = runCatching { DocumentsContract.getTreeDocumentId(permission.uri) }.getOrNull()
                    Folder(permission.uri.toString(), name, storageKindOf(treeId))
                }

        override fun addFolder(folderId: String) = context.contentResolver.takePersistableUriPermission(Uri.parse(folderId), GRANT_FLAGS)

        override fun removeFolder(folderId: String) =
            context.contentResolver.releasePersistableUriPermission(
                Uri.parse(folderId),
                GRANT_FLAGS,
            )

        override fun list(
            folderId: String,
            path: List<String>,
        ): DirListing {
            requireGranted(context, folderId)
            val dir = resolveDir(context, folderId, path) ?: return DirListing(emptyList(), emptyList())
            return listChildren(context, folderId, dir)
        }

        override fun search(
            folderId: String,
            query: String,
        ): SearchResult {
            requireGranted(context, folderId)
            if (query.isBlank()) return SearchResult(emptyList(), truncated = false)
            return searchTree(context, folderId, query, MAX_SEARCH_RESULTS, MAX_SEARCH_DIRS)
        }

        override fun createDirectory(
            folderId: String,
            path: List<String>,
            name: String,
        ) {
            requireGranted(context, folderId)
            val trimmed = name.trim()
            if (trimmed.isEmpty()) throw StorageException(StorageError.MKDIR_EMPTY_NAME)
            val parent = resolveDir(context, folderId, path) ?: throw StorageException(StorageError.FOLDER_NOT_GRANTED)
            if (parent.findFile(trimmed)?.isDirectory == true) return
            parent.createDirectory(trimmed) ?: throw StorageException(StorageError.MKDIR_FAILED)
        }

        override fun delete(
            folderId: String,
            path: List<String>,
            name: String,
        ) {
            requireGranted(context, folderId)
            if (name.isBlank()) throw StorageException(StorageError.DELETE_NO_NAME)
            val dir = resolveDir(context, folderId, path) ?: throw StorageException(StorageError.FOLDER_NOT_GRANTED)
            val target = dir.findFile(name) ?: return
            if (!target.delete()) throw StorageException(StorageError.DELETE_FAILED)
        }

        override fun exists(
            folderId: String,
            path: List<String>,
            name: String,
        ): Boolean {
            requireGranted(context, folderId)
            if (name.isBlank()) return false
            val dir = resolveDir(context, folderId, path) ?: return false
            return dir.findFile(name) != null
        }

        override fun open(
            folderId: String,
            path: List<String>,
            name: String,
        ): OpenFile {
            requireGranted(context, folderId)
            if (name.isBlank()) throw StorageException(StorageError.NO_FILE)
            val dir = resolveDir(context, folderId, path) ?: throw StorageException(StorageError.FOLDER_NOT_GRANTED)
            val file = dir.findFile(name)?.takeIf { it.isFile } ?: throw StorageException(StorageError.NO_FILE)
            val stream =
                context.contentResolver.openInputStream(file.uri)
                    ?: throw StorageException(StorageError.NO_FILE)
            return OpenFile(stream, file.length(), mimeOf(name))
        }

        override fun upload(
            folderId: String,
            path: List<String>,
            name: String,
            source: InputStream,
            overwrite: Boolean,
        ) {
            requireGranted(context, folderId)
            if (name.isBlank()) throw StorageException(StorageError.NO_FILE)
            val dir =
                resolveOrCreateDir(context, folderId, path)
                    ?: throw StorageException(StorageError.FOLDER_NOT_GRANTED)
            if (!overwrite && dir.findFile(name) != null) throw StorageException(StorageError.FILE_EXISTS)

            // Write to a temp file first; replace the original only once it's fully
            // written, so a failed upload can't destroy the existing file.
            val tempName = "$name$UPLOAD_TEMP_SUFFIX"
            dir.findFile(tempName)?.delete()
            val temp = dir.createFile(mimeOf(name), tempName) ?: throw StorageException(StorageError.CREATE_FAILED)
            try {
                val output =
                    context.contentResolver.openOutputStream(temp.uri)
                        ?: throw StorageException(StorageError.CREATE_FAILED)
                output.use { copyLimited(source, it, MAX_UPLOAD_BYTES) }
            } catch (e: StorageException) {
                temp.delete()
                throw e
            } catch (e: IOException) {
                Log.w(TAG, "Upload write failed", e)
                temp.delete()
                throw StorageException(StorageError.CREATE_FAILED)
            }
            dir.findFile(name)?.delete()
            if (!temp.renameTo(name)) {
                temp.delete()
                throw StorageException(StorageError.CREATE_FAILED)
            }
        }
    }

private fun requireGranted(
    context: Context,
    folderId: String,
) {
    val granted =
        context.contentResolver.persistedUriPermissions.any {
            it.isWritePermission && it.uri.toString() == folderId
        }
    if (!granted) throw StorageException(StorageError.FOLDER_NOT_GRANTED)
}

// Copies the stream while enforcing the size cap, so a lying Content-Length
// can't get past the limit. `internal` so it can be unit-tested directly.
internal fun copyLimited(
    source: InputStream,
    output: OutputStream,
    limit: Long,
) {
    val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
    var total = 0L
    var read = source.read(buffer)
    while (read >= 0) {
        total += read
        if (total > limit) throw StorageException(StorageError.UPLOAD_TOO_LARGE)
        output.write(buffer, 0, read)
        read = source.read(buffer)
    }
}
