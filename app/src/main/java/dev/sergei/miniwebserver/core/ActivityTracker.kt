package dev.sergei.miniwebserver.core

import java.util.concurrent.atomic.AtomicInteger
import javax.inject.Inject
import javax.inject.Singleton

// Tracks request activity so the service can auto-stop when idle, without cutting
// off a long transfer: `lastActivityAt` covers quick polls and streaming reads,
// while `active` counts in-flight requests (e.g. a slow upload still inside serve).
@Singleton
class ActivityTracker
    @Inject
    constructor() {
        @Volatile
        var lastActivityAt: Long = 0L
            private set

        private val active = AtomicInteger(0)

        fun touch(now: Long) {
            lastActivityAt = now
        }

        fun idleFor(now: Long): Long = now - lastActivityAt

        fun begin() {
            active.incrementAndGet()
        }

        fun end(now: Long) {
            active.decrementAndGet()
            lastActivityAt = now
        }

        fun hasActive(): Boolean = active.get() > 0
    }
