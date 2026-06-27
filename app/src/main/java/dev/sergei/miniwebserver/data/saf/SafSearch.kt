package dev.sergei.miniwebserver.data.saf

import android.content.Context
import android.provider.DocumentsContract
import dev.sergei.miniwebserver.domain.model.SearchHit

private val SEARCH_PROJECTION =
    arrayOf(
        DocumentsContract.Document.COLUMN_DISPLAY_NAME,
        DocumentsContract.Document.COLUMN_MIME_TYPE,
        DocumentsContract.Document.COLUMN_SIZE,
        DocumentsContract.Document.COLUMN_DOCUMENT_ID,
    )

fun searchTree(
    context: Context,
    folderId: String,
    query: String,
    maxResults: Int,
    maxDirs: Int,
): List<SearchHit> {
    val root = folderDocument(context, folderId) ?: return emptyList()
    val treeUri = treeUriOf(folderId)
    val needle = query.lowercase()
    val hits = ArrayList<SearchHit>()
    val queue = ArrayDeque<Pair<String, String>>()
    queue.add(DocumentsContract.getDocumentId(root.uri) to "")
    var visited = 0
    while (queue.isNotEmpty() && hits.size < maxResults && visited < maxDirs) {
        val (documentId, relativePath) = queue.removeFirst()
        visited++
        val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, documentId)
        context.contentResolver.query(childrenUri, SEARCH_PROJECTION, null, null, null)?.use { cursor ->
            while (cursor.moveToNext()) {
                val name = cursor.getString(0) ?: continue
                val isDir = cursor.getString(1) == DocumentsContract.Document.MIME_TYPE_DIR
                if (hits.size < maxResults && name.lowercase().contains(needle)) {
                    hits.add(SearchHit(name, relativePath, isDir, if (isDir) 0L else cursor.getLong(2)))
                }
                if (isDir) {
                    val childPath = if (relativePath.isEmpty()) name else "$relativePath/$name"
                    queue.add(cursor.getString(3) to childPath)
                }
            }
        }
    }
    return hits
}
