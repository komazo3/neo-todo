import { test, expect } from "@playwright/test";
import { addDays, format, subDays } from "date-fns";
import { loginAsUser, fillNewTodoForm, deleteTestTodoByTitle } from "./helpers";

test.describe("TODO新規登録ページ（/todos/new）のテスト", () => {
  test.describe("UI表示", () => {
    test("ページタイトルが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await expect(page).toHaveTitle(/TODOを追加/);
      await expect(
        page.getByRole("heading", { name: "TODOを追加" }),
      ).toBeVisible();
    });

    test("タイトル入力欄が表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await expect(page.getByLabel("*タイトル")).toBeVisible();
    });

    test("内容入力欄が表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await expect(page.getByLabel("内容")).toBeVisible();
    });

    test("優先度セレクトが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await expect(
        page.getByRole("combobox", { name: "*優先度" }),
      ).toBeVisible();
    });

    test("期限日ピッカーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await expect(page.getByRole("group", { name: "*期限日" })).toBeVisible();
    });

    test("時刻ピッカーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await expect(page.getByRole("group", { name: "時刻" })).toBeVisible();
    });

    test("キャンセルボタンが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await expect(
        page.getByRole("link", { name: "キャンセル" }),
      ).toBeVisible();
    });

    test("追加ボタンが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await expect(page.getByRole("button", { name: "追加" })).toBeVisible();
    });

    test("優先度の選択肢が表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      const prioritySelect = page.getByRole("combobox", { name: "*優先度" });
      await prioritySelect.click();

      await expect(page.getByRole("option", { name: "低" })).toBeVisible();
      await expect(page.getByRole("option", { name: "中" })).toBeVisible();
      await expect(page.getByRole("option", { name: "高" })).toBeVisible();
    });
  });

  test.describe("バリデーション", () => {
    test("タイトル未入力で追加するとエラーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await fillNewTodoForm(page, {
        priority: "中",
        deadlineDate: addDays(new Date(), 1),
      });
      await page.getByRole("button", { name: "追加" }).click();

      await expect(page.getByText("タイトルは必須です")).toBeVisible();
    });

    test("優先度未選択で追加するとエラーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await fillNewTodoForm(page, {
        title: "テストTODO",
        deadlineDate: addDays(new Date(), 1),
      });
      await page.getByRole("button", { name: "追加" }).click();

      await expect(page.getByText("優先度を選択してください")).toBeVisible();
    });

    test("期限日未入力で追加するとエラーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await fillNewTodoForm(page, {
        title: "テストTODO",
        priority: "中",
      });
      await page.getByRole("button", { name: "追加" }).click();

      await expect(page.getByText("期限日は必須です")).toBeVisible();
    });

    test("タイトルが50文字を超えると入力できない", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      const longTitle = "あ".repeat(55);
      await page.getByLabel("*タイトル").fill(longTitle);

      const inputValue = await page.getByLabel("*タイトル").inputValue();
      expect(inputValue.length).toBeLessThanOrEqual(50);
    });

    test("過去の日付を入力して追加するとエラーが表示される", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      // MUI DatePicker に昨日の日付をキー入力する（disablePast はカレンダー選択を制限するが入力は通る）
      await fillNewTodoForm(page, {
        title: "テストTODO",
        priority: "中",
        deadlineDate: subDays(new Date(), 1),
      });
      await page.getByRole("button", { name: "追加" }).click();

      // 過去日付のためいずれかのエラーが表示される
      await expect(
        page.getByText(/現在以降の日を入力してください/),
      ).toBeVisible();
      await expect(
        page.getByText(/期限は現在以降を指定してください/),
      ).toBeVisible();
    });

    test("今日の日付に過去の時刻（00:00）を入力して追加するとエラーが表示される", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      // 今日の日付 + 00:00 JST は常に現在より過去になる
      await fillNewTodoForm(page, {
        title: "テストTODO",
        priority: "中",
        deadlineDate: new Date(),
        deadlineTime: "0000",
      });
      await page.getByRole("button", { name: "追加" }).click();

      await expect(
        page.getByText("期限は現在以降を指定してください。"),
      ).toBeVisible();
    });
  });

  test.describe("ナビゲーション", () => {
    test("ログインなしでアクセスするとログインページにリダイレクトされる", async ({
      page,
    }) => {
      await page.goto("/todos/new");

      await expect(page).toHaveURL("/login");
    });

    test("キャンセルボタンをクリックするとTODO一覧に戻る", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await page.getByRole("link", { name: "キャンセル" }).click();

      await expect(page).toHaveURL(/\/todos$/);
    });
  });

  test.describe("登録操作", () => {
    test("必須項目を入力して追加するとTODO一覧に遷移する", async ({ page }) => {
      const title = `新規登録テスト ${Date.now()}`;

      try {
        await loginAsUser(page);
        await page.goto("/todos/new");

        await fillNewTodoForm(page, {
          title,
          priority: "高",
          deadlineDate: addDays(new Date(), 1),
        });
        await page.getByRole("button", { name: "追加" }).click();

        await page.waitForURL(/\/todos(\?.*)?$/);
      } finally {
        await deleteTestTodoByTitle(title);
      }
    });

    test("内容・時刻も含めて登録できる", async ({ page }) => {
      const title = `フル登録テスト ${Date.now()}`;

      try {
        await loginAsUser(page);
        await page.goto("/todos/new");
        const deadlineDate = addDays(new Date(), 2);
        await fillNewTodoForm(page, {
          title,
          content: "テスト用の内容です。",
          priority: "低",
          deadlineDate: deadlineDate,
          deadlineTime: "1500",
        });
        await page.getByRole("button", { name: "追加" }).click();

        // /todos/new ではなく /todos への遷移（リダイレクト完了）を待つ
        await page.waitForURL(/\/todos(\?.*)?$/);
        // 二日後の一覧画面に遷移
        await page.goto(`/todos?date=${format(deadlineDate, "yyyy-MM-dd")}`);
        await expect(page.getByText(title)).toBeVisible();
        await expect(page.getByText("テスト用の内容です。")).toBeVisible();
        await expect(page.getByText("優先度: 低")).toBeVisible();
        await expect(page.getByText("期限: 15:00")).toBeVisible();
      } finally {
        await deleteTestTodoByTitle(title);
      }
    });

    test("登録したTODOがTODO一覧に表示される", async ({ page }) => {
      const title = `一覧表示確認 ${Date.now()}`;

      try {
        await loginAsUser(page);
        await page.goto("/todos/new");

        await fillNewTodoForm(page, {
          title,
          priority: "中",
          deadlineDate: new Date(),
        });
        await page.getByRole("button", { name: "追加" }).click();

        // /todos/new ではなく /todos への遷移（リダイレクト完了）を待つ
        await page.waitForURL(/\/todos(\?.*)?$/);
        await expect(page.getByText(title)).toBeVisible();
      } finally {
        await deleteTestTodoByTitle(title);
      }
    });
  });
});
