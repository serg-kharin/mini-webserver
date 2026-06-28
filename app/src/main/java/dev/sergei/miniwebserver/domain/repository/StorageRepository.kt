package dev.sergei.miniwebserver.domain.repository

import dev.sergei.miniwebserver.domain.model.DirListing
import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.model.OpenFile
import dev.sergei.miniwebserver.domain.model.SearchResult
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
    ): SearchResult

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

    fun exists(
        folderId: String,
        path: List<String>,
        name: String,
    ): Boolean

    fun open(
        folderId: String,
        path: List<String>,
        name: String,
    ): OpenFile

    fun upload(
        folderId: String,
        path: List<String>,
        name: String,
        source: InputStream,
        overwrite: Boolean,
    )
}
