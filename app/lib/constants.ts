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
};
