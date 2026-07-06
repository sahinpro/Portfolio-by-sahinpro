/** Sort key for public/admin project lists (newest first). */
export type ProjectSortable = {
  updatedAt: string;
};

export function compareProjectsByUpdatedDesc(
  a: ProjectSortable,
  b: ProjectSortable,
): number {
  return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
}

export function sortProjectsByUpdatedDesc<T extends ProjectSortable>(
  projects: T[],
): T[] {
  return [...projects].sort(compareProjectsByUpdatedDesc);
}
