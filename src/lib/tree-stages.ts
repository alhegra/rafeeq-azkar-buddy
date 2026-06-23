export interface TreeStage {
  level: number;
  name: string;
  emoji: string;
  min: number;
  next: number | null;
}

export const TREE_STAGES: TreeStage[] = [
  { level: 0, name: "بذرة", emoji: "🌱", min: 0, next: 30 },
  { level: 1, name: "براعم", emoji: "🌿", min: 30, next: 120 },
  { level: 2, name: "شجيرة", emoji: "🌳", min: 120, next: 400 },
  { level: 3, name: "شجرة كبيرة", emoji: "🌴", min: 400, next: 1000 },
  { level: 4, name: "بستان مزهر", emoji: "🌷", min: 1000, next: null },
];

export function getTreeStage(xp: number): TreeStage {
  let cur = TREE_STAGES[0];
  for (const s of TREE_STAGES) if (xp >= s.min) cur = s;
  return cur;
}

export function getStageProgress(xp: number): { stage: TreeStage; pct: number; toNext: number } {
  const stage = getTreeStage(xp);
  if (stage.next == null) return { stage, pct: 100, toNext: 0 };
  const span = stage.next - stage.min;
  const inStage = xp - stage.min;
  return { stage, pct: Math.round((inStage / span) * 100), toNext: stage.next - xp };
}
