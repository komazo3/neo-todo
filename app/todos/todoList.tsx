"use client";

import Link from "next/link";
import { formatDateTime } from "../lib/util";
import { useOptimistic, useState, useTransition } from "react";
import { deleteTodoAction, updateTodoStatusAction } from "../lib/actions";
import { TodoDTO } from "../lib/types";
import PriorityChip from "./priorityChip";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { Status } from "@/generated/prisma/enums";

export default function TodoList({ todos }: { todos: TodoDTO[] }) {
  const [openedTodoId, setOpenedTodoId] = useState<number | null>(null);

  const handleClickOpen = (id: number) => {
    setOpenedTodoId(id);
  };

  const handleClose = () => {
    setOpenedTodoId(null);
  };

  const [isPending, startTransition] = useTransition();

  function toggleTodoDone(todoId: number, checked: boolean) {
    // 先にUIを更新（体感が良い）
    // setOptimisticTodos({ id: todoId, done: checked });

    // サーバー更新は裏で実行
    startTransition(async () => {
      await updateTodoStatusAction(todoId, checked);
      // revalidatePath("/todos") されるので、一覧は最終的に正になる
    });
  }

  function handleDeleteTodo(todoId: number) {
    // サーバー更新は裏で実行
    startTransition(async () => {
      await deleteTodoAction(todoId);
      // revalidatePath("/todos") されるので、一覧は最終的に正になる
    });
  }

  return (
    <>
      <ul className="divide-y divide-slate-200">
        {todos.map((todo: TodoDTO) => (
          <li key={todo.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-start gap-3">
              {/* <!-- complete toggle --> */}
              <input
                type="checkbox"
                aria-label="完了切り替え"
                className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                checked={todo.status === Status.DONE}
                onChange={(e) => toggleTodoDone(todo.id, e.target.checked)}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold">{todo.title}</p>

                  <PriorityChip priority={todo.priority}></PriorityChip>

                  <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                    期限: {formatDateTime(new Date(todo.deadline))}
                  </span>
                </div>

                <p className="whitespace-pre-line mt-1 line-clamp-2 text-sm text-slate-600">
                  {todo.content}
                </p>
              </div>

              {/* <!-- actions --> */}
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/todos/${todo.id}`}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  編集
                </Link>
                <button
                  type="button"
                  onClick={() => handleClickOpen(todo.id)}
                  className="inline-flex items-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 shadow-sm hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-100"
                >
                  削除
                </button>
              </div>
            </div>
            <Dialog
              open={openedTodoId === todo.id}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {`${todo.title}を削除しますか？`}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleDeleteTodo(todo.id)}>OK</Button>
                <Button onClick={handleClose} autoFocus>
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
