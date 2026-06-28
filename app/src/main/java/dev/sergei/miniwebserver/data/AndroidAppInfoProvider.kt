package dev.sergei.miniwebserver.data

import dev.sergei.miniwebserver.BuildConfig
import dev.sergei.miniwebserver.domain.app.AppInfoProvider
import javax.inject.Inject

class AndroidAppInfoProvider
    @Inject
    constructor() : AppInfoProvider {
        override fun version(): String = BuildConfig.VERSION_NAME
    }
