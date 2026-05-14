const order: Record<string, number> = { urgent: 0, review: 1, settled: 2 };
export function sortByStatus<T extends { status?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (order[a.status || "review"] ?? 1) - (order[b.status || "review"] ?? 1));
}
