package dev.sergei.miniwebserver.domain.model

enum class StorageKind { INTERNAL, SD, UNKNOWN }

data class Folder(
    val id: String,
    val name: String,
    val storage: StorageKind,
)
