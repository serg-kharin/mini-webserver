package dev.sergei.miniwebserver.domain.app

// Reports static facts about the running app (port for the version, etc.).
interface AppInfoProvider {
    fun version(): String
}
