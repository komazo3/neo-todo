export const PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const;

export const STATUS = {
  UNTOUCHED: 0,
  DONE: 1,
} as const;

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY];
export type Status = (typeof STATUS)[keyof typeof STATUS];

export type Todo = {
  id: number;
  title: string;
  content: string;
  status: Status;
  deadline: Date;
  priority: Priority;
};

export const TODOS: Todo[] = [
  {
    id: 1,
    title: "朝会の議事録をまとめてSlackに投稿する",
    status: STATUS.UNTOUCHED,
    content:
      "要点（決定事項・ToDo・懸念点）を3点に圧縮して投稿。リンクも添付。",
    deadline: new Date("2026-01-20 10:30"),
    priority: PRIORITY.HIGH,
  },
  {
    id: 2,
    title: "Next.js TODOアプリ：一覧画面のUIを調整（Tailwind）",
    status: STATUS.UNTOUCHED,
    content:
      "ステータス表示・操作ボタンの配置・レスポンシブ対応を整える。アクセシビリティも軽く見る。",
    deadline: new Date("2026-01-20 15:00"),
    priority: PRIORITY.LOW,
  },
  {
    id: 3,
    title: "PostgreSQLのローカル起動（Docker）を確認する",
    status: STATUS.DONE,
    content: "composeで立ち上げ、Prismaの接続も成功。",
    deadline: new Date("2026-01-20 09:10"),
    priority: PRIORITY.MEDIUM,
  },
  {
    id: 4,
    title: "散歩（10分）",
    status: STATUS.UNTOUCHED,
    content: "頭をリセットする用。",
    deadline: new Date("2026-01-20 18:30"),
    priority: PRIORITY.LOW,
  },
];
