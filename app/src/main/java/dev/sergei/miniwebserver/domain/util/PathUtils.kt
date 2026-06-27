package dev.sergei.miniwebserver.domain.util

fun splitPath(raw: String?): List<String> = raw?.split('/')?.filter { it.isNotBlank() } ?: emptyList()
