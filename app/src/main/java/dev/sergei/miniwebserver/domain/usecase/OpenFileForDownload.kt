package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.model.OpenFile
import dev.sergei.miniwebserver.domain.repository.StorageRepository
import javax.inject.Inject

class OpenFileForDownload
    @Inject
    constructor(private val repository: StorageRepository) {
        operator fun invoke(
            folderId: String,
            path: List<String>,
            name: String,
        ): OpenFile = repository.open(folderId, path, name)
    }
