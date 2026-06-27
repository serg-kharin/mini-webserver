package dev.sergei.miniwebserver.data

import dev.sergei.miniwebserver.domain.net.NetworkAddressProvider
import java.net.Inet4Address
import java.net.NetworkInterface
import javax.inject.Inject

class LocalNetworkAddressProvider
    @Inject
    constructor() : NetworkAddressProvider {
        override fun localIpv4(): String? =
            NetworkInterface.getNetworkInterfaces().asSequence()
                .flatMap { it.inetAddresses.asSequence() }
                .firstOrNull { !it.isLoopbackAddress && it is Inet4Address }
                ?.hostAddress
    }
