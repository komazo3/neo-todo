export type TodoDTO = {
  id: string;
  title: string;
  content: string;
  status: "UNTOUCHED" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date;
  isAllDay: boolean;
};

export type UserDTO = {
  id: string;
  name: string;
};

// 4種類だけを許可（URLクエリから来てもここで弾ける）
export type TodoSort =
  | "PRIORITY_DESC" // 優先度：高い順
  | "PRIORITY_ASC" // 優先度：低い順
  | "DEADLINE_ASC" // 期限：近い順
  | "DEADLINE_DESC"; // 期限：遠い順

export type UserLite = { name: string; image: string; email: string };
