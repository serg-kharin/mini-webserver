package dev.sergei.miniwebserver.domain.repository

import dev.sergei.miniwebserver.domain.model.DirListing
import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.model.SearchHit
import java.io.InputStream

interface StorageRepository {
    fun getFolders(): List<Folder>

    fun addFolder(folderId: String)

    fun removeFolder(folderId: String)

    fun list(
        folderId: String,
        path: List<String>,
    ): DirListing

    fun search(
        folderId: String,
        query: String,
    ): List<SearchHit>

    fun createDirectory(
        folderId: String,
        path: List<String>,
        name: String,
    )

    fun delete(
        folderId: String,
        path: List<String>,
        name: String,
    )

    fun upload(
        folderId: String,
        path: List<String>,
        name: String,
        source: InputStream,
    )
}
