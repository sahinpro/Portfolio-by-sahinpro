/** Drop blank list items so joins cannot render ", ," or "and .". */
export function visibleLabels(
  values: readonly string[] | null | undefined,
): string[] {
  return (values ?? [])
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}
