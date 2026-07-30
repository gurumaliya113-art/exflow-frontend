import { cn } from '@/lib/utils';

/**
 * StatBlock - a single business metric.
 *
 * The value renders at `--text-display`, the label at `--text-label`, and the
 * optional suffix (`+`, `%`, `x`) is non-conversion emphasis so it uses a
 * cyan/blue accent rather than the Brand_Accent (Requirement 1.3).
 *
 * The value and suffix are wrapped in a single element so assistive
 * technologies read "150+" as one string rather than two fragments.
 *
 * Requirements: 1.1, 1.3, 4.3
 */

const ACCENTS = {
  tech: 'text-tech-cyan',
  blue: 'text-tech-blue',
  content: 'text-content',
  brand: 'text-brand',
};

export default function StatBlock({
  value,
  label,
  suffix,
  accent = 'tech',
  align = 'start',
  as: Tag = 'div',
  className,
  ...rest
}) {
  const suffixClass = ACCENTS[accent] ?? ACCENTS.tech;

  return (
    <Tag
      className={cn(
        'flex flex-col gap-1',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
      {...rest}
    >
      <p
        data-slot="stat-value"
        className="text-[length:var(--text-display)] font-extrabold leading-none tracking-[-0.02em] text-content"
      >
        {value}
        {suffix ? <span className={suffixClass}>{suffix}</span> : null}
      </p>
      <p
        data-slot="stat-label"
        className="text-[length:var(--text-label)] font-semibold tracking-[0.01em] text-content-muted"
      >
        {label}
      </p>
    </Tag>
  );
}
