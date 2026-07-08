type KpiCardProps = {
  title: string;
  value: string | number;
  description: string;
};

export function KpiCard({ title, value, description }: KpiCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}