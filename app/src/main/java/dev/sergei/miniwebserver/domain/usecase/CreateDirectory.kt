package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.repository.StorageRepository
import javax.inject.Inject

class CreateDirectory
    @Inject
    constructor(private val repository: StorageRepository) {
        operator fun invoke(
            folderId: String,
            path: List<String>,
            name: String,
        ) = repository.createDirectory(folderId, path, name)
    }
