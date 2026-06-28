package dev.sergei.miniwebserver.data.saf

import android.content.Context
import android.net.Uri
import androidx.documentfile.provider.DocumentFile

fun treeUriOf(folderId: String): Uri = Uri.parse(folderId)

fun folderDocument(
    context: Context,
    folderId: String,
): DocumentFile? = DocumentFile.fromTreeUri(context, treeUriOf(folderId))

fun resolveDir(
    context: Context,
    folderId: String,
    path: List<String>,
): DocumentFile? {
    var dir = folderDocument(context, folderId) ?: return null
    for (segment in path) {
        dir = dir.findFile(segment)?.takeIf { it.isDirectory } ?: return null
    }
    return dir
}

// Like resolveDir but creates missing directories along the way (mkdir -p).
fun resolveOrCreateDir(
    context: Context,
    folderId: String,
    path: List<String>,
): DocumentFile? =
    path.fold(folderDocument(context, folderId)) { dir, segment ->
        dir?.let { it.findFile(segment)?.takeIf { child -> child.isDirectory } ?: it.createDirectory(segment) }
    }
