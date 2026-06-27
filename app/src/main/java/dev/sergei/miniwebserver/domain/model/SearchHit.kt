package dev.sergei.miniwebserver.domain.model

data class SearchHit(
    val name: String,
    val path: String,
    val isDir: Boolean,
    val size: Long,
)
