"use client";

import Link from "next/link";
import { formatTimeJst } from "@/app/lib/jst";
import { useOptimistic, useState, useTransition } from "react";
import {
  deleteTodoAction,
  deleteRecurringTodoAction,
  updateTodoStatusAction,
} from "@/app/lib/actions";
import type { RecurringEditScope, TodoDTO } from "@/app/lib/types";
import PriorityChip from "./priorityChip";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Status } from "@/generated/prisma/enums";
import { useToast } from "@/app/components/toastProvider";

export default function TodoList({ todos }: { todos: TodoDTO[] }) {
  const [openedTodoId, setOpenedTodoId] = useState<string | null>(null);
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (state, update: { id: string; status: "DONE" | "UNTOUCHED" }) =>
      state.map((t) =>
        t.id === update.id ? { ...t, status: update.status } : t,
      ),
  );

  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const handleCloseDialog = () => setOpenedTodoId(null);

  const openedTodo = optimisticTodos.find((t) => t.id === openedTodoId) ?? null;

  function toggleTodoDone(todoId: string, checked: boolean) {
    const nextStatus = checked ? Status.DONE : Status.UNTOUCHED;

    startTransition(async () => {
      setOptimisticTodos({ id: todoId, status: nextStatus });

      try {
        await updateTodoStatusAction(todoId, checked);
        toast.success("更新しました。");
      } catch {
        setOptimisticTodos({
          id: todoId,
          status: checked ? Status.UNTOUCHED : Status.DONE,
        });
        toast.error("更新が失敗しました。");
      }
    });
  }

  function handleDeleteTodo(todoId: string) {
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

  function handleDeleteRecurringTodo(
    todoId: string,
    recurringGroupId: string,
    scope: RecurringEditScope,
  ) {
    startTransition(async () => {
      try {
        await deleteRecurringTodoAction(todoId, recurringGroupId, scope);
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
                    {todo.recurringGroupId && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        繰り返し
                      </span>
                    )}
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
                <Link href={`/todos/${todo.id}`}>
                  <Button variant="outlined">編集</Button>
                </Link>
                <Button
                  color="error"
                  onClick={() => setOpenedTodoId(todo.id)}
                  variant="outlined"
                >
                  削除
                </Button>
              </div>
            </div>

            {/* 削除確認ダイアログ */}
            <Dialog open={openedTodoId === todo.id} onClose={handleCloseDialog}>
              {todo.recurringGroupId ? (
                /* 繰り返しTODO: スコープ選択 */
                <>
                  <DialogTitle>どのTODOを削除しますか？</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      {`「${todo.title}」は繰り返しTODOです。削除する範囲を選択してください。`}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      disabled={isPending}
                      onClick={() =>
                        handleDeleteRecurringTodo(
                          todo.id,
                          todo.recurringGroupId!,
                          "ONLY_THIS",
                        )
                      }
                    >
                      該当のTODOのみ削除
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      disabled={isPending}
                      onClick={() =>
                        handleDeleteRecurringTodo(
                          todo.id,
                          todo.recurringGroupId!,
                          "THIS_AND_FUTURE",
                        )
                      }
                    >
                      そのTODO以降のTODOを削除
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      disabled={isPending}
                      onClick={() =>
                        handleDeleteRecurringTodo(
                          todo.id,
                          todo.recurringGroupId!,
                          "ALL",
                        )
                      }
                    >
                      すべての繰り返しTODOを削除
                    </Button>
                    <Button
                      fullWidth
                      onClick={handleCloseDialog}
                      autoFocus
                      variant="text"
                    >
                      キャンセル
                    </Button>
                  </DialogActions>
                </>
              ) : (
                /* 通常TODO: 既存の確認ダイアログ */
                <>
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
                </>
              )}
            </Dialog>
          </li>
        ))}
      </ul>
    </>
  );
}
