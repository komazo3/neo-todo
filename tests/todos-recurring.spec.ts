import { test, expect } from "@playwright/test";
import {
  loginAsUser,
  navigateToEditTodo,
  fillEditTodoForm,
  createTestRecurringTodo,
  deleteTestRecurringGroup,
  deleteTestRecurringGroupByTitle,
  getTodayJstDow,
  dowToLabel,
} from "./helpers";

test.describe("繰り返しTODO - 新規登録（/todos/new）", () => {
  test.describe("UI表示", () => {
    test("繰り返しスイッチを切り替えると繰り返しフィールドが表示される", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      // 初期状態では繰り返しフィールドは非表示
      await expect(page.getByLabel("月")).not.toBeVisible();

      // スイッチをONにする
      await page.getByRole("switch", { name: "繰り返し" }).click();

      // 曜日チェックボックスが表示される
      await expect(page.getByLabel("月")).toBeVisible();
    });

    test("繰り返しスイッチON時は期限日ピッカーが非表示になる", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      // 初期状態では期限日ピッカーが表示されている
      await expect(page.getByRole("group", { name: "*期限日" })).toBeVisible();

      // スイッチをONにする
      await page.getByRole("switch", { name: "繰り返し" }).click();

      // 期限日ピッカーが非表示になる
      await expect(
        page.getByRole("group", { name: "*期限日" }),
      ).not.toBeVisible();
    });

    test("曜日チェックボックスが全7曜日表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await page.getByRole("switch", { name: "繰り返し" }).click();

      for (const label of ["日", "月", "火", "水", "木", "金", "土"]) {
        await expect(page.getByLabel(label)).toBeVisible();
      }
    });

    test("繰り返しスイッチON時も時刻ピッカーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await page.getByRole("switch", { name: "繰り返し" }).click();

      await expect(page.getByRole("group", { name: "時刻" })).toBeVisible();
    });
  });

  test.describe("バリデーション", () => {
    test("曜日未選択で追加するとエラーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await page.getByRole("switch", { name: "繰り返し" }).click();
      await page.getByLabel("*タイトル").fill("テストTODO");
      const prioritySelect = page.getByRole("combobox", { name: "*優先度" });
      await prioritySelect.click();
      await page.getByRole("option", { name: "中" }).click();

      await page.getByRole("button", { name: "追加" }).click();

      await expect(
        page.getByText("少なくとも1つの曜日を選択してください"),
      ).toBeVisible();
    });

    test("タイトル未入力で追加するとエラーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await page.getByRole("switch", { name: "繰り返し" }).click();
      await page.getByLabel(dowToLabel(getTodayJstDow())).click();
      const prioritySelect = page.getByRole("combobox", { name: "*優先度" });
      await prioritySelect.click();
      await page.getByRole("option", { name: "中" }).click();

      await page.getByRole("button", { name: "追加" }).click();

      await expect(page.getByText("タイトルは必須です")).toBeVisible();
    });

    test("優先度未選択で追加するとエラーが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos/new");

      await page.getByRole("switch", { name: "繰り返し" }).click();
      await page.getByLabel("*タイトル").fill("テストTODO");
      await page.getByLabel(dowToLabel(getTodayJstDow())).click();

      await page.getByRole("button", { name: "追加" }).click();

      await expect(page.getByText("優先度を選択してください")).toBeVisible();
    });
  });

  test.describe("登録操作", () => {
    test("有効な入力で繰り返しTODOを作成するとTODO一覧に遷移する", async ({
      page,
    }) => {
      const title = `繰り返し作成テスト ${Date.now()}`;

      try {
        await loginAsUser(page);
        await page.goto("/todos/new");

        await page.getByRole("switch", { name: "繰り返し" }).click();
        await page.getByLabel("*タイトル").fill(title);
        const prioritySelect = page.getByRole("combobox", { name: "*優先度" });
        await prioritySelect.click();
        await page.getByRole("option", { name: "高" }).click();
        await page.getByLabel(dowToLabel(getTodayJstDow())).click();

        await page.getByRole("button", { name: "追加" }).click();

        await page.waitForURL(/\/todos(\?.*)?$/);
      } finally {
        await deleteTestRecurringGroupByTitle(title);
      }
    });

    test("作成した繰り返しTODOが当日の一覧に表示される", async ({ page }) => {
      const title = `繰り返し一覧表示テスト ${Date.now()}`;

      try {
        await loginAsUser(page);
        await page.goto("/todos/new");

        await page.getByRole("switch", { name: "繰り返し" }).click();
        await page.getByLabel("*タイトル").fill(title);
        const prioritySelect = page.getByRole("combobox", { name: "*優先度" });
        await prioritySelect.click();
        await page.getByRole("option", { name: "中" }).click();
        await page.getByLabel(dowToLabel(getTodayJstDow())).click();

        await page.getByRole("button", { name: "追加" }).click();

        await page.waitForURL(/\/todos(\?.*)?$/);
        await expect(page.getByText(title)).toBeVisible();
      } finally {
        await deleteTestRecurringGroupByTitle(title);
      }
    });
  });
});

test.describe("繰り返しTODO - 編集（/todos/[slug]）", () => {
  test.describe("UI表示", () => {
    test("繰り返しTODOの編集ページでは期限日ピッカーが非表示", async ({
      page,
    }) => {
      const recurring = await createTestRecurringTodo({
        title: "期限日非表示テスト",
      });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        await expect(
          page.getByRole("group", { name: "*期限日" }),
        ).not.toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
      }
    });

    test("繰り返し曜日のChipが表示される", async ({ page }) => {
      const recurring = await createTestRecurringTodo({
        title: "曜日Chip表示テスト",
      });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        await expect(
          page.getByText(`${dowToLabel(getTodayJstDow())}曜日`),
        ).toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
      }
    });

    test("編集ページ初期表示ではスコープダイアログが表示されない", async ({
      page,
    }) => {
      const recurring = await createTestRecurringTodo({
        title: "ダイアログ非表示テスト",
      });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        await expect(
          page.getByText("どのTODOを編集しますか？"),
        ).not.toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
      }
    });

    test("編集ボタンを押すとスコープ選択ダイアログが表示される", async ({
      page,
    }) => {
      const recurring = await createTestRecurringTodo({
        title: "ダイアログ表示テスト",
      });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        await page.getByRole("button", { name: "編集" }).click();

        await expect(page.getByText("どのTODOを編集しますか？")).toBeVisible();
        await expect(
          page.getByRole("button", { name: "該当のTODOのみ編集" }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "そのTODO以降のTODOを編集" }),
        ).toBeVisible();
        await expect(
          page.getByRole("button", { name: "すべての繰り返しTODOを編集" }),
        ).toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
      }
    });

    test("スコープダイアログのキャンセルでダイアログが閉じ編集画面に戻る", async ({
      page,
    }) => {
      const recurring = await createTestRecurringTodo({
        title: "キャンセルテスト",
      });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        await page.getByRole("button", { name: "編集" }).click();
        await expect(page.getByText("どのTODOを編集しますか？")).toBeVisible();

        await page.getByRole("button", { name: "キャンセル" }).click();

        await expect(
          page.getByText("どのTODOを編集しますか？"),
        ).not.toBeVisible();
        // 編集フォームは引き続き表示されている
        await expect(page.getByLabel("*タイトル")).toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
      }
    });
  });

  test.describe("バリデーション", () => {
    test("タイトル未入力で編集ボタンを押してもスコープダイアログが表示されない", async ({
      page,
    }) => {
      const recurring = await createTestRecurringTodo({
        title: "バリデーションテスト",
      });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        const titleInput = page.getByLabel("*タイトル");
        await titleInput.clear();
        await page.getByRole("button", { name: "編集" }).click();

        // エラーが表示される
        await expect(page.getByText("タイトルは必須です")).toBeVisible();
        // ダイアログは表示されない
        await expect(
          page.getByText("どのTODOを編集しますか？"),
        ).not.toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
      }
    });
  });

  test.describe("編集操作", () => {
    test("「該当のTODOのみ編集」でタイトルを変更できる", async ({ page }) => {
      const recurring = await createTestRecurringTodo({
        title: "該当のみ編集前",
      });
      const newTitle = `該当のみ編集後 ${Date.now()}`;
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        await fillEditTodoForm(page, { title: newTitle });
        await page.getByRole("button", { name: "編集" }).click();

        await page.getByRole("button", { name: "該当のTODOのみ編集" }).click();

        await page.waitForURL(/\/todos(\?.*)?$/);
        await expect(page.getByText(newTitle)).toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
        await deleteTestRecurringGroupByTitle(newTitle);
      }
    });

    test("「すべての繰り返しTODOを編集」でタイトルを変更できる", async ({
      page,
    }) => {
      const recurring = await createTestRecurringTodo({ title: "全体編集前" });
      const newTitle = `全体編集後 ${Date.now()}`;
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        await fillEditTodoForm(page, { title: newTitle });
        await page.getByRole("button", { name: "編集" }).click();

        await page
          .getByRole("button", { name: "すべての繰り返しTODOを編集" })
          .click();

        await page.waitForURL(/\/todos(\?.*)?$/);
        await expect(page.getByText(newTitle)).toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
        await deleteTestRecurringGroupByTitle(newTitle);
      }
    });

    test("「そのTODO以降のTODOを編集」でタイトルを変更できる", async ({
      page,
    }) => {
      const recurring = await createTestRecurringTodo({ title: "以降編集前" });
      const newTitle = `以降編集後 ${Date.now()}`;
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        await fillEditTodoForm(page, { title: newTitle });
        await page.getByRole("button", { name: "編集" }).click();

        await page
          .getByRole("button", { name: "そのTODO以降のTODOを編集" })
          .click();

        await page.waitForURL(/\/todos(\?.*)?$/);
        await expect(page.getByText(newTitle)).toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
        await deleteTestRecurringGroupByTitle(newTitle);
      }
    });

    test("優先度を変更して「該当のTODOのみ編集」で反映される", async ({
      page,
    }) => {
      const recurring = await createTestRecurringTodo({
        title: "優先度変更テスト",
        priority: "LOW",
      });
      try {
        await loginAsUser(page);
        await navigateToEditTodo(page, recurring.todoId);

        await fillEditTodoForm(page, { priority: "高" });
        await page.getByRole("button", { name: "編集" }).click();

        await page.getByRole("button", { name: "該当のTODOのみ編集" }).click();

        await page.waitForURL(/\/todos(\?.*)?$/);
        await expect(page.getByText("優先度: 高")).toBeVisible();
      } finally {
        await deleteTestRecurringGroup(recurring.groupId);
      }
    });
  });
});
