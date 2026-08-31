import { cn } from "@/lib/utils";

type IconProps = {
  /** Material Symbols ikon adı, ör. "shopping_bag" */
  name: string;
  className?: string;
  /** İnce stroke varsayılan 200; vurgulu yerlerde 300-400 kullanılabilir */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  filled?: boolean;
};

export function Icon({ name, className, weight = 200, filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined select-none leading-none", className)}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {name}
    </span>
  );
}

export default Icon;
