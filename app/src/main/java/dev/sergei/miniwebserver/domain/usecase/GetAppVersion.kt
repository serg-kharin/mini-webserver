package dev.sergei.miniwebserver.domain.usecase

import dev.sergei.miniwebserver.domain.app.AppInfoProvider
import javax.inject.Inject

class GetAppVersion
    @Inject
    constructor(private val appInfo: AppInfoProvider) {
        operator fun invoke(): String = appInfo.version()
    }
