package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.repository.StorageRepository
import java.io.InputStream
import javax.inject.Inject

class UploadFile
    @Inject
    constructor(private val repository: StorageRepository) {
        operator fun invoke(
            folderId: String,
            path: List<String>,
            name: String,
            source: InputStream,
        ) = repository.upload(folderId, path, name, source)
    }
