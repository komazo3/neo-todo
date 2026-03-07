import { format, startOfDay } from "date-fns";
import { z } from "zod";
import { parseJstStringsToUtc } from "./jst";

/** TODO作成・編集フォーム用のクライアント側バリデーションスキーマ */
export const todoFormSchema = z
  .object({
    title: z.string().min(1, "タイトルは必須です").max(50, "最大50文字です"),
    content: z.string().max(500, "最大500文字です"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"], {
      message: "優先度を選択してください",
    }),
    deadlineDate: z.preprocess(
      (v) => (typeof v === "string" ? new Date(v) : undefined),
      z
        .date({
          error: (d) => "期限日は必須です",
        })
        .refine(
          (d) => !Number.isNaN(d.getTime()),
          "期限日を正しく入力してください",
        )
        .refine(
          (d) => d >= startOfDay(new Date()),
          "現在以降の日を入力してください",
        ),
    ),
    deadlineTime: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z
        .string()
        .regex(
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          "時刻の形式が正しくありません",
        )
        .optional(),
    ),
  })
  .superRefine((data, ctx) => {
    const dateStr = format(data.deadlineDate as Date, "yyyy/MM/dd");
    const deadlineUtc = parseJstStringsToUtc(dateStr, data.deadlineTime);

    if (deadlineUtc.getTime() < Date.now()) {
      // 日付が現在よりも前の場合
      if (startOfDay(deadlineUtc) < startOfDay(Date.now())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["deadlineDate"],
          message: "期限は現在以降を指定してください。",
        });
      }
      // 日付と時刻が現在よりも前の場合
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deadlineTime"],
        message: "期限は現在以降を指定してください。",
      });
    }
  });

// Create だけのスキーマに絞る（id/status は不要）
export const CreateTodo = z
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

// 編集画面用
export const UpdateTodo = z
  .object({
    id: z.coerce.string(),
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

export type TodoFormInput = z.infer<typeof todoFormSchema>;
export type TodoFormErrors = Partial<Record<keyof TodoFormInput, string[]>>;

/** マイページ・ユーザー名編集フォーム用 */
export const userFormSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50, "最大50文字です"),
});

export type UserFormInput = z.infer<typeof userFormSchema>;
export type UserFormErrors = Partial<Record<keyof UserFormInput, string[]>>;

// チェックボックスのトグル更新用
export const UpdateTodoStatus = z.object({
  done: z.boolean(),
});

export const UpdateUser = z.object({
  id: z.string(),
  name: z.string().min(1, "名前は必須です").max(50, "最大50文字です"),
});
