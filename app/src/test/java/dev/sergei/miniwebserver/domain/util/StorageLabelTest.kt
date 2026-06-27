package dev.sergei.miniwebserver.domain.util

import dev.sergei.miniwebserver.domain.model.StorageKind
import org.junit.Assert.assertEquals
import org.junit.Test

class StorageLabelTest {
    @Test
    fun primaryVolumeIsInternal() {
        assertEquals(StorageKind.INTERNAL, storageKindOf("primary:Music"))
    }

    @Test
    fun removableVolumeIsSd() {
        assertEquals(StorageKind.SD, storageKindOf("BCD4-F342:Music"))
    }

    @Test
    fun nullOrBlankIsUnknown() {
        assertEquals(StorageKind.UNKNOWN, storageKindOf(null))
        assertEquals(StorageKind.UNKNOWN, storageKindOf(""))
    }
}
