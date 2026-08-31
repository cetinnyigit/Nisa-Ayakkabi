import { Icon } from "@/components/ui/Icon";

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  icon: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col justify-between rounded-lg bg-surface-container-lowest p-6 shadow-ambient">
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <Icon name={icon} className={accent ? "text-xl text-error" : "text-xl text-primary"} />
      </div>
      <div className="mt-4">
        <p className="font-headline-md text-headline-md text-on-surface">{value}</p>
        {hint && (
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{hint}</p>
        )}
      </div>
    </div>
  );
}

export default StatCard;
