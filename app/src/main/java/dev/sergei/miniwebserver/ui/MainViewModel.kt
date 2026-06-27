package dev.sergei.miniwebserver.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import dev.sergei.miniwebserver.core.DEFAULT_PORT
import dev.sergei.miniwebserver.core.ServerStateHolder
import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.net.NetworkAddressProvider
import dev.sergei.miniwebserver.domain.usecase.AddFolder
import dev.sergei.miniwebserver.domain.usecase.GetFolders
import dev.sergei.miniwebserver.domain.usecase.RemoveFolder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

@HiltViewModel
class MainViewModel
    @Inject
    constructor(
        private val getFolders: GetFolders,
        private val addFolder: AddFolder,
        private val removeFolder: RemoveFolder,
        private val networkAddress: NetworkAddressProvider,
        serverState: ServerStateHolder,
    ) : ViewModel() {
        private val folders = MutableStateFlow<List<Folder>>(emptyList())

        val uiState: StateFlow<MainUiState> =
            combine(folders, serverState.running) { current, running ->
                MainUiState(current, running, if (running) serverUrl() else null)
            }
                .flowOn(Dispatchers.Default)
                .stateIn(viewModelScope, SharingStarted.WhileSubscribed(STOP_TIMEOUT_MS), MainUiState())

        fun refresh() = viewModelScope.launch { reload() }

        fun add(folderId: String) =
            viewModelScope.launch {
                withContext(Dispatchers.IO) { addFolder(folderId) }
                reload()
            }

        fun remove(folderId: String) =
            viewModelScope.launch {
                withContext(Dispatchers.IO) { removeFolder(folderId) }
                reload()
            }

        private suspend fun reload() {
            folders.value = withContext(Dispatchers.IO) { getFolders() }
        }

        private fun serverUrl(): String? = networkAddress.localIpv4()?.let { "http://$it:$DEFAULT_PORT" }

        private companion object {
            const val STOP_TIMEOUT_MS = 5_000L
        }
    }
