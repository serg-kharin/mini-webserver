import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ktlint)
    alias(libs.plugins.detekt)
    alias(libs.plugins.kover)
}

val appVersion =
    Properties().apply {
        rootProject.file("version.properties").inputStream().use { load(it) }
    }

val keystoreProperties =
    rootProject.file("keystore.properties").takeIf { it.exists() }?.let {
        Properties().apply { it.inputStream().use(::load) }
    }

android {
    namespace = "dev.sergei.miniwebserver"
    compileSdk = 34

    buildFeatures {
        // Exposes VERSION_NAME so the server can report the app version.
        buildConfig = true
    }

    defaultConfig {
        applicationId = "dev.sergei.miniwebserver"
        minSdk = 26
        targetSdk = 34
        versionCode = appVersion.getProperty("versionCode").toInt()
        versionName = appVersion.getProperty("versionName")
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        keystoreProperties?.let { props ->
            create("release") {
                storeFile = rootProject.file(props.getProperty("storeFile"))
                storePassword = props.getProperty("storePassword")
                keyAlias = props.getProperty("keyAlias")
                keyPassword = props.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            // Real release key from keystore.properties if present, else the debug key.
            signingConfig = signingConfigs.findByName("release") ?: signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
        // Enabled by the pre-commit hook (-PstrictBuild) so warnings block commits.
        allWarningsAsErrors = providers.gradleProperty("strictBuild").isPresent
    }

    testOptions {
        // Let android.jar stubs (e.g. Log) return defaults instead of throwing in JVM tests.
        unitTests.isReturnDefaultValues = true
    }
}

detekt {
    buildUponDefaultConfig = true
    config.setFrom(rootProject.files("config/detekt/detekt.yml"))
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.documentfile)
    implementation(libs.androidx.activity.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.nanohttpd)
    implementation(libs.zxing.core)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)

    testImplementation(libs.junit)
    testImplementation(libs.mockk)
    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.test.runner)
}

// build the web app and copy it into assets (skip with -PskipWeb)
val webRoot = rootProject.layout.projectDirectory.dir("web")
val webAssets = layout.projectDirectory.dir("src/main/assets/web")
val skipWeb = providers.gradleProperty("skipWeb").isPresent
val pnpm = if (System.getProperty("os.name").startsWith("Windows")) "pnpm.cmd" else "pnpm"

val webInstall by tasks.registering(Exec::class) {
    onlyIf { !skipWeb && !webRoot.dir("node_modules").asFile.exists() }
    workingDir = webRoot.asFile
    commandLine(pnpm, "install")
}

val webBuild by tasks.registering(Exec::class) {
    onlyIf { !skipWeb }
    dependsOn(webInstall)
    workingDir = webRoot.asFile
    commandLine(pnpm, "run", "build")
}

val copyWeb by tasks.registering(Copy::class) {
    onlyIf { !skipWeb }
    dependsOn(webBuild)
    doFirst { delete(webAssets) }
    from(webRoot.dir("dist"))
    into(webAssets)
}

// Point git at the tracked hooks dir on every build, so cloning + building is
// enough to activate the pre-commit checks (git won't auto-run hooks from a clone).
val installGitHooks by tasks.registering(Exec::class) {
    onlyIf { rootProject.file(".git").exists() }
    workingDir = rootDir
    commandLine("git", "config", "core.hooksPath", ".githooks")
}

tasks.named("preBuild") {
    dependsOn(copyWeb)
    dependsOn(installGitHooks)
}

// One command to build, install and launch on the connected device: ./gradlew runDebug
val adbExecutable = if (System.getProperty("os.name").startsWith("Windows")) "adb.exe" else "adb"
tasks.register<Exec>("runDebug") {
    group = "run"
    description = "Build, install and launch the debug app on the connected device."
    dependsOn("installDebug")
    commandLine(
        android.sdkDirectory.resolve("platform-tools/$adbExecutable").absolutePath,
        "shell",
        "am",
        "start",
        "-n",
        "dev.sergei.miniwebserver/.ui.MainActivity",
    )
}
