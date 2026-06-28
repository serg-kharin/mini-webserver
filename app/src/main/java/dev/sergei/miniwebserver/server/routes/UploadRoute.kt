package dev.sergei.miniwebserver.server.routes

import dev.sergei.miniwebserver.core.MAX_UPLOAD_BYTES
import dev.sergei.miniwebserver.domain.model.StorageError
import dev.sergei.miniwebserver.domain.model.StorageException
import dev.sergei.miniwebserver.domain.usecase.FileExists
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

class UploadRoute
    @Inject
    constructor(
        private val uploadFile: UploadFile,
        private val fileExists: FileExists,
    ) : ApiRoute {
        override val method = Method.POST
        override val path = "/api/upload"

        override fun handle(session: IHTTPSession): Response {
            val folder = folderParam(session)
            val path = pathParam(session)
            val name = queryParam(session, "name").orEmpty()
            val overwrite = queryParam(session, "overwrite") == "true"

            // Reject a conflict before spooling the body, so the client doesn't
            // upload a whole file just to get a 409.
            if (name.isNotBlank() && !overwrite && fileExists(folder, path, name)) {
                throw StorageException(StorageError.FILE_EXISTS)
            }
            val declared = session.headers["content-length"]?.toLongOrNull()
            if (declared != null && declared > MAX_UPLOAD_BYTES) {
                throw StorageException(StorageError.UPLOAD_TOO_LARGE)
            }
            val parts = HashMap<String, String>()
            session.parseBody(parts)
            val temp = File(parts["file"] ?: throw StorageException(StorageError.NO_FILE))
            // The declared Content-Length can lie; the spooled file is the real size.
            if (temp.length() > MAX_UPLOAD_BYTES) throw StorageException(StorageError.UPLOAD_TOO_LARGE)
            FileInputStream(temp).use {
                uploadFile(folder, path, name, it, overwrite)
            }
            return okResponse()
        }
    }
