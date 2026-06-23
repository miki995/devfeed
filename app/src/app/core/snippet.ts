export function makeSnippet(text: string, query: string, radius: number): string {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return text.slice(0, radius * 2).trim();
  }
  const index = text.toLowerCase().indexOf(normalizedQuery);
  if (index === -1) {
    return text.slice(0, radius * 2).trim();
  }
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + normalizedQuery.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}
