/**
 * Performs cycle detection via depth-first graph traversal, safeguarding the timeline
 * against deadlocks where event tasks circularly depend upon one another.
 */

export interface DependencyTask {
  readonly id: string;
  readonly dependsOn: readonly string[];
}

export function detectCycles(tasks: readonly DependencyTask[]): readonly string[] | null {
  const adj = new Map<string, string[]>();
  for (const t of tasks) adj.set(t.id, [...t.dependsOn]);

  const state = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
  const cyclePath: string[] = [];

  function dfs(curr: string): boolean {
    state.set(curr, 1);
    cyclePath.push(curr);
    for (const neighbor of adj.get(curr) ?? []) {
      if (state.get(neighbor) === 1) {
        cyclePath.push(neighbor);
        return true;
      }
      if (state.get(neighbor) !== 2 && dfs(neighbor)) return true;
    }
    state.set(curr, 2);
    cyclePath.pop();
    return false;
  }

  for (const t of tasks) {
    if (!state.get(t.id) && dfs(t.id)) return Object.freeze(cyclePath);
  }
  return null;
}
