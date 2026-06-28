package dev.sergei.miniwebserver.server

import fi.iki.elonen.NanoHTTPD
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.OutputStream

// Routes NanoHTTPD's multipart temp files into a chosen directory instead of the
// system temp dir on internal storage. See UploadTempDirProvider for the choice.
class UploadTempFiles(private val dir: File) : NanoHTTPD.TempFileManagerFactory {
    override fun create(): NanoHTTPD.TempFileManager = Manager(dir)

    private class Manager(private val dir: File) : NanoHTTPD.TempFileManager {
        private val files = mutableListOf<NanoHTTPD.TempFile>()

        init {
            dir.mkdirs()
        }

        override fun createTempFile(filenameHint: String?): NanoHTTPD.TempFile =
            Temp(File.createTempFile("upload-", ".tmp", dir)).also { files.add(it) }

        override fun clear() {
            files.forEach { runCatching { it.delete() } }
            files.clear()
        }
    }

    private class Temp(private val file: File) : NanoHTTPD.TempFile {
        private val stream = FileOutputStream(file)

        override fun open(): OutputStream = stream

        override fun delete() {
            runCatching { stream.close() }
            if (file.exists() && !file.delete()) {
                throw IOException("Could not delete temp file ${file.absolutePath}")
            }
        }

        override fun getName(): String = file.absolutePath
    }
}
