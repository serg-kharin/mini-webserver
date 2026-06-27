package dev.sergei.miniwebserver.ui

import dev.sergei.miniwebserver.domain.model.Folder

data class MainUiState(
    val folders: List<Folder> = emptyList(),
    val running: Boolean = false,
    val url: String? = null,
)
