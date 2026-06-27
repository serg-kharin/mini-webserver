package dev.sergei.miniwebserver.domain.model

data class FileEntry(
    val name: String,
    val size: Long,
)

data class DirListing(
    val dirs: List<String>,
    val files: List<FileEntry>,
)
