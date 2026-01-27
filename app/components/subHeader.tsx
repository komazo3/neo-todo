export default function SubHeader({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-3 mt-15 sm:flex-row mb-6 sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
    </div>
  );
}
