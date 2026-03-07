import { test, expect } from "@playwright/test";
import { addDays, format, subDays } from "date-fns";
import {
  loginAsUser,
  navigateToEditTodo,
  fillEditTodoForm,
  createTestTodo,
  deleteTestTodo,
  deleteTestTodoByTitle,
} from "./helpers";

test.describe("TODO編集ページ（/todos/[slug]）のテスト", () => {
  test.describe("UI表示", () => {
    test("ページタイトルが表示される", async ({ page }) => {
      const todo = await createTestTodo({ title: "UI表示テスト" });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await expect(page).toHaveTitle(/TODOを編集/);
        await expect(
          page.getByRole("heading", { name: "TODOを編集" }),
        ).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("タイトル入力欄が表示され既存値が入力済みである", async ({ page }) => {
      const todo = await createTestTodo({ title: "タイトル確認テスト" });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        const titleInput = page.getByLabel("*タイトル");
        await expect(titleInput).toBeVisible();
        await expect(titleInput).toHaveValue("タイトル確認テスト");
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("内容入力欄が表示され既存値が入力済みである", async ({ page }) => {
      const todo = await createTestTodo({ content: "既存コンテンツ" });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        const contentInput = page.getByLabel("内容");
        await expect(contentInput).toBeVisible();
        await expect(contentInput).toHaveValue("既存コンテンツ");
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("優先度セレクトが表示される", async ({ page }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await expect(
          page.getByRole("combobox", { name: "*優先度" }),
        ).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("期限日ピッカーが表示される", async ({ page }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await expect(
          page.getByRole("group", { name: "*期限日" }),
        ).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("時刻ピッカーが表示される", async ({ page }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await expect(page.getByRole("group", { name: "時刻" })).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("キャンセルボタンが表示される", async ({ page }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await expect(
          page.getByRole("link", { name: "キャンセル" }),
        ).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("編集ボタンが表示される", async ({ page }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await expect(page.getByRole("button", { name: "編集" })).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("優先度の選択肢が表示される", async ({ page }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        const prioritySelect = page.getByRole("combobox", { name: "*優先度" });
        await prioritySelect.click();

        await expect(page.getByRole("option", { name: "低" })).toBeVisible();
        await expect(page.getByRole("option", { name: "中" })).toBeVisible();
        await expect(page.getByRole("option", { name: "高" })).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });
  });

  test.describe("バリデーション", () => {
    test("タイトル未入力で追加するとエラーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await fillEditTodoForm(page, {
        priority: "中",
        deadlineDate: addDays(new Date(), 1),
      });
      await page.getByRole("button", { name: "追加" }).click();

      await expect(page.getByText("タイトルは必須です")).toBeVisible();
    });

    test("優先度未選択で追加するとエラーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await fillEditTodoForm(page, {
        title: "テストTODO",
        deadlineDate: addDays(new Date(), 1),
      });
      await page.getByRole("button", { name: "追加" }).click();

      await expect(page.getByText("優先度を選択してください")).toBeVisible();
    });

    test("期限日未入力で追加するとエラーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await fillEditTodoForm(page, {
        title: "テストTODO",
        priority: "中",
      });
      await page.getByRole("button", { name: "追加" }).click();

      await expect(page.getByText("期限日は必須です")).toBeVisible();
    });

    test("タイトルが50文字を超えると入力できない", async ({ page }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        const longTitle = "あ".repeat(55);
        const titleInput = page.getByLabel("*タイトル");
        await titleInput.clear();
        await titleInput.fill(longTitle);

        const inputValue = await titleInput.inputValue();
        expect(inputValue.length).toBeLessThanOrEqual(50);
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("過去の日付を入力して編集するとエラーが表示される", async ({
      page,
    }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await fillEditTodoForm(page, {
          deadlineDate: subDays(new Date(), 1),
        });
        await page.getByRole("button", { name: "編集" }).click();

        await expect(
          page.getByText(/現在以降の日を入力してください/),
        ).toBeVisible();
        await expect(
          page.getByText(/期限は現在以降を指定してください/),
        ).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("今日の日付に過去の時刻（00:00）を入力して編集するとエラーが表示される", async ({
      page,
    }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await fillEditTodoForm(page, {
          deadlineDate: new Date(),
          deadlineTime: "0000",
        });
        await page.getByRole("button", { name: "編集" }).click();

        await expect(
          page.getByText("期限は現在以降を指定してください。"),
        ).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });
  });

  test.describe("ナビゲーション", () => {
    test("ログインなしでアクセスするとログインページにリダイレクトされる", async ({
      page,
    }) => {
      const todo = await createTestTodo();
      try {
        await page.goto(`/todos/${todo.id}`);
        await expect(page).toHaveURL("/login");
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("存在しないIDでアクセスすると404ページが表示される", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos/non-existent-id-00000000");

      await expect(
        page.getByText(/編集しようとした TODO は見つかりませんでした。/i),
      ).toBeVisible();
    });

    test("キャンセルボタンをクリックするとTODO一覧に戻る", async ({ page }) => {
      const todo = await createTestTodo();
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await page.getByRole("link", { name: "キャンセル" }).click();

        await expect(page).toHaveURL(/\/todos$/);
      } finally {
        await deleteTestTodo(todo.id);
      }
    });
  });

  test.describe("編集操作", () => {
    test("タイトルを変更して編集するとTODO一覧に遷移する", async ({ page }) => {
      const todo = await createTestTodo({ title: "編集前タイトル" });
      const newTitle = `編集後タイトル ${Date.now()}`;
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await fillEditTodoForm(page, { title: newTitle });
        await page.getByRole("button", { name: "編集" }).click();

        await page.waitForURL(/\/todos/);
      } finally {
        await deleteTestTodo(todo.id);
        await deleteTestTodoByTitle(newTitle);
      }
    });

    test("内容・優先度・時刻を変更して編集できる", async ({ page }) => {
      const todo = await createTestTodo({
        title: "フル編集テスト",
        content: "編集前コンテンツ",
        priority: "LOW",
      });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        const deadlineDate = addDays(new Date(), 3);
        await fillEditTodoForm(page, {
          content: "編集後コンテンツ",
          priority: "高",
          deadlineDate,
          deadlineTime: "1400",
        });
        await page.getByRole("button", { name: "編集" }).click();

        await page.waitForURL(/\/todos/);
        await page.goto(`/todos?date=${format(deadlineDate, "yyyy-MM-dd")}`);
        await page.reload();
        await expect(page.getByText("フル編集テスト")).toBeVisible();
        await expect(page.getByText("編集後コンテンツ")).toBeVisible();
        await expect(page.getByText("優先度: 高")).toBeVisible();
        await expect(page.getByText("期限: 14:00")).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });

    test("編集したTODOがTODO一覧に反映される", async ({ page }) => {
      const todo = await createTestTodo({
        title: "一覧反映確認テスト",
        priority: "LOW",
        deadline: new Date(new Date(new Date().setHours(23)).setMinutes(59)),
      });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, todo.id);

        await fillEditTodoForm(page, { priority: "高" });
        await page.getByRole("button", { name: "編集" }).click();

        await page.waitForURL(/\/todos(\?.*)?$/);
        await expect(page.getByText("一覧反映確認テスト")).toBeVisible();
        await expect(page.getByText("優先度: 高")).toBeVisible();
      } finally {
        await deleteTestTodo(todo.id);
      }
    });
  });
});
