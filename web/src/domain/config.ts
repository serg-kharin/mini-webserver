// Mirrors MAX_UPLOAD_BYTES on the server (2 GB). Used to reject oversized files
// in the browser before spending time uploading them.
//
// To change the limit, update BOTH (keep them in sync):
//   - this constant
//   - app/src/main/java/dev/sergei/miniwebserver/core/ServerConfig.kt (MAX_UPLOAD_BYTES) — authoritative
// The server value is the real enforcement; this one is only a fast client-side pre-check.
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024
