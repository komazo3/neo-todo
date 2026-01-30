# Neo TODO

日付ごとにTODOを作成し、完了/未完了を記録できるWebアプリです。  
「その日やることが一目で分かる」ことを重視し、1日単位のTODO管理に最適化しています。

## デモ

- URL: https://neo-todo-psi.vercel.app/login

## 主な機能

- Google OAuth / メールのマジックリンクによるログイン
- 日付ごとのTODO一覧表示（前日/翌日/本日へ移動）
- ステータス（未完了/完了）フィルタ
- 優先度/期限でのソート（昇順/降順）
- TODOの作成/編集/削除
- TODOの完了/未完了切り替え（チェックボックス）
- マイページでプロフィール編集

## 画面とURL

- ログイン: https://neo-todo-psi.vercel.app/login
- TODO一覧: https://neo-todo-psi.vercel.app/todos
- TODO追加: https://neo-todo-psi.vercel.app/todos/new
- TODO編集: https://neo-todo-psi.vercel.app/todos/[id]
- マイページ: https://neo-todo-psi.vercel.app/mypage

## 技術スタック

### Frontend

- Next.js `16.1.3`
- React `19.2.3`
- TypeScript `5.x`

### UI

- Material UI `7.x`
- Tailwind CSS `4.x`

### Auth

- NextAuth.js `v5 (beta)`

### Backend / DB

- PostgreSQL
- Prisma `7.2`

### Infrastructure

- Vercel

## 機能詳細

### ユーザー認証

#### Googleログイン

- GoogleアカウントでOAuth認証を実装
- セッションはDBで管理（Prisma Adapter）

#### メール（マジックリンク）ログイン

- ログイン画面でメールアドレスを入力し、送信されたリンクからログイン

### TODO一覧（/todos）

- デフォルトで当日のTODOを表示
- 「前日」「翌日」で日付移動、「本日」で当日へ戻る
- 表示項目：
  - ステータス（完了/未完了）
  - タイトル
  - 内容
  - 優先度
  - 期限（日付/時刻）

#### ステータスフィルタ

- 「すべて」「未完了」「完了」から選択
- デフォルトは「すべて」

#### ソート

- 「優先度」「期限」で昇順/降順ソート
- 期限ソート時、時刻未入力のTODOは一覧上「当日中」と表示し、末尾に配置
- デフォルトは「期限が近い順」

#### ステータス切り替え

- チェックボックスで完了/未完了を切り替え可能

#### 編集/削除

- 編集ボタン：対応するTODOの編集画面へ遷移
- 削除ボタン：削除確認ダイアログを表示

### TODO作成/編集（/todos/new, /todos/[id]）

#### 入力項目

- タイトル
  - 必須
  - 最大50文字
- 内容
  - 最大500文字
- 優先度
  - 必須
  - 「低」「中」「高」から選択
- 期限日
  - 必須
- 時刻
  - 任意（未入力の場合は「当日中」として扱う）

### マイページ（/mypage）

- 画面上部のアカウントボタンから遷移
- 名前
  - 必須
  - 最大50文字

## ローカル起動（開発用）

```bash
npm install
npm run dev
```
