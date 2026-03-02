"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteTodo,
  insertTodo,
  updateTodo,
  updateTodoStatus,
  updateUser,
} from "./database";
import { parseJstStringsToUtc } from "./jst";
import "server-only";
import { auth, signOut } from "@/auth";
// Create だけのスキーマに絞る（id/status は不要）
const CreateTodo = z
  .object({
    title: z.string().min(1).max(50),
    content: z.string().max(500),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    // MUI DatePickerから "YYYY/MM/DD"形式
    deadlineDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "期限日が不正です"),
    // MUI TimePickerから "HH:mm" or ""（空）
    deadlineTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "時刻の形式が正しくありません",
      )
      .optional()
      .or(z.literal("")),
  })
  .transform((data) => {
    const deadline = parseJstStringsToUtc(
      data.deadlineDate,
      data.deadlineTime && data.deadlineTime !== ""
        ? data.deadlineTime
        : undefined,
    );
    const isAllDay = !data.deadlineTime || data.deadlineTime === "";
    return { ...data, deadline, isAllDay };
  });

export type CreateTodoInput = z.infer<typeof CreateTodo>;
export type CreateTodoData = z.infer<typeof CreateTodo>; // deadline/isAllDay含む

// 編集画面用
const UpdateTodo = z
  .object({
    id: z.coerce.number().int().positive("IDが不正です"),
    title: z.string().min(1, "タイトルは必須です").max(50, "最大50文字です"),
    content: z.string().max(500, "最大500文字です"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
      message: "優先度を選択してください",
    }),
    // MUI DatePickerから "YYYY/MM/DD"形式
    deadlineDate: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, "期限日が不正です"),
    // MUI TimePickerから "HH:mm" or ""（空）
    deadlineTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "時刻の形式が正しくありません",
      )
      .optional()
      .or(z.literal("")),
  })
  .transform((data) => {
    const deadline = parseJstStringsToUtc(
      data.deadlineDate,
      data.deadlineTime && data.deadlineTime !== ""
        ? data.deadlineTime
        : undefined,
    );
    const isAllDay = !data.deadlineTime || data.deadlineTime === "";
    return { ...data, deadline, isAllDay };
  });

export type UpdateTodoInput = z.infer<typeof UpdateTodo>;

// チェックボックスのトグル更新用
const UpdateTodoStatus = z.object({
  done: z.boolean(),
});
export type UpdateTodoStatusInput = z.infer<typeof UpdateTodoStatus>;

const UpdateUser = z.object({
  id: z.string(),
  name: z.string().min(1, "名前は必須です").max(50, "最大50文字です"),
});
export type UserUpdateInput = z.infer<typeof UpdateUser>;

export type CreateFormState = {
  errors: Partial<Record<keyof CreateTodoInput, string[]>>;
  message: string;
};
export type UpdateFormState = {
  errors: Partial<Record<keyof UpdateTodoInput, string[]>>;
  message: string;
  success: boolean;
  fields?: Record<string, any>;
};
export type UpdateUserFormState = {
  errors: Partial<Record<keyof UserUpdateInput, string[]>>;
  message: string;
  success: boolean;
  fields?: Record<string, any>;
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
    deadlineDate: formData.get("deadlineDate"),
    deadlineTime: formData.get("deadlineTime"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
    };
  }

  try {
    await insertTodo({
      title: validated.data.title,
      content: validated.data.content,
      priority: validated.data.priority,
      deadline: validated.data.deadline,
      isAllDay: validated.data.isAllDay,
      user: { connect: { id: session.user.id } },
    });
  } catch (e: unknown) {
    return {
      errors: {},
      message: e instanceof Error ? e.message : "TODOの追加に失敗しました。",
    };
  }

  revalidatePath("/todos");
  redirect("/todos");
}

export async function updateTodoAction(
  formState: UpdateFormState,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: {}, message: "ログインが必要です。" };
  }

  const validated = UpdateTodo.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
    priority: formData.get("priority"),
    deadlineDate: formData.get("deadlineDate"),
    deadlineTime: formData.get("deadlineTime"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
    };
  }

  try {
    await updateTodo(validated.data.id, session.user.id, {
      title: validated.data.title,
      content: validated.data.content,
      priority: validated.data.priority,
      deadline: validated.data.deadline,
      isAllDay: validated.data.isAllDay,
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
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: {}, message: "ログインが必要です。" };
  }

  const validated = UpdateTodoStatus.safeParse({ done });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
    };
  }

  try {
    await updateTodoStatus(id, session.user.id, validated.data.done);
  } catch {
    return {
      errors: {},
      message: "Database Error: Failed to Update Todo.",
    };
  }

  revalidatePath("/todos");
}

export async function deleteTodoAction(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("ログインが必要です。");
  }

  try {
    await deleteTodo(id, session.user.id);
  } catch {
    throw new Error("Database Error: Failed to delete todo.");
  }
  revalidatePath("/todos");
}

export async function updateUserAction(
  formState: UpdateUserFormState,
  formData: FormData,
): Promise<UpdateUserFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { errors: {}, message: "ログインが必要です。", success: false };
  }

  const validated = UpdateUser.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "入力内容を確認してください。",
      success: false,
    };
  }

  if (validated.data.id !== session.user.id) {
    return { errors: {}, message: "不正なリクエストです。", success: false };
  }

  try {
    await updateUser(validated.data.id, {
      name: validated.data.name,
    });
  } catch {
    return {
      errors: {},
      message: "Database Error: Failed to Update User.",
      success: false,
    };
  }

  revalidatePath("/mypage");
  return {
    errors: {},
    message: "success",
    success: true,
    fields: { name: validated.data.name },
  };
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
