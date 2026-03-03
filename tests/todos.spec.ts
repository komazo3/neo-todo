import { test, expect } from "@playwright/test";
import { loginAsUser, TEST_USER } from "./helpers";
import { addDays, format, subDays } from "date-fns";

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
});
