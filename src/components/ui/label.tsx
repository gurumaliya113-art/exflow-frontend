"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Label primitive, restyled onto the tokens (task 6.8).
 *
 * Uses the `label` type role (`--text-label`: 14px / 600 / 0.01em) written as
 * an arbitrary property so `tailwind-merge` cannot mistake it for a text color
 * and drop the size when a caller also sets a color.
 *
 * The disabled pairing keeps a non-color cue: a peer-disabled control's label
 * takes `cursor-not-allowed` as well as reduced opacity (Requirements 9.1, 9.2).
 *
 * Requirements: 1.1, 1.2, 9.1, 9.2
 */
const labelVariants = cva(
  [
    "inline-block font-semibold leading-none tracking-[0.01em]",
    "text-content [font-size:var(--text-label)]",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  ].join(" ")
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label, labelVariants }
