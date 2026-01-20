"use server";

import { z } from "zod";
// import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PRIORITY, STATUS } from "./placeholder-data";

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

const TodoFormSchema = z.object({
  id: z.int(),
  title: z.string().min(1).max(50),
  content: z.string().min(1).max(500),
  status: z.coerce
    .number()
    .refine((v) => Object.values(STATUS).includes(v as any), {
      message: "ステータスを選択してください",
    }),
  priority: z.coerce
    .number()
    .refine((v) => Object.values(PRIORITY).includes(v as any), {
      message: "優先度を選択してください",
    }),
  deadline: z.coerce.date(),
});

const CreateTodo = TodoFormSchema.omit({ id: true, status: true });
const UpdateTodo = TodoFormSchema.omit({ id: true });

export type FormState = {
  errors: {
    title?: string[];
    content?: string[];
    status?: string[];
    priority?: string[];
    deadline?: string[];
  };
  message: string;
};

export async function createTodo(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Validate form fields using Zod
  const validatedFields = CreateTodo.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    deadline: formData.get("deadline"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Todo.",
    };
  }

  try {
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      errors: {},
      message: "Database Error: Failed to Create Todo.",
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/todos");
  redirect("/todos");
}

// export async function updateInvoice(
//   id: string,
//   prevState: State,
//   formData: FormData,
// ) {
//   const validatedFields = UpdateInvoice.safeParse({
//     customerId: formData.get("customerId"),
//     amount: formData.get("amount"),
//     status: formData.get("status"),
//   });

//   if (!validatedFields.success) {
//     return {
//       errors: validatedFields.error.flatten().fieldErrors,
//       message: "Missing Fields. Failed to Update Invoice.",
//     };
//   }

//   const { customerId, amount, status } = validatedFields.data;
//   const amountInCents = amount * 100;

//   try {
//     await sql`
//       UPDATE invoices
//       SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
//       WHERE id = ${id}
//     `;
//   } catch (error) {
//     return { message: "Database Error: Failed to Update Invoice." };
//   }

//   revalidatePath("/dashboard/invoices");
//   redirect("/dashboard/invoices");
// }

// export async function deleteInvoice(id: string) {
//   await sql`DELETE FROM invoices WHERE id = ${id}`;
//   revalidatePath("/dashboard/invoices");
// }
