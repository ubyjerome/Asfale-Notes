export function deriveTitle(title: string, content: string): string {
  if (title.trim()) return title.trim();
  const firstLine = content.split('\n').find(l => l.trim()) ?? '';
  return firstLine.trim() || 'Untitled';
}
