export function formatDateTime(data: Date) {
  return data.toLocaleDateString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
