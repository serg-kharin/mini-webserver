package dev.sergei.miniwebserver.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ActivityTrackerTest {
    @Test
    fun reportsIdleTimeSinceLastTouch() {
        val tracker = ActivityTracker()
        tracker.touch(1_000)
        assertEquals(500, tracker.idleFor(1_500))
    }

    @Test
    fun staysActiveUntilEveryRequestEnds() {
        val tracker = ActivityTracker()
        assertFalse(tracker.hasActive())

        tracker.begin()
        tracker.begin()
        assertTrue(tracker.hasActive())

        tracker.end(2_000)
        assertTrue(tracker.hasActive())

        tracker.end(3_000)
        assertFalse(tracker.hasActive())
        assertEquals(3_000, tracker.lastActivityAt)
    }
}
