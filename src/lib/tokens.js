/**
 * JS mirror of the design tokens declared in `src/styles/theme.css`.
 *
 * Values here MUST stay identical to the `@theme` block in `theme.css`. The
 * mirror exists so token invariants (scale counts, ranges, ordering, contrast)
 * can be asserted in tests and consumed by layout primitives (`Container`,
 * `Section`) without parsing CSS at runtime. `colorRoleVars` and the `*Names`
 * maps carry the CSS custom-property names so drift between the two layers is
 * detectable.
 *
 * Numeric scales are plain numbers in CSS pixels (milliseconds for motion) so
 * tests can order and compare them directly.
 *
 * Requirements: 1.4, 1.5, 1.6
 */

/* ---- Color roles (Tech_Palette) ------------------------------------------ */

/** @type {Record<string, string>} hex values, mirroring `--color-*`. */
export const colorRoles = {
  canvas: '#070B14',
  surface: '#0E1526',
  surfaceHigh: '#16203A',
  line: '#24314F',
  lineStrong: '#35456B',
  content: '#F3F6FC',
  contentMuted: '#A7B4CC',
  techCyan: '#22D3EE',
  techBlue: '#4F8DF7',
  techViolet: '#8B5CF6',
  brand: '#F97316',
  brandHover: '#EA580C',
  brandInk: '#120800',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#FB7185',
  focus: '#7DE3F4',
};

/** CSS custom-property name for each color role, for CSS/JS drift checks. */
export const colorRoleVars = {
  canvas: '--color-canvas',
  surface: '--color-surface',
  surfaceHigh: '--color-surface-high',
  line: '--color-line',
  lineStrong: '--color-line-strong',
  content: '--color-content',
  contentMuted: '--color-content-muted',
  techCyan: '--color-tech-cyan',
  techBlue: '--color-tech-blue',
  techViolet: '--color-tech-violet',
  brand: '--color-brand',
  brandHover: '--color-brand-hover',
  brandInk: '--color-brand-ink',
  success: '--color-success',
  warning: '--color-warning',
  danger: '--color-danger',
  focus: '--color-focus',
};

/**
 * The nine roles Requirement 1.4 requires to be pairwise distinct:
 * page background, elevated surface, border, primary text, secondary text,
 * success, warning, error, focus.
 */
export const distinctRoles = [
  'canvas',
  'surface',
  'line',
  'content',
  'contentMuted',
  'success',
  'warning',
  'danger',
  'focus',
];

/* ---- Typography: exactly five roles, strictly descending ----------------- */

/**
 * Each entry is a TypeStyle: { minPx, maxPx, weight, tracking, leading }.
 * `minPx` / `maxPx` are the rendered bounds of the `clamp()` in `theme.css`
 * (fixed roles have `minPx === maxPx`), so `minPx` is the size at 320 CSS
 * pixels and `maxPx` the size at 2560.
 *
 * @type {Record<string, { minPx: number, maxPx: number, weight: number, tracking: string, leading: number }>}
 */
export const typeScale = {
  // clamp(2.5rem, 1.6rem + 3.2vw, 4rem)
  display: { minPx: 40, maxPx: 64, weight: 800, tracking: '-0.02em', leading: 1.05 },
  // clamp(1.5rem, 1.15rem + 1.2vw, 2.25rem)
  heading: { minPx: 24, maxPx: 36, weight: 700, tracking: '-0.01em', leading: 1.15 },
  // 1rem
  body: { minPx: 16, maxPx: 16, weight: 400, tracking: '0em', leading: 1.6 },
  // 0.875rem
  label: { minPx: 14, maxPx: 14, weight: 600, tracking: '0.01em', leading: 1.4 },
  // 0.75rem
  meta: { minPx: 12, maxPx: 12, weight: 500, tracking: '0.08em', leading: 1.35 },
};

/** Type roles in descending rendered-size order (`--text-*`). */
export const typeRoles = ['display', 'heading', 'body', 'label', 'meta'];

/** CSS custom-property name for each type role. */
export const typeRoleVars = {
  display: '--text-display',
  heading: '--text-heading',
  body: '--text-body',
  label: '--text-label',
  meta: '--text-meta',
};

export const fontFamilies = {
  sans: "'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'Space Mono', ui-monospace, monospace",
};

/* ---- Numeric scales ------------------------------------------------------ */

/** 10 values, 0 - 96 px (`--space-0` .. `--space-9`). */
export const spacing = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96];

/** 6 values, 0 - 999 px (`--radius-none` .. `--radius-pill`). */
export const radii = [0, 6, 12, 20, 28, 999];

export const radiusNames = {
  none: 0,
  xs: 6,
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
};

/** 3 values, 0 - 2 px (`--border-0` .. `--border-2`). */
export const borders = [0, 1, 2];

/** 4 levels (`--shadow-flat` .. `--shadow-glow`), verbatim CSS values. */
export const shadows = [
  '0 1px 2px rgb(3 7 18 / 0.40)',
  '0 8px 24px -8px rgb(3 7 18 / 0.55)',
  '0 24px 56px -16px rgb(3 7 18 / 0.65)',
  '0 0 0 1px rgb(79 141 247 / 0.35), 0 12px 40px -12px rgb(34 211 238 / 0.30)',
];

export const shadowNames = {
  flat: shadows[0],
  raise: shadows[1],
  float: shadows[2],
  glow: shadows[3],
};

/** 5 values, 16 - 48 px (`--size-icon-xs` .. `--size-icon-xl`). */
export const iconSizes = [16, 20, 24, 32, 48];

export const iconSizeNames = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};

/** 4 values, 640 - 1440 px (`--container-prose` .. `--container-max`). */
export const containers = [640, 960, 1200, 1440];

/** Named content widths; the JS source used by `Container` / `Section`. */
export const containerWidths = {
  prose: 640,
  narrow: 960,
  wide: 1200,
  max: 1440,
};

/** Motion durations in ms, all <= 600 (`--duration-instant` .. `--duration-slow`). */
export const durations = [90, 160, 240, 420];

export const durationNames = {
  instant: 90,
  fast: 160,
  base: 240,
  slow: 420,
};

export const easings = {
  out: 'cubic-bezier(0.22, 1, 0.36, 1)',
  inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
};

/** Minimum interactive target size in CSS pixels (`--size-touch`). */
export const touchTargetPx = 44;

/** Body-text line-length cap in `ch` units (`--measure`). */
export const measureCh = 68;

/** Viewport bounds the type scale is verified across (Requirement 3.1). */
export const viewportRangePx = { min: 320, max: 2560 };

/* ---- Surface pairings for contrast assertions ---------------------------- */

/** Backgrounds body content renders on, in elevation order. */
export const surfaceRoles = ['canvas', 'surface', 'surfaceHigh'];

/** Backgrounds a filled Primary_CTA paints, which text also renders on. */
export const fillRoles = ['brand', 'brandHover'];

/** Minimum contrast ratio per pairing kind. */
export const minRatios = {
  /** Body-size text against its rendered background. */
  text: 4.5,
  /** Large text (>= 24px, or >= 18.66px bolded). */
  largeText: 3,
  /** Focus rings, meaningful icons, control boundaries. */
  nonText: 3,
  /** Purely decorative separators carry no contrast minimum. */
  decorative: 1,
};

function pair(role, surface, kind, note) {
  return {
    role,
    roleColor: colorRoles[role],
    surface,
    surfaceColor: colorRoles[surface],
    kind,
    minRatio: minRatios[kind],
    ...(note ? { note } : {}),
  };
}

function on(role, backgrounds, kind, note) {
  return backgrounds.map((bg) => pair(role, bg, kind, note));
}

/**
 * Every foreground role paired with each surface it renders on, plus the
 * minimum contrast ratio that pairing must satisfy.
 *
 * `kind`:
 * - `'text'` - text at any size; must reach 4.5:1 (Requirement 1.4).
 * - `'largeText'` - only used at display / heading sizes; 3:1 (Requirement 10.2).
 * - `'nonText'` - focus rings, meaningful icons, control boundaries; 3:1.
 * - `'decorative'` - separators that convey nothing; no minimum.
 *
 * A role absent from this list is not permitted on that surface. `techViolet`
 * is deliberately non-text only: it clears 3:1 on every surface but not 4.5:1
 * on `surfaceHigh`, so it is reserved for motifs and icons.
 *
 * @type {Array<{ role: string, roleColor: string, surface: string, surfaceColor: string, kind: keyof typeof minRatios, minRatio: number, note?: string }>}
 */
export const surfaces = [
  // Primary and secondary text on every surface.
  ...on('content', surfaceRoles, 'text'),
  ...on('contentMuted', surfaceRoles, 'text'),

  // Text on a brand fill (Primary_CTA label). `content` is NOT permitted here:
  // #F3F6FC on #F97316 is 2.59:1, which is why `brandInk` exists.
  ...on('brandInk', fillRoles, 'text'),

  // Status text.
  ...on('success', surfaceRoles, 'text'),
  ...on('warning', surfaceRoles, 'text'),
  ...on('danger', surfaceRoles, 'text'),

  // Accent text: eyebrows, links, metric emphasis.
  ...on('techCyan', surfaceRoles, 'text'),
  ...on('techBlue', surfaceRoles, 'text'),

  // Non-text: motif and icon accents.
  ...on('techViolet', surfaceRoles, 'nonText', 'motif and icon use only'),

  // Focus indicator. The ring carries a 2px offset, so its adjacent color is
  // the page or card background behind the control, never the control fill.
  ...on('focus', surfaceRoles, 'nonText'),

  // Control-identifying boundaries (input, select, textarea, outline button at
  // rest) must reach 3:1. `contentMuted` is the boundary role for those; the
  // `line` tokens are surface separations only.
  ...on('contentMuted', surfaceRoles, 'nonText', 'control-identifying boundary'),

  // Decorative separations: card edges, dividers, hairlines. These never carry
  // the only cue that identifies a control.
  ...on('line', surfaceRoles, 'decorative'),
  ...on('lineStrong', surfaceRoles, 'decorative'),
];

/* ---- Aggregate (TokenSet shape from the design document) ----------------- */

export const tokens = {
  colors: colorRoles,
  type: typeScale,
  spacing,
  radii,
  borders,
  shadows,
  iconSizes,
  containers,
  durations,
};

export default tokens;
