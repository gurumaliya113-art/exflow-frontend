import * as React from "react"

import { cn } from "@/lib/utils"
import { fieldChromeClass } from "@/components/ui/input"

/**
 * Textarea primitive (new in task 6.8). Shares `fieldChromeClass` with `Input`
 * so both controls carry the same token-backed boundary and the same
 * non-color state cues (hover shadow, 2px invalid border, dashed disabled
 * border, and the global 2px `:focus-visible` outline).
 *
 * `resize-y` only: horizontal resize could push a form past the viewport,
 * which Requirement 3.x forbids.
 *
 * Requirements: 1.1, 1.2, 9.1, 9.2, 10.3
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, rows = 4, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      rows={rows}
      data-slot="textarea"
      className={cn(
        fieldChromeClass,
        "min-h-[calc(var(--size-touch)*2)] resize-y leading-relaxed",
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
