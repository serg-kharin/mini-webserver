# Preparing a device for installation

How to get a player (Sony NW-A306 or any Android device) ready to install the
app over USB. Same steps work for any Android phone; for an emulator skip to the
bottom.

## 1. Install adb on your computer
adb (Android Debug Bridge) ships with the Android SDK platform-tools. On macOS:
```bash
brew install --cask android-platform-tools
```
Or it is already present at `~/Library/Android/sdk/platform-tools/adb` if you have
Android Studio.

## 2. Enable Developer options on the device
1. Settings → **About device** (on the Walkman: `Settings → System → About`).
2. Find **Build number** and tap it **7 times** until it says you are a developer.

## 3. Enable USB debugging
1. Settings → System → **Developer options**.
2. Turn the screen on at the top, then enable **USB debugging**.

## 4. Connect and authorize
1. Plug in with a **data** cable (not a charge-only cable).
2. Pull down the notification shade and switch the USB mode to **File Transfer (MTP)**.
3. Unlock the screen — an **"Allow USB debugging?"** dialog appears with the
   computer's key fingerprint. Check **"Always allow from this computer"** → **OK**.

## 5. Verify the connection
```bash
adb devices
```
Expected:
```
List of devices attached
XXXXXXXX	device
```
- `unauthorized` → confirm the dialog on the device screen.
- empty list → check the cable and that the USB mode is File Transfer.

If older authorizations get stuck: Developer options → **Revoke USB debugging
authorizations**, then replug.

## 6. Install
From the project root:
```bash
./gradlew runDebug
```
This builds, installs and launches the app. See the [README](../README.md) for usage.

## Picking a folder on the device
The system folder picker may show only the SD card at first. Open the **☰** menu
(top-left) and, if needed, the **⋮** menu → **Show internal storage** to reveal
internal memory. Android does not allow granting the *root* of internal storage or
the `Android/data` and `Android/obb` folders — pick a normal subfolder such as `Music`.

## Emulator
Create and start an AVD (Android 14) in Android Studio, then `./gradlew runDebug`.
Because the emulator has its own IP, forward the port to reach the server from the
host: `adb forward tcp:8080 tcp:8080`, then open `http://localhost:8080`.
