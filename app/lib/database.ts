import { Status, Todo } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { TodoCreateInput } from "@/generated/prisma/models";
import "server-only";
export async function listTodos(status?: Status): Promise<Todo[]> {
  return prisma.todo.findMany({
    where: status ? { status } : undefined,
    orderBy: { deadline: "asc" },
  });
}

export async function insertTodo(data: TodoCreateInput) {
  return prisma.todo.create({
    data,
  });
}

export async function updateTodoStatus(id: number, done: boolean) {
  return prisma.todo.update({
    where: { id: id },
    data: { status: done ? Status.DONE : Status.UNTOUCHED },
  });
}
