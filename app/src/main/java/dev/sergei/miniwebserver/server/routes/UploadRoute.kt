package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.model.StorageException
import dev.sergei.miniwebserver.domain.usecase.UploadFile
import dev.sergei.miniwebserver.server.ApiRoute
import dev.sergei.miniwebserver.server.folderParam
import dev.sergei.miniwebserver.server.okResponse
import dev.sergei.miniwebserver.server.pathParam
import dev.sergei.miniwebserver.server.queryParam
import fi.iki.elonen.NanoHTTPD.IHTTPSession
import fi.iki.elonen.NanoHTTPD.Method
import fi.iki.elonen.NanoHTTPD.Response
import java.io.File
import java.io.FileInputStream
import javax.inject.Inject

private const val MAX_UPLOAD_BYTES = 4L * 1024 * 1024 * 1024

class UploadRoute
    @Inject
    constructor(
        private val uploadFile: UploadFile,
    ) : ApiRoute {
        override val method = Method.POST
        override val path = "/api/upload"

        override fun handle(session: IHTTPSession): Response {
            val declared = session.headers["content-length"]?.toLongOrNull()
            if (declared != null && declared > MAX_UPLOAD_BYTES) {
                throw StorageException(StorageError.UPLOAD_TOO_LARGE)
            }
            val parts = HashMap<String, String>()
            session.parseBody(parts)
            val tempPath = parts["file"] ?: throw StorageException(StorageError.NO_FILE)
            val name = queryParam(session, "name").orEmpty()
            FileInputStream(File(tempPath)).use {
                uploadFile(folderParam(session), pathParam(session), name, it)
            }
            return okResponse()
        }
    }
