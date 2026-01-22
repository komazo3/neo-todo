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

export function toDatetimeLocalString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
