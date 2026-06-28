package dev.sergei.miniwebserver.domain.model

// Search hits plus whether the scan was cut short by the result/directory caps,
// so the UI can warn that there may be more matches.
data class SearchResult(
    val hits: List<SearchHit>,
    val truncated: Boolean,
)
