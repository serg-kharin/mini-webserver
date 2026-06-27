package dev.sergei.miniwebserver.data.saf

import android.content.Context
import android.provider.DocumentsContract
import androidx.documentfile.provider.DocumentFile
import dev.sergei.miniwebserver.domain.model.DirListing
import dev.sergei.miniwebserver.domain.model.FileEntry

private val LISTING_PROJECTION =
    arrayOf(
        DocumentsContract.Document.COLUMN_DISPLAY_NAME,
        DocumentsContract.Document.COLUMN_MIME_TYPE,
        DocumentsContract.Document.COLUMN_SIZE,
    )

fun listChildren(
    context: Context,
    folderId: String,
    dir: DocumentFile,
): DirListing {
    val childrenUri =
        DocumentsContract.buildChildDocumentsUriUsingTree(
            treeUriOf(folderId),
            DocumentsContract.getDocumentId(dir.uri),
        )
    val dirs = ArrayList<String>()
    val files = ArrayList<FileEntry>()
    context.contentResolver.query(childrenUri, LISTING_PROJECTION, null, null, null)?.use { cursor ->
        while (cursor.moveToNext()) {
            val name = cursor.getString(0) ?: continue
            if (cursor.getString(1) == DocumentsContract.Document.MIME_TYPE_DIR) {
                dirs.add(name)
            } else {
                files.add(FileEntry(name, cursor.getLong(2)))
            }
        }
    }
    return DirListing(
        dirs = dirs.sortedBy { it.lowercase() },
        files = files.sortedBy { it.name.lowercase() },
    )
}
