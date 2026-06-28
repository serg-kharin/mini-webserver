import { describe, expect, it } from 'vitest'
import { splitPath } from '@/domain/util/path'

describe('splitPath', () => {
  it('splits on slashes', () => {
    expect(splitPath('Pink Floyd/The Wall')).toEqual(['Pink Floyd', 'The Wall'])
  })

  it('drops blank and traversal segments', () => {
    expect(splitPath('a//b/./c/../d')).toEqual(['a', 'b', 'c', 'd'])
  })

  it('returns an empty array for missing input', () => {
    expect(splitPath(null)).toEqual([])
    expect(splitPath(undefined)).toEqual([])
    expect(splitPath('')).toEqual([])
  })
})
