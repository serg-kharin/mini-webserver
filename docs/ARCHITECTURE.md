# Architecture

Both the Android app and the web frontend follow Clean Architecture: an inner
domain that knows nothing about frameworks, surrounded by adapters. Dependencies
point inward only.

## Android (`app/src/main/java/dev/sergei/miniwebserver`)

```
ui ─────► domain ◄───── data
 │          ▲            ▲
service ────┘            │
server ─────────────────┘   (delivery: HTTP API + static assets)
di / core                   (wiring + shared runtime state)
```

- **domain** — pure Kotlin, no Android imports.
  - `model` — `Folder`, `DirListing`, `SearchHit`, `StorageError`.
  - `repository/StorageRepository` — the storage port.
  - `net/NetworkAddressProvider` — the network port.
  - `usecase` — one interactor per action (`ListDirectory`, `UploadFile`, …).
  - `util` — pure, unit-tested helpers (`storageKindOf`, `splitPath`).
- **data** — implements the ports. `SafStorageRepository` over the Storage
  Access Framework; SAF specifics live in `data/saf`, MIME resolution in
  `MimeResolver` (platform `MimeTypeMap`). `LocalNetworkAddressProvider`.
- **server** — HTTP delivery on NanoHTTPD. `WebServer` dispatches via a route
  table built from `Set<ApiRoute>` (Hilt multibinding); each endpoint is one
  small `routes/*Route` class. `AssetServer` serves the React bundle from assets.
  Responses are JSON DTOs; failures return machine-readable error codes.
- **ui** — MVVM. `MainViewModel` exposes a `StateFlow<MainUiState>`;
  `MainActivity` only renders and forwards intents.
- **service** — `HttpService` foreground service hosting `WebServer`.
- **di** — Hilt modules binding ports, routes, and providing `Json`.
- **core** — `ServerStateHolder` (shared running state), server config.

Use cases throw `StorageException(StorageError)`; `WebServer` maps the code to an
HTTP status and JSON body. The UI (Android resources and the web app) owns all
human-readable text, so no user-facing string is hard-coded in logic.

## Web (`web/src`)

```
ui ─────► domain ◄───── data
           ▲             ▲
          app (composition root: DI via React context)
```

- **domain** — `models`, `repositories/StorageRepository` (port), `usecases`.
- **data** — `HttpStorageRepository` implements the port against `/api/*`.
- **app** — `container` wires the repository to use cases; `UseCasesContext`
  injects them through React context.
- **ui** — components plus the `useFolderBrowser` view-model hook. `i18n`
  provides RU/EN translations and startup language detection.

Path alias `@/*` → `src/*`. The server returns error codes; the UI translates
them via i18n, so the backend stays locale-agnostic.
