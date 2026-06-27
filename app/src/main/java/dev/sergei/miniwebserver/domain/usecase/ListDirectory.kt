package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.model.DirListing
import dev.sergei.miniwebserver.domain.repository.StorageRepository
import javax.inject.Inject

class ListDirectory
    @Inject
    constructor(private val repository: StorageRepository) {
        operator fun invoke(
            folderId: String,
            path: List<String>,
        ): DirListing = repository.list(folderId, path)
    }
