package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.repository.StorageRepository
import javax.inject.Inject

class AddFolder
    @Inject
    constructor(private val repository: StorageRepository) {
        operator fun invoke(folderId: String) = repository.addFolder(folderId)
    }
