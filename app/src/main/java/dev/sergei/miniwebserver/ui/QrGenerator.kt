package dev.sergei.miniwebserver.ui

import android.graphics.Bitmap
import android.graphics.Color
import androidx.core.graphics.createBitmap
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter

object QrGenerator {
    fun encode(
        text: String,
        size: Int,
    ): Bitmap {
        val matrix = QRCodeWriter().encode(text, BarcodeFormat.QR_CODE, size, size)
        // Fill an int buffer and push it in one setPixels() call instead of
        // size*size individual bitmap writes.
        val pixels = IntArray(size * size)
        for (y in 0 until size) {
            val row = y * size
            for (x in 0 until size) {
                pixels[row + x] = if (matrix[x, y]) Color.BLACK else Color.WHITE
            }
        }
        return createBitmap(size, size).apply { setPixels(pixels, 0, size, 0, 0, size, size) }
    }
}
