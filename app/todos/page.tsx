// app/todos/page.tsx (Server Component)
import SubHeader from "../components/subHeader";
import DateSelector from "./dateSelector";
import AddButton from "./addButton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { listTodos } from "../lib/database";
import { TodoDTO } from "../lib/types";
import TodosClient from "./todosClient";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{ date?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const sp = await searchParams;

  // date だけは Server 側で確定（最初の一覧取得に必要）
  let targetDate: Date;
  if (sp?.date) {
    const parsed = new Date(sp.date);
    targetDate = isNaN(parsed.getTime()) ? new Date() : parsed;
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
  }));

  return (
    <>
      <SubHeader title={"TODO一覧"} />
      <DateSelector currentDate={targetDate} />

      <TodosClient initialTodos={dto} />
    </>
  );
}
