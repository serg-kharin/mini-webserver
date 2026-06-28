# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versions before 1.0.14
are recorded only in the [GitHub releases](https://github.com/serg-kharin/mini-webserver/releases).

## [1.0.14] - 2026-06-28

### Added
- Download any file straight from the web UI (new read-only `/api/download` route).
- Overwrite protection: uploading a file that already exists now asks to **Replace**
  or **Skip** instead of silently overwriting (new `/api/exists` pre-check, `409`
  on conflict).
- **Retry** button for uploads that failed.
- Catalog listings are paged 20 entries at a time.
- **Stop** action in the foreground notification.
- The server auto-stops after 30 minutes with no requests.

### Changed
- Successful upload rows clear themselves so they don't pile up on screen.
- Errors show a non-blocking toast and deletes use an inline confirm, replacing the
  native `alert()`/`confirm()` dialogs.
- Uploads spool to the volume with the most free space (usually the SD card) and the
  per-file limit is lowered to 2 GB, so large transfers no longer risk filling
  internal storage.
- The server address now prefers the Wi-Fi (`wlan0`) interface, and is resolved off
  the main flow on the IO dispatcher.
- QR code is rendered with a single `setPixels()` call.
- Case-insensitive sorting, search and extension matching use `Locale.ROOT`.
- `splitPath` is shared between the web app and the dev stub.

### Tests
- Added server-layer unit tests for `WebServer` (dispatch + CSRF gate), `Responses`
  (error-to-status mapping), `AssetServer` (index fallback) and
  `SafStorageRepository` (folder-grant checks).
