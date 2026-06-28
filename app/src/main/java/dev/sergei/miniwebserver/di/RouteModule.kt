package dev.sergei.miniwebserver.di

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dagger.multibindings.IntoSet
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.routes.DeleteRoute
import dev.sergei.miniwebserver.server.routes.DownloadRoute
import dev.sergei.miniwebserver.server.routes.ExistsRoute
import dev.sergei.miniwebserver.server.routes.FoldersRoute
import dev.sergei.miniwebserver.server.routes.ListRoute
import dev.sergei.miniwebserver.server.routes.MkdirRoute
import dev.sergei.miniwebserver.server.routes.SearchRoute
import dev.sergei.miniwebserver.server.routes.UploadRoute
import dev.sergei.miniwebserver.server.routes.VersionRoute

@Module
@InstallIn(SingletonComponent::class)
abstract class RouteModule {
    @Binds @IntoSet
    abstract fun foldersRoute(impl: FoldersRoute): ApiRoute

    @Binds @IntoSet
    abstract fun listRoute(impl: ListRoute): ApiRoute

    @Binds @IntoSet
    abstract fun searchRoute(impl: SearchRoute): ApiRoute

    @Binds @IntoSet
    abstract fun uploadRoute(impl: UploadRoute): ApiRoute

    @Binds @IntoSet
    abstract fun mkdirRoute(impl: MkdirRoute): ApiRoute

    @Binds @IntoSet
    abstract fun deleteRoute(impl: DeleteRoute): ApiRoute

    @Binds @IntoSet
    abstract fun existsRoute(impl: ExistsRoute): ApiRoute

    @Binds @IntoSet
    abstract fun downloadRoute(impl: DownloadRoute): ApiRoute

    @Binds @IntoSet
    abstract fun versionRoute(impl: VersionRoute): ApiRoute
}
