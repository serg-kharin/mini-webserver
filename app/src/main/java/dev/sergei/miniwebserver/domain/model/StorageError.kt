package dev.sergei.miniwebserver.domain.model

enum class StorageError(val code: String) {
    FOLDER_NOT_GRANTED("folder_not_granted"),
    NO_FILE("no_file"),
    CREATE_FAILED("create_failed"),
    MKDIR_EMPTY_NAME("mkdir_empty_name"),
    MKDIR_FAILED("mkdir_failed"),
    DELETE_NO_NAME("delete_no_name"),
    DELETE_FAILED("delete_failed"),
    UPLOAD_TOO_LARGE("upload_too_large"),
    FILE_EXISTS("file_exists"),
    UNKNOWN("unknown"),
}

class StorageException(val error: StorageError) : Exception(error.code)
