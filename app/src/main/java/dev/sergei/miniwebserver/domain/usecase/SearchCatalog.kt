package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.model.SearchResult
import dev.sergei.miniwebserver.domain.repository.StorageRepository
import javax.inject.Inject

class SearchCatalog
    @Inject
    constructor(private val repository: StorageRepository) {
        operator fun invoke(
            folderId: String,
            query: String,
        ): SearchResult = repository.search(folderId, query)
    }
