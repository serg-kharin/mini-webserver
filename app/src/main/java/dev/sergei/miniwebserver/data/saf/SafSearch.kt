package dev.sergei.miniwebserver.data.saf

import android.content.Context
import android.net.Uri
import android.provider.DocumentsContract
import dev.sergei.miniwebserver.domain.model.SearchHit
import dev.sergei.miniwebserver.domain.model.SearchResult
import java.util.Locale

private val SEARCH_PROJECTION =
    arrayOf(
        DocumentsContract.Document.COLUMN_DISPLAY_NAME,
        DocumentsContract.Document.COLUMN_MIME_TYPE,
        DocumentsContract.Document.COLUMN_SIZE,
        DocumentsContract.Document.COLUMN_DOCUMENT_ID,
    )

private data class Child(
    val name: String,
    val isDir: Boolean,
    val size: Long,
    val documentId: String,
)

fun searchTree(
    context: Context,
    folderId: String,
    query: String,
    maxResults: Int,
    maxDirs: Int,
): SearchResult {
    val root = folderDocument(context, folderId) ?: return SearchResult(emptyList(), truncated = false)
    val treeUri = treeUriOf(folderId)
    val needle = query.lowercase(Locale.ROOT)
    val hits = ArrayList<SearchHit>()
    val queue = ArrayDeque<Pair<String, String>>()
    queue.add(DocumentsContract.getDocumentId(root.uri) to "")
    var visited = 0
    while (queue.isNotEmpty() && hits.size < maxResults && visited < maxDirs) {
        val (documentId, relativePath) = queue.removeFirst()
        visited++
        for (child in readChildren(context, treeUri, documentId)) {
            if (hits.size < maxResults && child.name.lowercase(Locale.ROOT).contains(needle)) {
                hits.add(SearchHit(child.name, relativePath, child.isDir, hitSize(child)))
            }
            if (child.isDir) {
                queue.add(child.documentId to joinPath(relativePath, child.name))
            }
        }
    }
    // Cut short by either cap while work remained → there may be more matches.
    val truncated = hits.size >= maxResults || (visited >= maxDirs && queue.isNotEmpty())
    return SearchResult(hits, truncated)
}

private fun hitSize(child: Child): Long = if (child.isDir) 0L else child.size

private fun joinPath(
    base: String,
    name: String,
): String = if (base.isEmpty()) name else "$base/$name"

private fun readChildren(
    context: Context,
    treeUri: Uri,
    documentId: String,
): List<Child> {
    val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, documentId)
    val children = ArrayList<Child>()
    context.contentResolver.query(childrenUri, SEARCH_PROJECTION, null, null, null)?.use { cursor ->
        while (cursor.moveToNext()) {
            val name = cursor.getString(0) ?: continue
            val isDir = cursor.getString(1) == DocumentsContract.Document.MIME_TYPE_DIR
            children.add(Child(name, isDir, cursor.getLong(2), cursor.getString(3)))
        }
    }
    return children
}
