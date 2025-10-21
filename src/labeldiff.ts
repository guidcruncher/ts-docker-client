export interface LabelDiff {
  added: Record<string, string>;
  removed: Record<string, string>;
  changed: Record<string, { before: string; after: string }>;
}

export function diffLabels(
  previous: Record<string, string>,
  current: Record<string, string>
): LabelDiff {
  const added: Record<string, string> = {};
  const removed: Record<string, string> = {};
  const changed: Record<string, { before: string; after: string }> = {};

  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  for (const key of allKeys) {
    const before = previous[key];
    const after = current[key];

    if (before === undefined && after !== undefined) {
      added[key] = after;
    } else if (before !== undefined && after === undefined) {
      removed[key] = before;
    } else if (before !== after) {
      changed[key] = { before, after };
    }
  }

  return { added, removed, changed };
}
	
