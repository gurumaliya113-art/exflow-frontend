import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Shared field chrome for `Input` and `Textarea`, on tokens only (task 6.8).
 *
 * Control boundary (Requirement 10.3): the resting border is
 * `--color-content-muted`. The `--color-line` tokens sit at ~1.5:1 against the
 * surfaces, so they can never be the only cue that identifies a control; they
 * stay on decorative separators and card edges.
 *
 * State signalling (Property 8, Requirements 9.1, 9.2) - every state differs
 * from the resting state by at least one NON-COLOR cue:
 *   hover    -> raised shadow (+ brighter border)
 *   focus    -> the unlayered 2px `:focus-visible` outline from
 *               `styles/index.css`; deliberately NOT suppressed here
 *   invalid  -> border thickness 1px -> 2px (+ danger border)
 *   disabled -> dashed border + reduced opacity + not-allowed cursor
 *
 * Touch target (Requirement 3.8): >= `--size-touch` below `md`.
 *
 * The type role is written as `[font-size:var(--text-body)]` so
 * `tailwind-merge` cannot read it as a text color and drop the size.
 *
 * Requirements: 1.1, 1.2, 9.1, 9.2, 10.3
 */
export const fieldChromeClass = [
  "flex w-full rounded-sm px-3 py-2",
  "bg-surface text-content [font-size:var(--text-body)]",
  "border border-content-muted shadow-flat",
  "transition-[color,background-color,border-color,box-shadow,opacity]",
  "placeholder:text-content-muted",
  "hover:border-content hover:shadow-raise",
  "aria-invalid:border-2 aria-invalid:border-danger",
  "disabled:cursor-not-allowed disabled:border-dashed disabled:opacity-50",
].join(" ")

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          fieldChromeClass,
          "min-h-[var(--size-touch)] md:min-h-10",
          "file:border-0 file:bg-transparent file:font-semibold file:text-content file:[font-size:var(--text-label)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
