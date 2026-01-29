// app/todos/todosClient.tsx
"use client";

import { useMemo, useState } from "react";
import TodoList from "./todoList";
import type { TodoDTO, TodoSort } from "@/app/lib/types";
import { Status } from "@/generated/prisma/enums";
import { DISPLAYSTATUS, SORTITEMS } from "@/app/lib/constants";
import SortSelect from "./sortSelect";
import AddButton from "./addButton";
import StatusFilter from "./statusFilter";

function parseStatus(v?: string): Status | undefined {
  if (v === "DONE") return Status.DONE;
  if (v === "UNTOUCHED") return Status.UNTOUCHED;
  return undefined;
}

function parseSort(v?: string): TodoSort {
  switch (v) {
    case "PRIORITY_DESC":
    case "PRIORITY_ASC":
    case "DEADLINE_ASC":
    case "DEADLINE_DESC":
      return v;
    default:
      return SORTITEMS.DEADLINE_ASC as TodoSort; // デフォルト
  }
}

export default function TodosClient({
  initialTodos,
}: {
  initialTodos: TodoDTO[];
}) {
  const [statusFilter, setStatusFilter] = useState<string>(DISPLAYSTATUS.ALL);
  const [sortFilter, setSortFilter] = useState<string>(SORTITEMS.DEADLINE_ASC);

  const status = parseStatus(
    statusFilter === DISPLAYSTATUS.ALL ? undefined : statusFilter,
  );
  const sort = parseSort(sortFilter);

  const filteredSorted = useMemo(() => {
    let arr = initialTodos;

    // filter
    if (status) {
      arr = arr.filter((t) => t.status === status);
    }

    // sort
    const copy = [...arr];
    copy.sort((a, b) => {
      switch (sort) {
        case "DEADLINE_ASC":
          return (
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          );
        case "DEADLINE_DESC":
          return (
            new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
          );
        case "PRIORITY_ASC":
          return priorityRank(a.priority) - priorityRank(b.priority);
        case "PRIORITY_DESC":
          return priorityRank(b.priority) - priorityRank(a.priority);
        default:
          return 0;
      }
    });

    if (sort === "DEADLINE_ASC" || sort == "DEADLINE_DESC") {
      // 全日フラグが true のものは常に末尾へ移動する
      const notAllDay = copy.filter((t) => !t.isAllDay);
      const allDay = copy.filter((t) => t.isAllDay);

      return [...notAllDay, ...allDay];
    } else {
      return copy;
    }
  }, [initialTodos, status, sort]);

  return (
    <>
      <section className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatusFilter current={statusFilter} onChange={setStatusFilter} />
        <SortSelect current={sortFilter} onChange={setSortFilter} />
        <AddButton />
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {filteredSorted.length === 0 ? (
          <p className="p-4">該当するTODOがありません。</p>
        ) : (
          <TodoList todos={filteredSorted} />
        )}
      </section>
    </>
  );
}

function priorityRank(p: TodoDTO["priority"]) {
  // 例: HIGH > MEDIUM > LOW
  switch (p) {
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    case "LOW":
      return 1;
    default:
      return 0;
  }
}
