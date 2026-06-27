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
