"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteTodo,
  getTodo,
  insertTodo,
  updateTodo,
  updateTodoStatus,
} from "./database";
import "server-only";
import { auth } from "@/auth";
// Create だけのスキーマに絞る（id/status は不要）
const CreateTodo = z.object({
  title: z.string().min(1, "タイトルは必須です").max(50, "最大50文字です"),
  content: z.string().min(1, "内容は必須です").max(500, "最大500文字です"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
    message: "優先度を選択してください",
  }),
  deadline: z
    .string()
    .min(1, "期限は必須です")
    .transform((v) => new Date(v))
    .refine((d) => !Number.isNaN(d.getTime()), "期限を正しく入力してください")
    .refine((d) => d >= new Date(), "現在以降の日時を入力してください"),
});

export type CreateTodoInput = z.infer<typeof CreateTodo>;

// 編集画面用
const UpdateTodo = z.object({
  id: z.coerce.number().int().positive("IDが不正です"),
  title: z.string().min(1, "タイトルは必須です").max(50, "最大50文字です"),
  content: z.string().min(1, "内容は必須です").max(500, "最大500文字です"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
    message: "優先度を選択してください",
  }),
  deadline: z
    .string()
    .min(1, "期限は必須です")
    .transform((v) => new Date(v))
    .refine((d) => !Number.isNaN(d.getTime()), "期限を正しく入力してください")
    .refine((d) => d >= new Date(), "現在以降の日時を入力してください"),
});
export type UpdateTodoInput = z.infer<typeof UpdateTodo>;

// チェックボックスのトグル更新用
const UpdateTodoStatus = z.object({
  done: z.boolean(),
});
export type UpdateTodoStatusInput = z.infer<typeof UpdateTodoStatus>;

export type CreateFormState = {
  errors: Partial<Record<keyof CreateTodoInput, string[]>>;
  message: string;
};
export type UpdateFormState = {
  errors: Partial<Record<keyof UpdateTodoInput, string[]>>;
  message: string;
};

export async function createTodoAction(
  prevState: CreateFormState,
  formData: FormData,
): Promise<CreateFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: {}, message: "ログインが必要です。" };
    // もしくは redirect("/login")
  }

  const validated = CreateTodo.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority"),
    deadline: formData.get("deadline"),
  });

  if (!validated.success) {
    const errorResponse = {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
    };
    console.error(errorResponse);
    console.error(formData);
    return errorResponse;
  }

  try {
    await insertTodo({
      title: validated.data.title,
      content: validated.data.content,
      priority: validated.data.priority,
      deadline: validated.data.deadline,
      user: { connect: { id: session.user.id } },
    });
  } catch {
    return {
      errors: {},
      message: "Database Error: Failed to Create Todo.",
    };
  }

  revalidatePath("/todos");
  redirect("/todos");
}

export async function updateTodoAction(
  id: number,
  formState: UpdateFormState,
  formData: FormData,
) {
  const validated = UpdateTodo.safeParse({
    id: id,
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority"),
    deadline: formData.get("deadline"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
    };
  }

  try {
    await updateTodo(id, {
      title: validated.data.title,
      content: validated.data.content,
      priority: validated.data.priority,
      deadline: validated.data.deadline,
    });
  } catch {
    return {
      errors: {},
      message: "Database Error: Failed to Update Todo.",
    };
  }

  revalidatePath("/todos");
  redirect("/todos");
}

export async function updateTodoStatusAction(id: number, done: boolean) {
  const validated = UpdateTodoStatus.safeParse({
    id: id,
    done: done,
  });

  if (!validated.success) {
    const errorResponse = {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
    };
    console.error(errorResponse);
    console.error(done);
    return errorResponse;
  }

  try {
    await updateTodoStatus(id, validated.data.done);
  } catch {
    return {
      errors: {},
      message: "Database Error: Failed to Update Todo.",
    };
  }

  revalidatePath("/todos");
  redirect("/todos");
}

export async function deleteTodoAction(id: number) {
  try {
    await deleteTodo(id);
  } catch (e) {
    console.error(e);
    return {
      errors: {},
      message: "Database Error: Failed to delete todo.",
    };
  }
  revalidatePath("/todos");
}
