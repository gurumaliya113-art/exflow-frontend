import { cn } from '@/lib/utils';

/**
 * Badge - small token-styled label used for project tags, category labels,
 * reading time, and status chips.
 *
 * Accent discipline (Requirement 1.3): `accent="tech"` (cyan) is the default.
 * `brand` paints `--color-brand` and is reserved for conversion emphasis and
 * for at most one selected-state indicator per control group. `techViolet` is
 * deliberately not offered here because it is a motif/icon (non-text) role
 * only - see `surfaces` in `lib/tokens.js`.
 *
 * Requirements: 1.1, 1.2, 1.3, 5.2, 5.4, 6.6
 */

/** Accent -> text / border / tint utilities, all token-backed. */
const ACCENTS = {
  tech: {
    text: 'text-tech-cyan',
    border: 'border-tech-cyan/40',
    tint: 'bg-tech-cyan/10',
    solid: 'bg-tech-cyan text-canvas border-tech-cyan',
  },
  blue: {
    text: 'text-tech-blue',
    border: 'border-tech-blue/40',
    tint: 'bg-tech-blue/10',
    solid: 'bg-tech-blue text-canvas border-tech-blue',
  },
  brand: {
    text: 'text-brand',
    border: 'border-brand/40',
    tint: 'bg-brand/10',
    solid: 'bg-brand text-brand-ink border-brand',
  },
  success: {
    text: 'text-success',
    border: 'border-success/40',
    tint: 'bg-success/10',
    solid: 'bg-success text-canvas border-success',
  },
  warning: {
    text: 'text-warning',
    border: 'border-warning/40',
    tint: 'bg-warning/10',
    solid: 'bg-warning text-canvas border-warning',
  },
  danger: {
    text: 'text-danger',
    border: 'border-danger/40',
    tint: 'bg-danger/10',
    solid: 'bg-danger text-canvas border-danger',
  },
};

export const BADGE_ACCENTS = Object.keys(ACCENTS);
export const BADGE_TONES = ['soft', 'outline', 'muted', 'solid'];

/**
 * The meta type role is applied with an explicit `length:` modifier so the
 * `cn()` tailwind-merge pass classifies it as a font-size utility instead of
 * colliding with the accent text color. The shorthand spelling of that role is
 * indistinguishable from a text-color utility to tailwind-merge, which would
 * silently drop the size.
 */
const BASE =
  'inline-flex items-center gap-1 rounded-pill border px-3 py-1 text-[length:var(--text-meta)] font-medium uppercase tracking-[0.08em] whitespace-nowrap';

function toneClasses(tone, accent) {
  const a = ACCENTS[accent] ?? ACCENTS.tech;
  switch (tone) {
    case 'outline':
      return cn('bg-transparent', a.border, a.text);
    case 'muted':
      // Availability placeholders ("Coming Soon") and other de-emphasised
      // labels: no accent, secondary text on an elevated surface.
      return 'bg-surface-high border-line text-content-muted';
    case 'solid':
      return a.solid;
    case 'soft':
    default:
      return cn(a.tint, a.border, a.text);
  }
}

export default function Badge({
  tone = 'soft',
  accent = 'tech',
  as: Tag = 'span',
  className,
  children,
  ...rest
}) {
  const resolvedAccent = ACCENTS[accent] ? accent : 'tech';
  const resolvedTone = BADGE_TONES.includes(tone) ? tone : 'soft';

  return (
    <Tag
      data-tone={resolvedTone}
      data-accent={resolvedAccent}
      className={cn(BASE, toneClasses(resolvedTone, resolvedAccent), className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
