
export type FilterInput =
  | { label?: string | string[] }
  | { status?: string | string[] }
  | { name?: string | string[] }
  | { driver?: string | string[] }
  | { dangling?: boolean }
  | { type?: string | string[] };

export function buildDockerFilters(input: FilterInput): Record<string, any> {
  const filters: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;

    if (typeof value === 'boolean') {
      filters[key] = [value.toString()];
    } else if (typeof value === 'string') {
      filters[key] = [value];
    } else if (Array.isArray(value)) {
      filters[key] = value;
    }
  }

  return filters;
}
