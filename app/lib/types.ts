export type TodoDTO = {
  id: number;
  title: string;
  content: string;
  status: "UNTOUCHED" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date; // Clientに渡すなら文字列が安全
};
