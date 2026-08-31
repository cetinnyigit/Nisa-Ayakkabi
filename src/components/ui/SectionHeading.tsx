import Link from "next/link";
import { Icon } from "./Icon";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  /** Sağdaki "Tümünü Gör" bağlantısı */
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "Tümünü Gör",
}: SectionHeadingProps) {
  return (
    <div className="mb-stack-md flex items-end justify-between gap-gutter">
      <div>
        <h2 className="mb-2 font-headline-md text-headline-md text-on-surface">{title}</h2>
        {subtitle && (
          <p className="font-body-md text-body-md text-on-surface-variant">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden items-center gap-2 font-label-caps text-label-caps uppercase text-tertiary transition-colors duration-300 hover:text-primary md:inline-flex"
        >
          {linkLabel}
          <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      )}
    </div>
  );
}

export default SectionHeading;
