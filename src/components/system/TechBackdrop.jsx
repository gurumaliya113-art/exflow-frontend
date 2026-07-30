import { cn } from '@/lib/utils';

/**
 * TechBackdrop - purely decorative technical motif layer (grid, mesh, or
 * scanline) painted behind a Section's content.
 *
 * Guarantees, all structural rather than conventional:
 * - `aria-hidden="true"` and no focusable content, so it is never exposed to
 *   assistive technologies (Requirement 10.x, 12.4).
 * - `pointer-events-none`, so it can never intercept a click or hover meant
 *   for a control (Requirement 1.7).
 * - `absolute inset-0` with a negative stacking order, so it sits behind
 *   content and cannot overlap text (Requirement 1.7).
 * - Opacity is clamped to `MAX_BACKDROP_OPACITY`, which keeps every
 *   motif-adjacent text/background pairing at its required ratio (4.5:1 for
 *   body text, 3:1 for large text and control boundaries) - Requirements 1.7
 *   and 12.6.
 *
 * Motif colors come from the token layer only (`--color-line-strong`,
 * `--color-tech-*`); `techViolet` is permitted here because a backdrop is
 * non-text usage.
 */

/**
 * Opacity ceiling for any decorative motif. Derived from Requirement 12.6: a
 * motif drawn at this alpha over `--color-canvas` / `--color-surface` shifts
 * the effective background luminance too little to drop `--color-content`
 * (4.5:1) or a 3:1 boundary below its minimum.
 */
export const MAX_BACKDROP_OPACITY = 0.14;

/** Named intensities, all at or below the ceiling. */
export const BACKDROP_INTENSITIES = {
  subtle: 0.05,
  base: 0.09,
  strong: 0.14,
};

export const BACKDROP_VARIANTS = ['grid', 'mesh', 'scanline'];

/**
 * Resolve an intensity (name or number) to a capped opacity value.
 *
 * @param {keyof typeof BACKDROP_INTENSITIES | number | undefined} intensity
 * @returns {number} opacity in [0, MAX_BACKDROP_OPACITY]
 */
export function resolveOpacity(intensity = 'base') {
  const raw =
    typeof intensity === 'number'
      ? intensity
      : BACKDROP_INTENSITIES[intensity] ?? BACKDROP_INTENSITIES.base;
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(raw, MAX_BACKDROP_OPACITY);
}

const VARIANT_STYLES = {
  grid: {
    backgroundImage: [
      'linear-gradient(to right, var(--color-line-strong) var(--border-1), transparent var(--border-1))',
      'linear-gradient(to bottom, var(--color-line-strong) var(--border-1), transparent var(--border-1))',
    ].join(', '),
    backgroundSize: 'var(--space-7) var(--space-7)',
  },
  mesh: {
    backgroundImage: [
      'radial-gradient(60% 60% at 20% 10%, var(--color-tech-cyan), transparent 70%)',
      'radial-gradient(50% 50% at 80% 0%, var(--color-tech-blue), transparent 70%)',
      'radial-gradient(60% 60% at 60% 90%, var(--color-tech-violet), transparent 70%)',
    ].join(', '),
  },
  scanline: {
    backgroundImage:
      'repeating-linear-gradient(to bottom, var(--color-tech-cyan) 0 var(--border-1), transparent var(--border-1) var(--space-3))',
  },
};

export default function TechBackdrop({
  variant = 'grid',
  intensity = 'base',
  className,
  ...rest
}) {
  const resolvedVariant = BACKDROP_VARIANTS.includes(variant) ? variant : 'grid';
  const opacity = resolveOpacity(intensity);

  return (
    <div
      {...rest}
      aria-hidden="true"
      data-variant={resolvedVariant}
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      style={{ ...VARIANT_STYLES[resolvedVariant], opacity }}
    />
  );
}
