"use client";

import Link from "next/link";
import { formatTimeJst } from "@/app/lib/jst";
import { useOptimistic, useState, useTransition } from "react";
import { deleteTodoAction, updateTodoStatusAction } from "@/app/lib/actions";
import type { TodoDTO } from "@/app/lib/types";
import PriorityChip from "./priorityChip";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { Status } from "@/generated/prisma/enums";
import { useToast } from "@/app/components/toastProvider";

export default function TodoList({ todos }: { todos: TodoDTO[] }) {
  const [openedTodoId, setOpenedTodoId] = useState<number | null>(null);
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (state, update: { id: number; status: "DONE" | "UNTOUCHED" }) =>
      state.map((t) =>
        t.id === update.id ? { ...t, status: update.status } : t,
      ),
  );

  const toast = useToast();

  const [isPending, startTransition] = useTransition();

  const handleCloseDialog = () => setOpenedTodoId(null);

  function toggleTodoDone(todoId: number, checked: boolean) {
    const nextStatus = checked ? Status.DONE : Status.UNTOUCHED;

    startTransition(async () => {
      // ✅ optimistic 更新は transition 内へ
      setOptimisticTodos({ id: todoId, status: nextStatus });

      try {
        await updateTodoStatusAction(todoId, checked);
        toast.success("更新しました。");
      } catch {
        // ✅ 失敗時のロールバックも transition 内
        setOptimisticTodos({
          id: todoId,
          status: checked ? Status.UNTOUCHED : Status.DONE,
        });
        toast.error("更新が失敗しました。");
      }
    });
  }

  function handleDeleteTodo(todoId: number) {
    startTransition(async () => {
      try {
        await deleteTodoAction(todoId);
        setOpenedTodoId(null);
        toast.success("削除しました。");
      } catch {
        toast.error("削除が失敗しました。");
      }
    });
  }

  return (
    <>
      <ul className="divide-y divide-slate-200">
        {optimisticTodos.map((todo) => (
          <li key={todo.id} className="px-1 py-4 sm:px-6">
            <div className="flex justify-around items-start gap-2 sm:gap-4">
              <Checkbox
                aria-label="完了切り替え"
                checked={todo.status === Status.DONE}
                onChange={(e) => toggleTodoDone(todo.id, e.target.checked)}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-center gap-4 mb-4">
                  <span className="text-sm font-semibold text-left truncate w-full border-b border-b-gray-300 pb-2">
                    {todo.title}
                  </span>
                  <div className="flex gap-2 text-left w-full flex-row items-start">
                    <PriorityChip priority={todo.priority} />
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {todo.isAllDay
                        ? "当日中"
                        : `期限: ${formatTimeJst(todo.deadline)}`}
                    </span>
                  </div>
                </div>

                <p className="whitespace-pre-line mt-1 break-all text-sm text-slate-600 max-w-[50vw]">
                  {todo.content}
                </p>
              </div>

              <div className="flex flex-col shrink-0 items-center gap-2 sm:flex-row">
                <Button
                  component={Link}
                  href={`/todos/${todo.id}`}
                  variant="outlined"
                >
                  編集
                </Button>
                <Button
                  color="error"
                  onClick={() => setOpenedTodoId(todo.id)}
                  variant="outlined"
                >
                  削除
                </Button>
              </div>
            </div>

            <Dialog open={openedTodoId === todo.id} onClose={handleCloseDialog}>
              <DialogContent>
                <DialogContentText>
                  {`${todo.title}を削除しますか？`}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => handleDeleteTodo(todo.id)}
                  disabled={isPending}
                  variant="contained"
                >
                  OK
                </Button>
                <Button
                  onClick={handleCloseDialog}
                  autoFocus
                  variant="outlined"
                >
                  キャンセル
                </Button>
              </DialogActions>
            </Dialog>
          </li>
        ))}
      </ul>
    </>
  );
}
