import { Priority } from "@/generated/prisma/enums";

const PRIORITY_UI: Record<
  Priority,
  { label: string; className: string; dotClassName: string }
> = {
  LOW: {
    label: "優先度: 低",
    className: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
    dotClassName: "bg-slate-400",
  },
  MEDIUM: {
    label: "優先度: 中",
    className: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    dotClassName: "bg-amber-500",
  },
  HIGH: {
    label: "優先度: 高",
    className: "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200",
    dotClassName: "bg-rose-500",
  },
};

export default function PriorityChip({ priority }: { priority: Priority }) {
  const ui = PRIORITY_UI[priority];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        ui.className,
      ].join(" ")}
    >
      <span
        className={["h-1.5 w-1.5 rounded-full", ui.dotClassName].join(" ")}
      />
      {ui.label}
    </span>
  );
}
