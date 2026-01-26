import { Status, Todo } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { TodoCreateInput, TodoUpdateInput } from "@/generated/prisma/models";
import "server-only";
export async function listTodos(
  userId: string,
  status?: Status,
): Promise<Todo[]> {
  return prisma.todo.findMany({
    where: { status: status ? status : undefined, userId: userId },
    orderBy: { deadline: "asc" },
  });
}

export async function getTodo(todoId: number, userId: string) {
  return prisma.todo.findUnique({
    where: { id: todoId, userId: userId },
  });
}

export async function insertTodo(data: TodoCreateInput) {
  return prisma.todo.create({
    data,
  });
}

export async function updateTodo(id: number, data: TodoUpdateInput) {
  return prisma.todo.update({
    where: { id },
    data: { ...data },
  });
}

export async function updateTodoStatus(id: number, done: boolean) {
  return prisma.todo.update({
    where: { id },
    data: { status: done ? Status.DONE : Status.UNTOUCHED },
  });
}

export async function deleteTodo(id: number) {
  return prisma.todo.delete({
    where: { id },
  });
}
