package dev.sergei.miniwebserver.domain.util

import dev.sergei.miniwebserver.domain.model.StorageKind
import java.util.Locale

fun storageKindOf(treeDocumentId: String?): StorageKind {
    val volume = treeDocumentId?.substringBefore(':', "")?.lowercase(Locale.ROOT).orEmpty()
    return when {
        volume == "primary" -> StorageKind.INTERNAL
        volume.isBlank() -> StorageKind.UNKNOWN
        else -> StorageKind.SD
    }
}
