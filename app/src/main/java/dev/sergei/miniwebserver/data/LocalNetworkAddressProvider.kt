package dev.sergei.miniwebserver.data

import dev.sergei.miniwebserver.domain.net.NetworkAddressProvider
import java.net.Inet4Address
import java.net.InetAddress
import java.net.NetworkInterface
import javax.inject.Inject

class LocalNetworkAddressProvider
    @Inject
    constructor() : NetworkAddressProvider {
        // Prefer the Wi-Fi interface explicitly; fall back to any non-loopback
        // IPv4 (e.g. eth0 on the emulator) when wlan0 isn't present.
        override fun localIpv4(): String? = ipv4Of("wlan0") ?: anyIpv4()

        private fun ipv4Of(name: String): String? =
            runCatching { NetworkInterface.getByName(name) }.getOrNull()
                ?.let { firstIpv4(it.inetAddresses.asSequence()) }

        private fun anyIpv4(): String? =
            firstIpv4(
                NetworkInterface.getNetworkInterfaces().asSequence()
                    .flatMap { it.inetAddresses.asSequence() },
            )

        private fun firstIpv4(addresses: Sequence<InetAddress>): String? =
            addresses.firstOrNull { !it.isLoopbackAddress && it is Inet4Address }?.hostAddress
    }
