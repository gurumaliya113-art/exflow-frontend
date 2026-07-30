import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton, TOUCH_TARGET_CLASS } from '@/components/system/IconButton'
import { clampIndex, nextIndex, prevIndex } from '@/lib/carousel'
import { cn } from '@/lib/utils'

/**
 * `CarouselControls` - the previous, next, and slide-selector controls for the
 * portfolio carousel.
 *
 * Presentational by design: it receives the selected `index`, the total
 * `count`, and callbacks, so `ProjectCarousel` owns the selection state
 * (Requirement 6.2). Every control reports the index it wants selected rather
 * than mutating anything here.
 *
 * Previous and next are `IconButton`s, which makes the glyph decorative and the
 * accessible name mandatory, so both icon-only controls have a
 * programmatically determinable name identifying their action
 * (Requirement 10.8). Their target indexes come from `lib/carousel.js`, so the
 * cycle - previous from the first project lands on the final one, next from the
 * final project lands on the first - is the same arithmetic the carousel state
 * uses, never a second copy of it (Requirements 6.3, 6.4, 6.5).
 *
 * The slide selectors are real `button` elements with the accessible name
 * "Show project N" (one-based), not dots painted on `div`s, so each is
 * focusable, activates with Enter and Space, and names the project position it
 * selects (Requirements 6.3, 10.8).
 *
 * The selected selector is distinguished twice over: `aria-current="true"` for
 * assistive technologies and a wider, ring-outlined pill for sighted users, so
 * the selected state survives without color perception (Requirement 9.1).
 *
 * Requirements: 6.3, 6.4, 6.5, 10.8
 *
 * @param {object} props
 * @param {number} props.index Zero-based selected project index.
 * @param {number} props.count Total number of projects.
 * @param {(index: number) => void} [props.onPrev] Called with the preceding index.
 * @param {(index: number) => void} [props.onNext] Called with the following index.
 * @param {(index: number) => void} [props.onSelect] Called with the chosen index.
 * @param {string} [props.label='Portfolio projects'] Accessible name of the control group.
 * @param {string} [props.prevLabel='Previous'] Accessible name of the previous control.
 * @param {string} [props.nextLabel='Next'] Accessible name of the next control.
 * @param {boolean} [props.showArrows=true] Render the previous and next controls.
 */

/** Accessible name of the selector for the one-based position `n`. */
export function selectorLabel(n) {
  return `Show project ${n}`
}

/** Selector pill at rest: a muted bar with a transparent ring placeholder. */
const SELECTOR_REST = [
  'w-[var(--space-3)] bg-content-muted/60 ring-transparent',
  'hover:bg-content-muted',
].join(' ')

/**
 * Selected selector: cyan fill, plus two non-color cues - roughly triple the
 * width and a visible ring - so the state is not carried by hue alone.
 */
const SELECTOR_SELECTED = 'w-[var(--space-6)] bg-tech-cyan ring-focus'

export function CarouselControls({
  index = 0,
  count = 0,
  onPrev,
  onNext,
  onSelect,
  label = 'Portfolio projects',
  prevLabel = 'Previous',
  nextLabel = 'Next',
  showArrows = true,
  className,
  ...rest
}) {
  const total = Number.isFinite(Number(count)) ? Math.max(0, Math.trunc(Number(count))) : 0
  const selected = clampIndex(index, total)
  const disabled = total <= 1

  const request = (handler, target) => {
    if (typeof handler === 'function') handler(target)
  }

  return (
    <div
      role="group"
      aria-label={label}
      data-slot="carousel-controls"
      className={cn(
        'flex items-center justify-center gap-[var(--space-2)]',
        className,
      )}
      {...rest}
    >
      {showArrows ? (
        <IconButton
          label={prevLabel}
          tone="outline"
          data-control="prev"
          disabled={disabled}
          onClick={() => request(onPrev, prevIndex(selected, total))}
          icon={<ChevronLeft aria-hidden="true" />}
        />
      ) : null}

      <div
        data-slot="carousel-selectors"
        className="flex flex-wrap items-center justify-center"
      >
        {Array.from({ length: total }, (_, i) => {
          const isSelected = i === selected

          return (
            <button
              key={i}
              type="button"
              aria-label={selectorLabel(i + 1)}
              aria-current={isSelected ? 'true' : undefined}
              data-slot="carousel-selector"
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => request(onSelect, i)}
              className={cn(
                // The small pill is only the visible mark; the button itself
                // carries the full touch target, and the row wraps rather than
                // overflowing when many selectors meet that minimum on narrow
                // viewports (Requirements 3.6, 3.8).
                'inline-flex shrink-0 items-center justify-center',
                TOUCH_TARGET_CLASS,
                'rounded-[var(--radius-pill)] bg-transparent',
                'focus-visible:outline-[var(--border-2)] focus-visible:outline-offset-2 focus-visible:outline-focus',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'block h-[var(--space-1)] rounded-[var(--radius-pill)]',
                  'ring-[length:var(--border-1)]',
                  'transition-[width,background-color] duration-[var(--duration-fast)] ease-[var(--ease-out)]',
                  isSelected ? SELECTOR_SELECTED : SELECTOR_REST,
                )}
              />
            </button>
          )
        })}
      </div>

      {showArrows ? (
        <IconButton
          label={nextLabel}
          tone="outline"
          data-control="next"
          disabled={disabled}
          onClick={() => request(onNext, nextIndex(selected, total))}
          icon={<ChevronRight aria-hidden="true" />}
        />
      ) : null}
    </div>
  )
}

export default CarouselControls
