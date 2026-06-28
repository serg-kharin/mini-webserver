package dev.sergei.miniwebserver.di

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dev.sergei.miniwebserver.data.AndroidAppInfoProvider
import dev.sergei.miniwebserver.data.LocalNetworkAddressProvider
import dev.sergei.miniwebserver.data.SafStorageRepository
import dev.sergei.miniwebserver.domain.app.AppInfoProvider
import dev.sergei.miniwebserver.domain.net.NetworkAddressProvider
import dev.sergei.miniwebserver.domain.repository.StorageRepository

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindStorageRepository(impl: SafStorageRepository): StorageRepository

    @Binds
    abstract fun bindNetworkAddressProvider(impl: LocalNetworkAddressProvider): NetworkAddressProvider

    @Binds
    abstract fun bindAppInfoProvider(impl: AndroidAppInfoProvider): AppInfoProvider
}
