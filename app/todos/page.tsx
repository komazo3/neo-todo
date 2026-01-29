import SubHeader from "@/app/components/subHeader";
import DateSelector from "./dateSelector";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listTodos } from "@/app/lib/database";
import type { TodoDTO } from "@/app/lib/types";
import TodosClient from "./todosClient";

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
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;

  // date だけは Server 側で確定（最初の一覧取得に必要）
  let targetDate: Date;
  if (sp?.date) {
    const [year, month, day] = sp.date.split("-").map(Number);
    if (year && month && day) {
      targetDate = new Date(year, month - 1, day);
    } else {
      targetDate = new Date();
    }
  } else {
    targetDate = new Date();
  }

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
  }));

  return (
    <>
      <SubHeader title="TODO一覧" />
      <DateSelector currentDate={targetDate} />
      <TodosClient initialTodos={dto} />
    </>
  );
}
