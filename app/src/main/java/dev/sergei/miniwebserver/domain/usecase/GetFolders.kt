package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.repository.StorageRepository
import javax.inject.Inject

class GetFolders
    @Inject
    constructor(private val repository: StorageRepository) {
        operator fun invoke(): List<Folder> = repository.getFolders()
    }
