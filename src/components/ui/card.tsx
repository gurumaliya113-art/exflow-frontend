import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Card primitive, restyled onto the design tokens (task 6.8).
 *
 * `tone` (Requirements 1.1, 1.2):
 *   surface -> `--color-surface` panel on the canvas, decorative `--color-line` edge
 *   raised  -> `--color-surface-high` panel with `--shadow-raise`
 *   outline -> transparent fill; the edge identifies the group, so it uses
 *              `--color-content-muted` (>= 3:1 on every surface) rather than a
 *              `line` token (Requirement 10.3)
 *
 * `interactive` (Requirements 9.1, 9.2, 9.5): hover raises the card with
 * `--shadow-raise` AND lifts it 2px. The lift is purely decorative, so it is
 * gated behind `motion-safe:` and additionally carries `motion-decorative`,
 * which the base layer neutralises under a reduced-motion preference.
 *
 * `selected` (Requirements 9.1, 9.2, 10.3): a 2px `--color-tech-cyan` ring
 * plus `data-selected="true"`. The ring is an outline change, so the selected
 * state differs from the default by a non-color signal as well as a color one.
 *
 * Type roles are written as arbitrary `font-size` properties rather than
 * `text-` size utilities, so `tailwind-merge` cannot mistake the role for a
 * text color and silently drop it.
 *
 * Requirements: 1.1, 1.2, 9.1, 9.2, 10.3
 */
const cardVariants = cva(
  [
    "relative rounded-md text-content",
    "transition-[color,background-color,border-color,box-shadow,opacity]",
  ].join(" "),
  {
    variants: {
      tone: {
        // Decorative edge: the card is not a control, so `line` is allowed.
        surface: "bg-surface border border-line shadow-flat",
        raised: "bg-surface-high border border-line shadow-raise",
        // Group-identifying edge -> must reach 3:1 (Requirement 10.3).
        outline: "bg-transparent border border-content-muted",
      },
      interactive: {
        true: [
          "cursor-pointer",
          "hover:shadow-raise hover:border-content-muted",
          "motion-decorative motion-safe:transition-transform",
          "motion-safe:hover:-translate-y-0.5",
        ].join(" "),
        false: "",
      },
      selected: {
        // 2px cyan ring. Non-color cue: the ring itself (outline change).
        true: "ring-2 ring-tech-cyan",
        false: "",
      },
    },
    defaultVariants: {
      tone: "surface",
      interactive: false,
      selected: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof cardVariants>, "interactive" | "selected"> {
  /** Hover elevation + decorative lift (suppressed under reduced motion). */
  interactive?: boolean
  /** Marks this card as the selected member of its group. */
  selected?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, tone, interactive = false, selected = false, ...props },
    ref
  ) => (
    <div
      ref={ref}
      data-slot="card"
      data-tone={tone ?? "surface"}
      data-interactive={interactive ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      className={cn(cardVariants({ tone, interactive, selected }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-header"
    className={cn("flex flex-col gap-2 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-title"
    className={cn(
      "font-semibold leading-tight tracking-[-0.01em] text-content [font-size:var(--text-body)]",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-description"
    className={cn("text-content-muted [font-size:var(--text-label)]", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-content"
    className={cn("p-6 pt-0", className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="card-footer"
    className={cn("flex items-center gap-3 p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}
