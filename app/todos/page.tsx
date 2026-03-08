import SubHeader from "@/app/components/subHeader";
import DateSelector from "./dateSelector";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ensureTodayRecurringTodos, listTodos } from "@/app/lib/database";
import { getTodayJst } from "@/app/lib/jst";
import type { TodoDTO } from "@/app/lib/types";
import TodosClient from "./todosClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TODO一覧 | Todo Today",
  description: "TODOの一覧を表示・管理します。",
};

type TodosPageProps = {
  searchParams?: Promise<{ date?: string }>;
};

export default async function TodosPage({ searchParams }: TodosPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sp = await searchParams;

  // date だけは Server 側で確定（JST の日付として解釈するため UTC で固定）
  let targetDate: Date;
  if (sp?.date) {
    const [year, month, day] = sp.date.split("-").map(Number);
    if (year && month && day) {
      targetDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      targetDate = new Date();
    }
  } else {
    const today = getTodayJst();
    targetDate = new Date(Date.UTC(today.year, today.month - 1, today.day));
  }

  // 当日の繰り返しTODOが未生成であれば生成する
  await ensureTodayRecurringTodos(session.user.id, targetDate);

  // date だけを使用してTODOを取得
  const todos = await listTodos(
    session.user.id,
    undefined,
    undefined,
    targetDate,
  );

  const dto: TodoDTO[] = todos.map((t) => ({
    id: t.id,
    title: t.title,
    content: t.content,
    status: t.status,
    priority: t.priority,
    deadline: t.deadline,
    isAllDay: t.isAllDay,
    recurringGroupId: t.recurringGroupId,
  }));

  return (
    <>
      <SubHeader title="TODO一覧" />
      <DateSelector currentDate={targetDate} />
      <TodosClient initialTodos={dto} />
    </>
  );
}
