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

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};
