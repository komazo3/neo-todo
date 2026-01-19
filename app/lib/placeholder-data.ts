export type Todo = {
  id: number;
  title: string;
  content: string;
  status: Status.UnTouched | Status.Doing | Status.Done;
  deadline: Date;
  priority: Priority;
};

export enum Priority {
  low,
  medium,
  high,
}

export enum Status {
  UnTouched,
  Doing,
  Done,
}

export const TODOS: Todo[] = [
  {
    id: 1,
    title: "朝会の議事録をまとめてSlackに投稿する",
    status: Status.UnTouched,
    content:
      "要点（決定事項・ToDo・懸念点）を3点に圧縮して投稿。リンクも添付。",
    deadline: new Date("2026-01-20 10:30"),
    priority: Priority.high,
  },
  {
    id: 2,
    title: "Next.js TODOアプリ：一覧画面のUIを調整（Tailwind）",
    status: Status.UnTouched,
    content:
      "ステータス表示・操作ボタンの配置・レスポンシブ対応を整える。アクセシビリティも軽く見る。",
    deadline: new Date("2026-01-20 15:00"),
    priority: Priority.low,
  },
  {
    id: 3,
    title: "PostgreSQLのローカル起動（Docker）を確認する",
    status: Status.Done,
    content: "composeで立ち上げ、Prismaの接続も成功。",
    deadline: new Date("2026-01-20 09:10"),
    priority: Priority.medium,
  },
  {
    id: 4,
    title: "散歩（10分）",
    status: Status.UnTouched,
    content: "頭をリセットする用。",
    deadline: new Date("2026-01-20 18:30"),
    priority: Priority.low,
  },
];
