-- AlterTable: endDate を削除し、テンプレートフィールドを追加
ALTER TABLE "RecurringGroup" DROP COLUMN IF EXISTS "endDate";

ALTER TABLE "RecurringGroup"
  ADD COLUMN "title"    TEXT NOT NULL DEFAULT '',
  ADD COLUMN "content"  TEXT NOT NULL DEFAULT '',
  ADD COLUMN "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN "timeStr"  TEXT;

-- 既存レコードのテンプレートを、グループ内の最新 Todo から逆算して埋める
UPDATE "RecurringGroup" rg
SET
  "title"    = t.title,
  "content"  = t.content,
  "priority" = t.priority,
  "timeStr"  = CASE
                 WHEN t."isAllDay" = true THEN NULL
                 ELSE TO_CHAR((t.deadline AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Tokyo', 'HH24:MI')
               END
FROM (
  SELECT DISTINCT ON ("recurringGroupId")
    "recurringGroupId", title, content, priority, "isAllDay", deadline
  FROM "Todo"
  WHERE "recurringGroupId" IS NOT NULL
  ORDER BY "recurringGroupId", deadline DESC
) t
WHERE rg.id = t."recurringGroupId";
