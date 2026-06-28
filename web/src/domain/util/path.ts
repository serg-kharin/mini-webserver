const TRAVERSAL = new Set(['.', '..'])

// Drop blank and traversal segments; folder/file names are never "." or "..".
export function splitPath(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw.split('/').filter((segment) => segment.length > 0 && !TRAVERSAL.has(segment))
}
