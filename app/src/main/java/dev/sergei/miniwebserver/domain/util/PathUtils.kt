package dev.sergei.miniwebserver.domain.util

private val TRAVERSAL = setOf(".", "..")

// Drop blank and traversal segments; folder/file names are never "." or "..".
fun splitPath(raw: String?): List<String> = raw?.split('/')?.filter { it.isNotBlank() && it !in TRAVERSAL } ?: emptyList()
