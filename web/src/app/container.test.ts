import { describe, expect, it, vi } from 'vitest'
import { createUseCases, useCases } from '@/app/container'
import type { StorageRepository } from '@/domain/repositories/StorageRepository'

describe('container', () => {
  it('exposes the default use cases', () => {
    expect(typeof useCases.getFolders).toBe('function')
    expect(typeof useCases.uploadFiles).toBe('function')
  })

  it('wires a custom repository', async () => {
    const repo = {
      getFolders: vi.fn(async () => [{ id: 'x', name: 'X', storage: 'internal' as const }]),
    } as unknown as StorageRepository
    const useCases = createUseCases(repo)
    expect(await useCases.getFolders()).toHaveLength(1)
  })
})
