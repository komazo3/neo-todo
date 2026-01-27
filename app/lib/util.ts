export function formatDateTime(data: Date) {
  return data.toLocaleDateString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitial(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "?";
  return n[0].toUpperCase();
}
