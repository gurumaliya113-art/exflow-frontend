import { useState } from 'react'
import { ImageOff } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * SafeImage - resilient image primitive.
 *
 * The image always renders inside a wrapper whose box is reserved *before* the
 * asset loads, either from explicit `width`/`height` or from a `ratio` aspect
 * wrapper. The `<img>` fills that box with `object-cover`, so the rendered
 * width-to-height ratio equals the reserved ratio and the intrinsic ratio is
 * preserved rather than stretched (Requirement 12.1, 12.3).
 *
 * On `onError` (or a missing `src`) the `<img>` is replaced by a token-styled
 * placeholder rendered inside the *same* wrapper, so the reserved width and
 * height are unchanged and non-empty `alt` text is shown in that space
 * (Requirement 12.2). Decorative images (`alt=""`) render an `aria-hidden`
 * placeholder with no text, and because the placeholder never removes or
 * covers sibling content, a failed decorative asset leaves every heading,
 * text block, link, and control on the route intact and operable
 * (Requirement 12.4).
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4
 *
 * @param {object} props
 * @param {string} [props.src] Asset URL. A missing `src` renders the placeholder.
 * @param {string} [props.alt] Descriptive text for meaningful images; `''` marks the image decorative.
 * @param {number|string} [props.width] Intrinsic width in CSS pixels.
 * @param {number|string} [props.height] Intrinsic height in CSS pixels.
 * @param {number|string} [props.ratio] Aspect wrapper ratio, e.g. `'16/9'`, `'4 / 3'` or `1.5`.
 * @param {boolean} [props.fill] With `ratio`, stretch the wrapper to the available width.
 * @param {string} [props.className] Classes for the reserved-box wrapper.
 * @param {string} [props.imgClassName] Classes for the `<img>`.
 * @param {string} [props.placeholderClassName] Classes for the error placeholder.
 * @param {'lazy'|'eager'} [props.loading]
 * @param {'async'|'sync'|'auto'} [props.decoding]
 * @param {'div'|'span'|'figure'|React.ElementType} [props.as] Wrapper element.
 */
export default function SafeImage({
  src,
  alt = '',
  width,
  height,
  ratio,
  fill = true,
  className,
  imgClassName,
  placeholderClassName,
  loading = 'lazy',
  decoding = 'async',
  as: Wrapper = 'div',
  style,
  onError,
  ...imgProps
}) {
  const [failedSrc, setFailedSrc] = useState(null)

  const hasExplicitSize = isSize(width) && isSize(height)
  const hasRatio = ratio !== undefined && ratio !== null && ratio !== ''

  if (import.meta.env.DEV && !hasExplicitSize && !hasRatio) {
    // eslint-disable-next-line no-console
    console.warn(
      '[SafeImage] requires both `width` and `height`, or a `ratio` aspect wrapper, ' +
        'so the image box is reserved before load (Requirement 12.3). ' +
        `Received width=${String(width)} height=${String(height)} ratio=${String(ratio)}.`
    )
  }

  const aspectRatio = hasRatio
    ? normalizeRatio(ratio)
    : hasExplicitSize
      ? `${width} / ${height}`
      : undefined

  // Reserve the box on the wrapper itself: it is the node that survives a
  // failed load, so the placeholder inherits the identical width and height.
  const reservedStyle = {
    ...(aspectRatio ? { aspectRatio } : null),
    ...(hasExplicitSize && !hasRatio
      ? { width: toPx(width), height: toPx(height) }
      : null),
    ...style,
  }

  const decorative = alt === ''
  const failed = !src || (failedSrc !== null && failedSrc === src)

  return (
    <Wrapper
      data-safe-image=""
      data-state={failed ? 'error' : 'ok'}
      className={cn(
        'relative block overflow-hidden',
        hasRatio && fill && 'w-full',
        className
      )}
      style={reservedStyle}
    >
      {failed ? (
        <span
          data-safe-image-placeholder=""
          aria-hidden={decorative ? 'true' : undefined}
          className={cn(
            'absolute inset-0 flex h-full w-full flex-col items-center justify-center',
            'gap-[var(--space-2)] p-[var(--space-3)] text-center',
            'border border-line bg-surface-high text-content-muted',
            placeholderClassName
          )}
        >
          <ImageOff
            aria-hidden="true"
            className="h-[var(--size-icon-md)] w-[var(--size-icon-md)] shrink-0"
          />
          {decorative ? null : (
            <span className="text-[length:var(--text-meta)] font-medium tracking-[0.08em] break-words">
              {alt}
            </span>
          )}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          {...(decorative ? { 'aria-hidden': 'true' } : null)}
          {...(isSize(width) ? { width } : null)}
          {...(isSize(height) ? { height } : null)}
          loading={loading}
          decoding={decoding}
          onError={(event) => {
            setFailedSrc(src)
            if (onError) onError(event)
          }}
          className={cn('absolute inset-0 h-full w-full object-cover', imgClassName)}
          {...imgProps}
        />
      )}
    </Wrapper>
  )
}

function isSize(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0
  if (typeof value === 'string') return value.trim() !== '' && Number(value) > 0
  return false
}

function toPx(value) {
  return typeof value === 'number' ? `${value}px` : `${Number(value)}px`
}

/** Accepts `'16/9'`, `'16 / 9'`, `'1.777'` or a number and returns a CSS ratio. */
function normalizeRatio(ratio) {
  if (typeof ratio === 'number') return String(ratio)
  const text = String(ratio).trim()
  return text.includes('/') ? text.replace(/\s*\/\s*/, ' / ') : text
}
