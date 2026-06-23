export function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function toIsoStringOrNull(value: Date | string | null | undefined) {
  if (!value) return null;
  return toIsoString(value);
}
