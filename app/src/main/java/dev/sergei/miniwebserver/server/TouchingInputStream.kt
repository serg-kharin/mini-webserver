package dev.sergei.miniwebserver.server

import java.io.InputStream

// Reports activity on every read so a long download (streamed after serve()
// returns) keeps the idle watchdog from stopping the server mid-transfer.
class TouchingInputStream(
    private val delegate: InputStream,
    private val onRead: () -> Unit,
) : InputStream() {
    override fun read(): Int {
        onRead()
        return delegate.read()
    }

    override fun read(
        b: ByteArray,
        off: Int,
        len: Int,
    ): Int {
        onRead()
        return delegate.read(b, off, len)
    }

    override fun available(): Int = delegate.available()

    override fun close() = delegate.close()
}
