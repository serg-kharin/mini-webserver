import type { StorageRepository } from '@/domain/repositories/StorageRepository'

// The app (APK) version reported by the device server; '' if unavailable.
export const makeGetServerVersion = (repo: StorageRepository) => (): Promise<string> =>
  repo.serverVersion()
