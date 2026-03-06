import { test, expect } from "@playwright/test";
import { loginAsUser, createTestTodo, deleteTestTodo } from "./helpers";
import { addDays, addHours, format, subDays } from "date-fns";

test.describe("TODO一覧ページ（/todos）のテスト", () => {
  test("ログインなしでアクセスするとログインページにリダイレクトされる", async ({
    page,
  }) => {
    // TODO一覧ページに直接アクセス
    await page.goto("/todos");

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL("/login");
  });

  test("ログイン後にTODO一覧ページが表示される", async ({ page }) => {
    // テストユーザーでログイン
    await loginAsUser(page);

    // TODO一覧ページが表示されている
    await expect(page).toHaveTitle(/TODO一覧/);
    await expect(page).toHaveURL(/\/todos/);

    // ページのタイトルが表示されている
    const pageTitle = page.getByRole("heading", { name: "TODO一覧" });
    await expect(pageTitle).toBeVisible();
  });

  test("ステータスフィルタが表示されている", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // ステータスフィルタが表示されている
    const statusFilter = page.getByRole("combobox", {
      name: "ステータス すべて",
    });
    await expect(statusFilter).toBeVisible();
  });

  test("ステータスフィルタの選択肢が表示されている", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // フィルタをクリック
    const statusFilter = page.getByRole("combobox", {
      name: "ステータス すべて",
    });
    await statusFilter.click();

    // 選択肢が表示されている
    const allOption = page.getByRole("option", { name: "すべて" });
    const untouchedOption = page.getByRole("option", {
      name: "未完了",
      exact: true,
    });
    const doneOption = page.getByRole("option", { name: "完了", exact: true });

    await expect(allOption).toBeVisible();
    await expect(untouchedOption).toBeVisible();
    await expect(doneOption).toBeVisible();
  });

  test("並び替えフィルタが表示されている", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 並び替えフィルタが表示されている
    const sortFilter = page.getByRole("combobox", {
      name: "並び替え 期限が近い順",
    });
    await expect(sortFilter).toBeVisible();
  });

  test("並び替えフィルタの選択肢が表示されている", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // フィルタをクリック
    const sortFilter = page.getByRole("combobox", {
      name: "並び替え 期限が近い順",
    });
    await sortFilter.click();

    // 選択肢が表示されている
    const deadlineAsc = page.getByRole("option", { name: "期限が近い順" });
    const deadlineDesc = page.getByRole("option", { name: "期限が遠い順" });
    const priorityAsc = page.getByRole("option", { name: "優先度が低い順" });
    const priorityDesc = page.getByRole("option", { name: "優先度が高い順" });

    await expect(deadlineAsc).toBeVisible();
    await expect(deadlineDesc).toBeVisible();
    await expect(priorityAsc).toBeVisible();
    await expect(priorityDesc).toBeVisible();
  });

  test("TODO追加ボタンが表示されている", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // TODO追加ボタンが表示されている
    const addButton = page.getByRole("button", { name: /TODOを追加/ });
    await expect(addButton).toBeVisible();
  });

  test("TODO追加ボタンをクリックするとTODO作成ページに遷移する", async ({
    page,
  }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // TODO追加ボタンをクリック
    const addButton = page.getByRole("button", { name: /TODOを追加/ });
    await addButton.click();

    // TODO作成ページに遷移
    await expect(page).toHaveURL(/\/todos\/new/);
  });

  test("日付セレクタが表示されている", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 日付表示ボタンが表示されている
    const dateDisplay = page
      .locator("button")
      .filter({ hasText: /\d{4}\/\d{2}\/\d{2}/ });
    await expect(dateDisplay.first()).toBeVisible();

    // 前日ボタンが表示されている
    const prevButton = page.getByRole("button", { name: /← 前日/ });
    await expect(prevButton).toBeVisible();

    // 翌日ボタンが表示されている
    const nextButton = page.getByRole("button", { name: /翌日 →/ });
    await expect(nextButton).toBeVisible();
  });

  test("当日が表示されているか", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 日付表示ボタンが表示されている
    const dateDisplay = page
      .locator("button")
      .filter({ hasText: /\d{4}\/\d{2}\/\d{2}/ });
    await expect(dateDisplay.first()).toBeVisible();

    // 翌日ボタンが表示されている
    await expect(dateDisplay.first()).toHaveText(
      format(new Date(), "yyyy/MM/dd"),
    );
  });

  test("前日ボタンをクリックすると前の日付に変更される", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 現在の日付を取得
    const dateDisplay = page
      .locator("button")
      .filter({ hasText: /\d{4}\/\d{2}\/\d{2}/ });
    const currentDateText = await dateDisplay.first().textContent();

    // 前日ボタンをクリック
    const prevButton = page.getByRole("button", { name: /← 前日/ });
    await prevButton.click();

    // URLが変更されている
    await page.waitForURL(/date=/);

    // 日付が変更されている
    const newDateText = await dateDisplay.first().textContent();
    expect(newDateText).not.toBe(currentDateText);
    // 昨日になっているか
    const yesterday = subDays(new Date(), 1);
    expect(newDateText).toBe(format(yesterday, "yyyy/MM/dd"));
    await expect(page).toHaveURL(
      `/todos?date=${format(yesterday, "yyyy-MM-dd")}`,
    );
  });

  test("翌日ボタンをクリックすると次の日付に変更される", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 現在の日付を取得
    const dateDisplay = page
      .locator("button")
      .filter({ hasText: /\d{4}\/\d{2}\/\d{2}/ });
    const currentDateText = await dateDisplay.first().textContent();

    // 翌日ボタンをクリック
    const nextButton = page.getByRole("button", { name: /翌日 →/ });
    await nextButton.click();

    // URLが変更されている
    await page.waitForURL(/date=/);

    // 日付が変更されている
    const newDateText = await dateDisplay.first().textContent();
    expect(newDateText).not.toBe(currentDateText);
    // 翌日になっているか
    const tommorow = addDays(new Date(), 1);
    expect(newDateText).toBe(format(tommorow, "yyyy/MM/dd"));
    await expect(page).toHaveURL(
      `/todos?date=${format(tommorow, "yyyy-MM-dd")}`,
    );
  });

  test("TODOがない場合のメッセージが表示される", async ({ page }) => {
    await loginAsUser(page);

    // TODOが存在しない日付に移動
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 100);
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, "0");
    const day = String(futureDate.getDate()).padStart(2, "0");

    await page.goto(`/todos?date=${year}-${month}-${day}`);

    // メッセージが表示されている
    const noTodosMessage = page.getByText("該当するTODOがありません。");
    await expect(noTodosMessage).toBeVisible();
  });

  test("ステータスフィルタで未完了のみをフィルタできる", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // フィルタがデフォルトで「すべて」になっている
    const statusFilter = page.getByRole("combobox", {
      name: "ステータス",
    });
    await expect(statusFilter).toHaveValue(/すべて|ALL/);

    // 「未完了」を選択
    await statusFilter.click();
    const untouchedOption = page.getByRole("option", { name: "未完了" });
    await untouchedOption.click();

    // フィルタが「未完了」に変更されている
    await expect(statusFilter).toHaveValue(/未完了|UNTOUCHED/);
  });

  test("ステータスフィルタで完了のみをフィルタできる", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 「完了」を選択
    const statusFilter = page.getByRole("combobox", {
      name: "ステータス",
    });
    await statusFilter.click();
    const doneOption = page.getByRole("option", { name: "完了", exact: true });
    await doneOption.click();

    // フィルタが「完了」に変更されている
    await expect(statusFilter).toHaveValue(/完了|DONE/);
  });

  test("並び替えを「期限が近い順」に変更できる", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 並び替えフィルタをクリック
    const sortFilter = page.getByRole("combobox", { name: "並び替え" });
    await sortFilter.click();

    // 「期限が近い順」を選択
    const deadlineAsc = page.getByRole("option", { name: "期限が近い順" });
    await deadlineAsc.click();

    // フィルタが変更されている
    await expect(sortFilter).toHaveValue(/期限が近い順|DEADLINE_ASC/);
  });

  test("並び替えを「期限が遠い順」に変更できる", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 並び替えフィルタをクリック
    const sortFilter = page.getByRole("combobox", { name: "並び替え" });
    await sortFilter.click();

    // 「期限が遠い順」を選択
    const deadlineDesc = page.getByRole("option", { name: "期限が遠い順" });
    await deadlineDesc.click();

    // フィルタが変更されている
    await expect(sortFilter).toHaveValue(/期限が遠い順|DEADLINE_DESC/);
  });

  test("並び替えを「優先度が高い順」に変更できる", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 並び替えフィルタをクリック
    const sortFilter = page.getByRole("combobox", { name: "並び替え" });
    await sortFilter.click();

    // 「優先度が高い順」を選択
    const priorityDesc = page.getByRole("option", { name: "優先度が高い順" });
    await priorityDesc.click();

    // フィルタが変更されている
    await expect(sortFilter).toHaveValue(/優先度が高い順|PRIORITY_DESC/);
  });

  test("並び替えを「優先度が低い順」に変更できる", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 並び替えフィルタをクリック
    const sortFilter = page.getByRole("combobox", { name: "並び替え" });
    await sortFilter.click();

    // 「優先度が低い順」を選択
    const priorityAsc = page.getByRole("option", { name: "優先度が低い順" });
    await priorityAsc.click();

    // フィルタが変更されている
    await expect(sortFilter).toHaveValue(/優先度が低い順|PRIORITY_ASC/);
  });

  test("date クエリパラメータで特定の日付のTODOが表示される", async ({
    page,
  }) => {
    await loginAsUser(page);

    // 特定の日付を指定してアクセス
    const targetDate = new Date(2025, 0, 15); // 2025年1月15日
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");

    await page.goto(`/todos?date=${year}-${month}-${day}`);

    // ページが読み込まれている
    await expect(page).toHaveURL(`/todos?date=${year}-${month}-${day}`);

    // 日付表示に指定した日付が表示されている
    const dateDisplay = page
      .locator("button")
      .filter({ hasText: /\d{4}\/\d{2}\/\d{2}/ });
    const displayedDate = await dateDisplay.first().textContent();
    expect(displayedDate).toContain(`${year}/${month}/${day}`);
  });

  test("本日ボタンが表示されている", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    const todayButton = page.getByRole("button", { name: "本日" });
    await expect(todayButton).toBeVisible();
  });

  test("本日ボタンをクリックすると今日の日付に戻る", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/todos");

    // 前日に移動
    const prevButton = page.getByRole("button", { name: /← 前日/ });
    await prevButton.click();
    await page.waitForURL(/date=/);

    // 本日ボタンをクリック
    const todayButton = page.getByRole("button", { name: "本日" });
    await todayButton.click();
    await page.waitForURL(/date=/);

    // 今日の日付が表示されている
    const dateDisplay = page
      .locator("button")
      .filter({ hasText: /\d{4}\/\d{2}\/\d{2}/ });
    await expect(dateDisplay.first()).toHaveText(
      format(new Date(), "yyyy/MM/dd"),
    );
  });

  test.describe.serial("TODOアイテムの表示と操作", () => {
    let todoId: string;
    let todoTitle: string;

    test.beforeEach(async () => {
      const t = await createTestTodo({
        title: `テストTODO ${Date.now()}`,
        priority: "HIGH",
      });
      todoId = t.id;
      todoTitle = t.title;
    });

    test.afterEach(async () => {
      await deleteTestTodo(todoId);
    });

    test("TODOアイテムが一覧に表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      await expect(page.getByText(todoTitle)).toBeVisible();
    });

    test("TODOアイテムに優先度チップが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      // HIGH優先度のチップが表示されている
      const todoItem = page.locator("li").filter({ hasText: todoTitle });
      await expect(todoItem.getByText("優先度: 高")).toBeVisible();
    });

    test("TODOアイテムに期限が表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      const todoItem = page.locator("li").filter({ hasText: todoTitle });
      await expect(todoItem.getByText(/期限:/)).toBeVisible();
    });

    test("TODOアイテムに編集ボタンが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      const todoItem = page.locator("li").filter({ hasText: todoTitle });
      await expect(todoItem.getByRole("link", { name: "編集" })).toBeVisible();
    });

    test("TODOアイテムに削除ボタンが表示される", async ({ page }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      const todoItem = page.locator("li").filter({ hasText: todoTitle });
      await expect(
        todoItem.getByRole("button", { name: "削除" }),
      ).toBeVisible();
    });

    test("チェックボックスをクリックするとTODOが完了になる", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      const todoItem = page.locator("li").filter({ hasText: todoTitle });
      const checkbox = todoItem.getByRole("checkbox");
      await expect(checkbox).not.toBeChecked();

      await checkbox.click();

      await expect(checkbox).toBeChecked();
    });

    test("完了済みTODOのチェックボックスをクリックすると未完了になる", async ({
      page,
    }) => {
      const doneTitle = `完了済みTODO ${Date.now()}`;
      const { id: doneId } = await createTestTodo({
        title: doneTitle,
        status: "DONE",
      });

      try {
        await loginAsUser(page);
        await page.goto("/todos");

        const todoItem = page.locator("li").filter({ hasText: doneTitle });
        const checkbox = todoItem.getByRole("checkbox");
        await expect(checkbox).toBeChecked();

        await checkbox.click();

        await expect(checkbox).not.toBeChecked();
      } finally {
        await deleteTestTodo(doneId);
      }
    });

    test("編集ボタンをクリックするとTODO編集ページに遷移する", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      const todoItem = page.locator("li").filter({ hasText: todoTitle });
      await todoItem.getByRole("button", { name: "編集" }).click();

      await expect(page).toHaveURL(new RegExp(`/todos/${todoId}`));
    });

    test("削除ボタンをクリックすると確認ダイアログが表示される", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      const todoItem = page.locator("li").filter({ hasText: todoTitle });
      await todoItem.getByRole("button", { name: "削除" }).click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByText(`${todoTitle}を削除しますか？`),
      ).toBeVisible();
    });

    test("削除ダイアログのキャンセルをクリックするとダイアログが閉じる", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      const todoItem = page.locator("li").filter({ hasText: todoTitle });
      await todoItem.getByRole("button", { name: "削除" }).click();

      await page.getByRole("button", { name: "キャンセル" }).click();

      await expect(page.getByRole("dialog")).not.toBeVisible();
      // TODOは削除されていない
      await expect(page.getByText(todoTitle)).toBeVisible();
    });

    test("削除ダイアログのOKをクリックするとTODOが削除される", async ({
      page,
    }) => {
      await loginAsUser(page);
      await page.goto("/todos");

      const todoItem = page.locator("li").filter({ hasText: todoTitle });
      await todoItem.getByRole("button", { name: "削除" }).click();

      await page.getByRole("button", { name: "OK" }).click();

      // ダイアログが閉じるまで待機（サーバーアクション完了の確認）
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // ページをリロードして最新のTODO一覧を取得し、削除されていることを確認
      await page.reload();
      await expect(
        page.locator("li").filter({ hasText: todoTitle }),
      ).not.toBeVisible();
    });
  });

  test.describe("並び替えによる表示順の確認", () => {
    test("「期限が近い順」で期限が早いTODOが先に表示される", async ({
      page,
    }) => {
      const ts = Date.now();
      const nearDeadline = addHours(new Date(), 1);
      const farDeadline = addHours(new Date(), 2);

      const near = await createTestTodo({
        title: `期限近いTODO ${ts}`,
        deadline: nearDeadline,
      });
      const far = await createTestTodo({
        title: `期限遠いTODO ${ts}`,
        deadline: farDeadline,
      });

      try {
        await loginAsUser(page);
        await page.goto("/todos");

        const sortFilter = page.getByRole("combobox", { name: "並び替え" });
        await sortFilter.click();
        await page.getByRole("option", { name: "期限が近い順" }).click();

        const items = page.locator("li");
        const texts = await items.allTextContents();
        const nearIdx = texts.findIndex((t) => t.includes(near.title));
        const farIdx = texts.findIndex((t) => t.includes(far.title));

        expect(nearIdx).toBeGreaterThanOrEqual(0);
        expect(farIdx).toBeGreaterThanOrEqual(0);
        expect(nearIdx).toBeLessThan(farIdx);
      } finally {
        await deleteTestTodo(near.id);
        await deleteTestTodo(far.id);
      }
    });

    test("「期限が遠い順」で期限が遅いTODOが先に表示される", async ({
      page,
    }) => {
      const ts = Date.now();
      const nearDeadline = addHours(new Date(), 1);
      const farDeadline = addHours(new Date(), 2);

      const near = await createTestTodo({
        title: `期限近いTODO ${ts}`,
        deadline: nearDeadline,
      });
      const far = await createTestTodo({
        title: `期限遠いTODO ${ts}`,
        deadline: farDeadline,
      });

      try {
        await loginAsUser(page);
        await page.goto("/todos");

        const sortFilter = page.getByRole("combobox", { name: "並び替え" });
        await sortFilter.click();
        await page.getByRole("option", { name: "期限が遠い順" }).click();

        const items = page.locator("li");
        const texts = await items.allTextContents();
        const nearIdx = texts.findIndex((t) => t.includes(near.title));
        const farIdx = texts.findIndex((t) => t.includes(far.title));

        expect(nearIdx).toBeGreaterThanOrEqual(0);
        expect(farIdx).toBeGreaterThanOrEqual(0);
        expect(farIdx).toBeLessThan(nearIdx);
      } finally {
        await deleteTestTodo(near.id);
        await deleteTestTodo(far.id);
      }
    });

    test("「優先度が高い順」でHIGHのTODOがLOWより先に表示される", async ({
      page,
    }) => {
      const ts = Date.now();
      const high = await createTestTodo({
        title: `HIGH優先度TODO ${ts}`,
        priority: "HIGH",
      });
      const low = await createTestTodo({
        title: `LOW優先度TODO ${ts}`,
        priority: "LOW",
      });

      try {
        await loginAsUser(page);
        await page.goto("/todos");

        const sortFilter = page.getByRole("combobox", { name: "並び替え" });
        await sortFilter.click();
        await page.getByRole("option", { name: "優先度が高い順" }).click();

        const items = page.locator("li");
        const texts = await items.allTextContents();
        const highIdx = texts.findIndex((t) => t.includes(high.title));
        const lowIdx = texts.findIndex((t) => t.includes(low.title));

        expect(highIdx).toBeGreaterThanOrEqual(0);
        expect(lowIdx).toBeGreaterThanOrEqual(0);
        expect(highIdx).toBeLessThan(lowIdx);
      } finally {
        await deleteTestTodo(high.id);
        await deleteTestTodo(low.id);
      }
    });

    test("「優先度が低い順」でLOWのTODOがHIGHより先に表示される", async ({
      page,
    }) => {
      const ts = Date.now();
      const high = await createTestTodo({
        title: `HIGH優先度TODO ${ts}`,
        priority: "HIGH",
      });
      const low = await createTestTodo({
        title: `LOW優先度TODO ${ts}`,
        priority: "LOW",
      });

      try {
        await loginAsUser(page);
        await page.goto("/todos");

        const sortFilter = page.getByRole("combobox", { name: "並び替え" });
        await sortFilter.click();
        await page.getByRole("option", { name: "優先度が低い順" }).click();

        const items = page.locator("li");
        const texts = await items.allTextContents();
        const highIdx = texts.findIndex((t) => t.includes(high.title));
        const lowIdx = texts.findIndex((t) => t.includes(low.title));

        expect(highIdx).toBeGreaterThanOrEqual(0);
        expect(lowIdx).toBeGreaterThanOrEqual(0);
        expect(lowIdx).toBeLessThan(highIdx);
      } finally {
        await deleteTestTodo(high.id);
        await deleteTestTodo(low.id);
      }
    });
  });

  test.describe("ステータスフィルタによる絞り込み確認", () => {
    test("「完了」フィルタで完了済みTODOが表示され未完了TODOが非表示になる", async ({
      page,
    }) => {
      const ts = Date.now();
      const undone = await createTestTodo({
        title: `未完了TODO ${ts}`,
        status: "UNTOUCHED",
      });
      const done = await createTestTodo({
        title: `完了TODO ${ts}`,
        status: "DONE",
      });

      try {
        await loginAsUser(page);
        await page.goto("/todos");

        const statusFilter = page.getByRole("combobox", { name: "ステータス" });
        await statusFilter.click();
        await page.getByRole("option", { name: "完了", exact: true }).click();
        await expect(statusFilter).toHaveValue(/完了|DONE/);

        await expect(page.getByText(done.title)).toBeVisible();
        await expect(page.getByText(undone.title)).not.toBeVisible();
      } finally {
        await deleteTestTodo(undone.id);
        await deleteTestTodo(done.id);
      }
    });

    test("「未完了」フィルタで未完了TODOが表示され完了済みTODOが非表示になる", async ({
      page,
    }) => {
      const ts = Date.now();
      const undone = await createTestTodo({
        title: `未完了TODO ${ts}`,
        status: "UNTOUCHED",
      });
      const done = await createTestTodo({
        title: `完了TODO ${ts}`,
        status: "DONE",
      });

      try {
        await loginAsUser(page);
        await page.goto("/todos");

        const statusFilter = page.getByRole("combobox", { name: "ステータス" });
        await statusFilter.click();
        await page.getByRole("option", { name: "未完了", exact: true }).click();
        await expect(statusFilter).toHaveValue(/未完了|UNTOUCHED/);

        await expect(page.getByText(undone.title)).toBeVisible();
        await expect(
          page.getByText(done.title, { exact: true }),
        ).not.toBeVisible();
      } finally {
        await deleteTestTodo(undone.id);
        await deleteTestTodo(done.id);
      }
    });

    test("「すべて」に切り替えると完了・未完了両方のTODOが表示される", async ({
      page,
    }) => {
      const ts = Date.now();
      const undone = await createTestTodo({
        title: `未完了TODO ${ts}`,
        status: "UNTOUCHED",
      });
      const done = await createTestTodo({
        title: `完了TODO ${ts}`,
        status: "DONE",
      });

      try {
        await loginAsUser(page);
        await page.goto("/todos");

        // 一度「完了」に絞り込んでから「すべて」に戻す
        const statusFilter = page.getByRole("combobox", { name: "ステータス" });
        await statusFilter.click();
        await page.getByRole("option", { name: "完了", exact: true }).click();
        await expect(statusFilter).toHaveValue(/完了|DONE/);

        await statusFilter.click();
        await page.getByRole("option", { name: "すべて" }).click();
        await expect(statusFilter).toHaveValue(/すべて|ALL/);

        await expect(page.getByText(undone.title)).toBeVisible();
        await expect(page.getByText(done.title, { exact: true })).toBeVisible();
      } finally {
        await deleteTestTodo(undone.id);
        await deleteTestTodo(done.id);
      }
    });
  });
});
