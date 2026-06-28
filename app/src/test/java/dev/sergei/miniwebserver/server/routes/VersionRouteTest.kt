package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.app.AppInfoProvider
import dev.sergei.miniwebserver.domain.usecase.GetAppVersion
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import io.mockk.mockk
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Test

class VersionRouteTest {
    @Test
    fun reportsTheAppVersion() {
        val provider =
            object : AppInfoProvider {
                override fun version() = "1.2.3"
            }
        val route = VersionRoute(GetAppVersion(provider), Json { encodeDefaults = true })

        val body = route.handle(mockk<IHTTPSession>()).data.readBytes().decodeToString()

        assertEquals("""{"app":"1.2.3"}""", body)
    }
}
