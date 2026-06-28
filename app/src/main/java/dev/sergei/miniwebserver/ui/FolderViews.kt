package dev.sergei.miniwebserver.ui

import android.content.Context
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import dev.sergei.miniwebserver.R
import dev.sergei.miniwebserver.domain.model.Folder
import dev.sergei.miniwebserver.domain.model.StorageKind

private const val MUTED_ALPHA = 0.6f

fun renderFolders(
    container: LinearLayout,
    folders: List<Folder>,
    onRemove: (String) -> Unit,
) {
    val context = container.context
    container.removeAllViews()
    if (folders.isEmpty()) {
        container.addView(
            TextView(context).apply {
                text = context.getString(R.string.folders_empty)
                alpha = MUTED_ALPHA
            },
        )
        return
    }
    folders.forEach { container.addView(folderRow(context, it, onRemove)) }
}

private fun folderRow(
    context: Context,
    folder: Folder,
    onRemove: (String) -> Unit,
): View {
    val row =
        LinearLayout(context).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
    row.addView(
        TextView(context).apply {
            text = folderDisplay(context, folder)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        },
    )
    row.addView(
        Button(context).apply {
            text = context.getString(R.string.action_remove)
            setOnClickListener { onRemove(folder.id) }
        },
    )
    return row
}

private fun folderDisplay(
    context: Context,
    folder: Folder,
): String =
    when (folder.storage) {
        StorageKind.INTERNAL -> "${context.getString(R.string.storage_internal)}: ${folder.name}"
        StorageKind.SD -> "${context.getString(R.string.storage_sd)}: ${folder.name}"
        StorageKind.UNKNOWN -> folder.name
    }
