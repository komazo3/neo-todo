import { Priority } from "@/generated/prisma/enums";

export const PRIORITY_DDL_ITEMS = [
  { label: "低", value: Priority.LOW },
  { label: "中", value: Priority.MEDIUM },
  { label: "高", value: Priority.HIGH },
];

export const DISPLAYSTATUS = {
  UNTOUCHED: "UNTOUCHED",
  DONE: "DONE",
  ALL: "ALL",
} as const;

export const SORTITEMS = {
  PRIORITY_ASC: "PRIORITY_ASC",
  PRIORITY_DESC: "PRIORITY_DESC",
  DEADLINE_ASC: "DEADLINE_ASC",
  DEADLINE_DESC: "DEADLINE_DESC",
} as const;
