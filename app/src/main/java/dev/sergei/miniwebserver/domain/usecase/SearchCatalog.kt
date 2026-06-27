package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.model.SearchHit
import dev.sergei.miniwebserver.domain.repository.StorageRepository
import javax.inject.Inject

class SearchCatalog
    @Inject
    constructor(private val repository: StorageRepository) {
        operator fun invoke(
            folderId: String,
            query: String,
        ): List<SearchHit> = repository.search(folderId, query)
    }
