package dev.sergei.miniwebserver.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import dagger.hilt.android.AndroidEntryPoint
import dev.sergei.miniwebserver.R
import dev.sergei.miniwebserver.service.HttpService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    private val viewModel: MainViewModel by viewModels()

    private lateinit var foldersContainer: LinearLayout
    private lateinit var startButton: Button
    private lateinit var stopButton: Button
    private lateinit var statusLabel: TextView
    private lateinit var urlLabel: TextView
    private lateinit var qrImage: ImageView
    private lateinit var qrProgress: ProgressBar
    private var lastQrUrl: String? = null

    private val pickFolder =
        registerForActivityResult(ActivityResultContracts.OpenDocumentTree()) { uri ->
            if (uri != null) viewModel.add(uri.toString())
        }

    private val askNotifications = registerForActivityResult(ActivityResultContracts.RequestPermission()) {}

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        foldersContainer = findViewById(R.id.foldersContainer)
        startButton = findViewById(R.id.startButton)
        stopButton = findViewById(R.id.stopButton)
        statusLabel = findViewById(R.id.statusLabel)
        urlLabel = findViewById(R.id.urlLabel)
        qrImage = findViewById(R.id.qrImage)
        qrProgress = findViewById(R.id.qrProgress)

        findViewById<Button>(R.id.pickFolderButton).setOnClickListener { pickFolder.launch(INTERNAL_HINT) }
        startButton.setOnClickListener { startServer() }
        stopButton.setOnClickListener { stopService(Intent(this, HttpService::class.java)) }

        maybeAskNotifications()
        observeState()
    }

    override fun onResume() {
        super.onResume()
        viewModel.refresh()
    }

    private fun observeState() =
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect(::render)
            }
        }

    private fun render(state: MainUiState) {
        renderFolders(foldersContainer, state.folders, viewModel::remove)
        startButton.isEnabled = !state.running && state.folders.isNotEmpty()
        stopButton.isEnabled = state.running
        statusLabel.text = statusText(state)
        urlLabel.text = state.url.orEmpty()
        renderQr(state.url)
    }

    private fun statusText(state: MainUiState): String =
        when {
            state.running && state.url != null -> getString(R.string.status_running)
            state.running -> getString(R.string.status_running_no_wifi)
            state.folders.isEmpty() -> getString(R.string.status_need_folder)
            else -> getString(R.string.status_stopped)
        }

    private fun renderQr(url: String?) {
        if (url == null) {
            lastQrUrl = null
            qrImage.setImageDrawable(null)
            qrImage.visibility = ImageView.GONE
            qrProgress.visibility = ProgressBar.GONE
            return
        }
        if (url == lastQrUrl) return
        lastQrUrl = url
        qrImage.visibility = ImageView.GONE
        qrProgress.visibility = ProgressBar.VISIBLE
        lifecycleScope.launch {
            val bitmap = withContext(Dispatchers.Default) { QrGenerator.encode(url, QR_SIZE) }
            if (lastQrUrl == url) {
                qrImage.setImageBitmap(bitmap)
                qrImage.visibility = ImageView.VISIBLE
                qrProgress.visibility = ProgressBar.GONE
            }
        }
    }

    private fun startServer() {
        statusLabel.text = getString(R.string.status_starting)
        startButton.isEnabled = false
        ContextCompat.startForegroundService(this, Intent(this, HttpService::class.java))
    }

    private fun maybeAskNotifications() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            askNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    private companion object {
        const val QR_SIZE = 600
        val INTERNAL_HINT: Uri =
            Uri.parse("content://com.android.externalstorage.documents/document/primary:")
    }
}
