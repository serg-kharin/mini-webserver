# Mini Webserver

[![CI](https://github.com/serg-kharin/mini-webserver/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/serg-kharin/mini-webserver/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/serg-kharin/mini-webserver/branch/master/graph/badge.svg)](https://codecov.io/gh/serg-kharin/mini-webserver)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An Android app for a music player (NW-A306 and any Android 8+): it runs a local
HTTP server so you can upload files from a computer on the same Wi-Fi network to
the device — including the microSD card. The web UI is React; the backend is
Kotlin.

## Security
This server is built for **personal use**. It has **no authentication** — while it
is running, anyone on the same Wi-Fi network can browse, upload and delete files in
the granted folders. Only run it on networks you trust, and stop the server when
you are done.

## Documentation
- [Architecture](docs/ARCHITECTURE.md) — Android and web layers, boundaries, data flow.
- [Device setup](docs/DEVICE_SETUP.md) — enable USB debugging and prepare a device/emulator.

## How to use
1. On the device, pick a folder (internal storage or SD card).
2. Tap "Start server" — an address like `http://192.168.x.x:8080` appears.
3. On your computer, open that address in a browser (or scan the QR code) and drop files.

## Run on a real device
1. Enable USB debugging and connect the cable.
2. Build, install and launch in one command:
   ```bash
   ./gradlew runDebug
   ```
   (Use `./gradlew installDebug` to install without launching.)
3. On the player: "Add folder" → "Start server".
4. Open the shown `http://<ip>:8080` in your computer's browser, or scan the QR code.

## Run on an emulator
1. Create and start an AVD (Android 14), then install:
   ```bash
   ./gradlew installDebug
   ```
2. The emulator has its own internal IP, so forward the port to the host:
   ```bash
   adb forward tcp:8080 tcp:8080
   ```
3. Open `http://localhost:8080` in the browser on your computer.

## Develop the UI without a device
Run the web UI in the browser against an in-memory stub of the device API — no
device, no emulator:
```bash
cd web
pnpm install
pnpm run dev:stub
```
This starts the stub API and the Vite dev server together; open the printed
`http://localhost:5173`. The stub serves fake folders/files so you can exercise
browsing, search, upload, create and delete. To run them separately:
`pnpm run stub` and `pnpm run dev` in two terminals.

## Building
- The frontend (`web/`, React + Vite) is built **automatically** by a Gradle task
  and copied into `assets` — this requires **Node** and **pnpm** to be installed.
- Skip the frontend build (Kotlin-only iteration): `./gradlew assembleDebug -PskipWeb`.
- Frontend on its own: `cd web && pnpm install && pnpm run build`.
- Web tests + coverage: `cd web && pnpm test` / `pnpm run test:coverage`.
- Android unit tests: `./gradlew testDebugUnitTest`.

## Git hooks
The hooks activate automatically: the first Gradle build after cloning points git
at `.githooks` (git won't run hooks straight from a clone). To enable them without
building, run `git config core.hooksPath .githooks` once.

The `pre-commit` hook **blocks the commit** unless both projects build cleanly —
the web type-checks and the Android module compiles with Kotlin warnings treated
as errors and unit tests passing. On success it bumps the version in
`version.properties` (versionCode and the patch of versionName). Bypass in an
emergency with `git commit --no-verify`.

## Stack
- **Android**: Kotlin, Hilt (DI), Coroutines, kotlinx.serialization, NanoHTTPD, SAF.
- **Web**: React + TypeScript, Vite, Pico.css, react-i18next (RU/EN).
- minSdk 26, targetSdk 34.

## License
[MIT](LICENSE) © Sergei Kharin
