# Releasing

Releases are published as GitHub Releases with a signed APK attached. The
`Release` workflow (`.github/workflows/release.yml`) does the build and upload.

## Cut a release
1. Make sure `master` is green (CI passing).
2. Tag the commit and push the tag — the version comes from `version.properties`
   (the pre-commit hook bumps it on every commit, so check the current value):
   ```bash
   git tag v1.0.8
   git push origin v1.0.8
   ```
3. The workflow builds the web app, runs `assembleRelease` (signed), and attaches
   `app-release.apk` to a new GitHub Release named after the tag, with auto-generated
   notes. The APK appears on the repo's **Releases** page.

You can also trigger it without a tag: Actions → **Release** → **Run workflow**.

## Manual alternative (from your machine)
```bash
./gradlew assembleRelease
gh release create v1.0.8 \
  app/build/outputs/apk/release/app-release.apk \
  --title v1.0.8 --generate-notes
```
The APK is at `app/build/outputs/apk/release/app-release.apk`.

## Signing
- CI signs with the release key stored in repo secrets: `KEYSTORE_BASE64`,
  `KEYSTORE_PASSWORD`, `KEY_ALIAS`.
- Locally, signing uses `keystore.properties` (gitignored) pointing at `release.jks`.
- If the secrets/keystore are absent, the build falls back to the debug key — the
  APK still installs via sideload but is not suitable for distribution.
- **Back up `release.jks` and its password.** Losing them means future builds can't
  be signed with the same identity (no in-place updates).

## Version
`version.properties` holds `versionCode` and `versionName`; both are bumped
automatically by the pre-commit hook. Tag names should match the `versionName`.
