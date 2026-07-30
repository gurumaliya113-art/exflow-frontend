import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button primitive, restyled onto the design tokens (task 6.7).
 *
 * Accent discipline (Requirement 1.3): `brand` is the ONLY variant that paints
 * `--color-brand`, and it is reserved for conversion actions - opening the
 * Enquiry_Modal, navigating to `/enquire`, or submitting `/partner`. Every
 * other emphasis level uses the cyan / blue / violet tech accents.
 *
 * State signalling (Property 8, Requirements 9.1, 9.2): hover, active,
 * disabled, selected, and loading each differ from the resting state by at
 * least one NON-COLOR cue in addition to any color change -
 *   hover    -> raised shadow
 *   active   -> flattened shadow + 1px downward shift
 *   focus    -> the unlayered 2px `:focus-visible` outline from `styles/index.css`
 *               (deliberately not suppressed here)
 *   disabled -> dashed border + reduced opacity + not-allowed cursor
 *   selected -> underline (`aria-pressed="true"`)
 *   loading  -> spinner icon + `aria-busy` + `disabled`
 *
 * Touch targets (Requirement 3.8): every size is at least `--size-touch`
 * (44px) tall below the `md` breakpoint and only compacts at `md` and up.
 *
 * Font sizes are written as arbitrary properties rather than `text-*`
 * utilities so `tailwind-merge` cannot mistake a type-role token for a text
 * color and drop it when a variant sets `text-content`.
 *
 * Requirements: 1.3, 3.8, 9.1, 9.2, 9.7
 */
const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-sm font-semibold [font-size:var(--text-label)]",
    "border border-transparent",
    "transition-[color,background-color,border-color,box-shadow,opacity]",
    // Non-color state cues shared by every variant.
    "active:shadow-flat active:translate-y-px",
    "aria-pressed:underline aria-pressed:underline-offset-4 aria-pressed:decoration-2",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "disabled:border-dashed disabled:shadow-none disabled:translate-y-0",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary_CTA. The only `--color-brand` fill in the system.
        brand:
          "bg-brand text-brand-ink border-brand hover:bg-brand-hover hover:shadow-raise",
        // Default emphasis: tech blue fill.
        tech:
          "bg-tech-blue text-canvas border-tech-blue hover:bg-tech-cyan hover:shadow-raise",
        // Control-identifying boundary reaches 3:1 at rest (Requirement 10.3).
        outline:
          "bg-transparent text-content border-content-muted hover:bg-surface-high hover:shadow-raise",
        ghost:
          "bg-transparent text-content hover:bg-surface-high hover:underline hover:underline-offset-4",
        danger:
          "bg-danger text-canvas border-danger hover:shadow-raise hover:underline hover:underline-offset-4",
      },
      size: {
        // >= 44px below `md`, compacted from `md` up.
        sm: "min-h-[var(--size-touch)] px-3 md:min-h-8 [font-size:var(--text-meta)]",
        md: "min-h-[var(--size-touch)] px-5 md:min-h-10",
        lg: "min-h-[var(--size-touch)] px-7 md:min-h-12 [font-size:var(--text-body)]",
        icon: "min-h-[var(--size-touch)] min-w-[var(--size-touch)] p-0 md:min-h-10 md:min-w-10",
      },
    },
    defaultVariants: {
      variant: "tech",
      size: "md",
    },
  }
)

/** Spinner shown while `loading`. Decorative: `aria-busy` carries the state. */
function ButtonSpinner() {
  return (
    <svg
      data-slot="spinner"
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /**
   * Pending state. Renders a spinner, sets `aria-busy`, and disables the
   * control. The label stays in the DOM at the same size so the accessible
   * name is unchanged and the button does not change width.
   */
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    // `Slot` needs a single child element, so the spinner is only injected for
    // real `button` elements. `asChild` still receives the loading semantics.
    const content =
      loading && !asChild ? (
        <>
          <span
            data-slot="spinner-layer"
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <ButtonSpinner />
          </span>
          {/* Label retained (in DOM, same metrics) so width does not jump. */}
          <span data-slot="label" className="inline-flex items-center gap-2 opacity-0">
            {children}
          </span>
        </>
      ) : (
        children
      )

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        data-loading={loading ? "true" : undefined}
        aria-busy={loading || undefined}
        {...(asChild
          ? // A slotted child may be an anchor, which has no `disabled`.
            { "aria-disabled": disabled || loading || undefined }
          : { disabled: disabled || loading })}
        {...props}
      >
        {content}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
