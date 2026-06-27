package dev.sergei.miniwebserver.server.dto

import dev.sergei.miniwebserver.domain.model.DirListing
import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.model.SearchHit
import kotlinx.serialization.Serializable

@Serializable
data class FolderDto(val id: String, val name: String, val storage: String)

@Serializable
data class FileEntryDto(val name: String, val size: Long)

@Serializable
data class DirListingDto(val dirs: List<String>, val files: List<FileEntryDto>)

@Serializable
data class SearchHitDto(val name: String, val path: String, val dir: Boolean, val size: Long)

fun Folder.toDto() = FolderDto(id, name, storage.name.lowercase())

fun DirListing.toDto() = DirListingDto(dirs, files.map { FileEntryDto(it.name, it.size) })

fun SearchHit.toDto() = SearchHitDto(name, path, isDir, size)
