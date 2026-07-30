import { cn } from '@/lib/utils';

/**
 * ExternalLink - the only approved way to render an external destination.
 *
 * The link ALWAYS opens exactly one new browser context and ALWAYS blocks the
 * opener reference: `target="_blank"` plus `rel` containing both `noopener`
 * and `noreferrer` (Requirements 5.7, 6.6, 11.6). A caller cannot weaken
 * either one - `target` and `rel` passed through props are merged, never
 * substituted, so the safety tokens survive any call site.
 *
 * `newContext` exists for API symmetry with the design document; it cannot
 * suppress the safety attributes. Passing `false` warns in development and is
 * otherwise ignored, because an external destination rendered in place would
 * bypass the guarantee this component exists to make.
 */

/** The rel tokens that must be present on every external link. */
export const REQUIRED_REL = ['noopener', 'noreferrer'];

/**
 * Merge caller-supplied rel tokens with the required ones, de-duplicated and
 * with the required tokens always present.
 *
 * @param {string | undefined} rel
 * @returns {string}
 */
export function buildRel(rel) {
  const provided = typeof rel === 'string' ? rel.split(/\s+/).filter(Boolean) : [];
  const merged = [...REQUIRED_REL];
  for (const token of provided) {
    if (!merged.includes(token)) merged.push(token);
  }
  return merged.join(' ');
}

export default function ExternalLink({
  href,
  children,
  newContext = true,
  className,
  // Pulled out so a call site can never replace them.
  target: _ignoredTarget,
  rel,
  ...rest
}) {
  if (import.meta.env?.DEV && newContext === false) {
    // eslint-disable-next-line no-console
    console.warn(
      '[ExternalLink] newContext={false} is not supported: external destinations always open in a new context with noopener noreferrer.',
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel={buildRel(rel)}
      className={cn(
        'inline-flex items-center gap-1 text-tech-cyan underline-offset-4 hover:underline hover:text-tech-blue',
        className,
      )}
      {...rest}
    >
      {children}
    </a>
  );
}
