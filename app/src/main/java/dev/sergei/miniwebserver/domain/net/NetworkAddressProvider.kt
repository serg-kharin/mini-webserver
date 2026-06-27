package dev.sergei.miniwebserver.domain.net

interface NetworkAddressProvider {
    fun localIpv4(): String?
}
