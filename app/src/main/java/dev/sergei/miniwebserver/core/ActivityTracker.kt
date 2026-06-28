package dev.sergei.miniwebserver.core

import javax.inject.Inject
import javax.inject.Singleton

// Records when the server last handled a request so the service can auto-stop
// after a period of inactivity.
@Singleton
class ActivityTracker
    @Inject
    constructor() {
        @Volatile
        var lastActivityAt: Long = 0L
            private set

        fun touch(now: Long) {
            lastActivityAt = now
        }

        fun idleFor(now: Long): Long = now - lastActivityAt
    }
