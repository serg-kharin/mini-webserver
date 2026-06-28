# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Versions before
1.0.14 are recorded only in the
[GitHub releases](https://github.com/serg-kharin/mini-webserver/releases).

## [Unreleased]

## [1.0.18] - 2026-06-28

### Added
- HTTP Range / `206 Partial Content` support for downloads, so audio can be
  seeked in the browser and interrupted downloads resume instead of restarting.
- Search shows a notice when results were capped (500 hits / 5000 directories),
  so a truncated scan is no longer silent.

### Changed
- Idle auto-stop no longer interrupts a transfer in progress: the watchdog tracks
  in-flight requests and streaming reads, not just the start of a request.
- The upload size limit is enforced against the actual spooled bytes, not only the
  declared `Content-Length` (which a client can understate).
- The overwrite check runs on the server before the body is spooled, so a conflict
  fails fast; the browser no longer makes a separate existence request per file.
- Oversized files are rejected in the browser before any upload starts.
- Downloads send `X-Content-Type-Options: nosniff`, and server JSON responses are
  serialized instead of hand-built strings.

### Fixed
- Half-written `.part` uploads are hidden from the file listing, so an interrupted
  transfer no longer leaves a visible, downloadable stub.
- The app screen no longer flashes "no Wi-Fi address" when the server starts: the
  running state and the address now update in a single step.

## [1.0.17] - 2026-06-28

### Added
- Footer in the web UI showing the app (APK) version and the UI bundle version,
  backed by a new `/api/version` endpoint.
- Search results are now paged 20 at a time, like the folder listing.
- Screenshots of the app and the web interface in the README.

### Changed
- The pre-commit hook now bumps `web/package.json` in lockstep with the Android
  version, so the UI version is no longer stuck at `1.0.0`.
- Release notes are taken from this changelog instead of an auto-generated
  "Full Changelog" link.

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

[Unreleased]: https://github.com/serg-kharin/mini-webserver/compare/v1.0.18...HEAD
[1.0.18]: https://github.com/serg-kharin/mini-webserver/compare/v1.0.17...v1.0.18
[1.0.17]: https://github.com/serg-kharin/mini-webserver/compare/v1.0.14...v1.0.17
[1.0.14]: https://github.com/serg-kharin/mini-webserver/compare/v1.0.13...v1.0.14
