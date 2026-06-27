import { createContext, useContext, type ReactNode } from 'react'
import type { UseCases } from '@/app/container'

const UseCasesContext = createContext<UseCases | null>(null)

export function UseCasesProvider({
  useCases,
  children,
}: {
  useCases: UseCases
  children: ReactNode
}) {
  return <UseCasesContext.Provider value={useCases}>{children}</UseCasesContext.Provider>
}

export function useUseCases(): UseCases {
  const ctx = useContext(UseCasesContext)
  if (!ctx) throw new Error('useUseCases must be used within <UseCasesProvider>')
  return ctx
}
