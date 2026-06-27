package dev.sergei.miniwebserver.data

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.DocumentsContract
import androidx.documentfile.provider.DocumentFile
import dagger.hilt.android.qualifiers.ApplicationContext
import dev.sergei.miniwebserver.data.saf.listChildren
import dev.sergei.miniwebserver.data.saf.resolveDir
import dev.sergei.miniwebserver.data.saf.searchTree
import dev.sergei.miniwebserver.domain.model.DirListing
import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.model.SearchHit
import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.model.StorageException
import dev.sergei.miniwebserver.domain.repository.StorageRepository
import dev.sergei.miniwebserver.domain.util.storageKindOf
import java.io.InputStream
import javax.inject.Inject
import javax.inject.Singleton

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
            val dir = resolveDir(context, folderId, path) ?: return DirListing(emptyList(), emptyList())
            return listChildren(context, folderId, dir)
        }

        override fun search(
            folderId: String,
            query: String,
        ): List<SearchHit> {
            if (query.isBlank()) return emptyList()
            return searchTree(context, folderId, query, MAX_SEARCH_RESULTS, MAX_SEARCH_DIRS)
        }

        override fun createDirectory(
            folderId: String,
            path: List<String>,
            name: String,
        ) {
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
            if (name.isBlank()) throw StorageException(StorageError.DELETE_NO_NAME)
            val dir = resolveDir(context, folderId, path) ?: throw StorageException(StorageError.FOLDER_NOT_GRANTED)
            val target = dir.findFile(name) ?: return
            if (!target.delete()) throw StorageException(StorageError.DELETE_FAILED)
        }

        override fun upload(
            folderId: String,
            path: List<String>,
            name: String,
            source: InputStream,
        ) {
            if (name.isBlank()) throw StorageException(StorageError.NO_FILE)
            val dir = resolveDir(context, folderId, path) ?: throw StorageException(StorageError.FOLDER_NOT_GRANTED)
            dir.findFile(name)?.delete()
            val target = dir.createFile(mimeOf(name), name) ?: throw StorageException(StorageError.CREATE_FAILED)
            val output =
                context.contentResolver.openOutputStream(target.uri)
                    ?: throw StorageException(StorageError.CREATE_FAILED)
            output.use { source.copyTo(it, DEFAULT_BUFFER_SIZE) }
        }
    }
