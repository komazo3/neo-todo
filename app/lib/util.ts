export function formatTime(data: Date) {
  return data.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(data: Date) {
  return data.toLocaleDateString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
