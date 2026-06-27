import { describe, expect, it } from 'vitest'
import { humanSize } from '@/ui/format'

describe('humanSize', () => {
  it('formats each size range', () => {
    expect(humanSize(512)).toBe('512 B')
    expect(humanSize(1536)).toBe('1.5 KB')
    expect(humanSize(5 * 1024 * 1024)).toBe('5.0 MB')
    expect(humanSize(3 * 1024 * 1024 * 1024)).toBe('3.00 GB')
  })
})
