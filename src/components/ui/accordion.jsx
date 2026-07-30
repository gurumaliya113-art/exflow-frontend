import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "../../lib/utils"

/**
 * Accordion primitive, restyled onto the tokens (task 6.8).
 *
 * Item separators are decorative, so `--color-line` is the correct role here
 * (Requirement 10.3): the trigger is identified by its text and chevron, never
 * by the hairline.
 *
 * State signalling (Property 8, Requirements 9.1, 9.2):
 *   hover    -> underline (+ cyan text)
 *   focus    -> the unlayered 2px `:focus-visible` outline from
 *               `styles/index.css`; not suppressed here
 *   expanded -> chevron rotates 180deg AND the trigger text brightens;
 *               Radix mirrors it as `aria-expanded="true"` (Requirement 10.9)
 *
 * No `AccordionPrimitive.Header` wrapper: it renders an `h3`, which would
 * inject headings the route's outline does not account for (Requirement 10.5).
 *
 * Type roles use arbitrary `font-size` properties so `tailwind-merge` cannot
 * read them as text colors and drop the size.
 *
 * Requirements: 1.1, 1.2, 9.1, 9.2, 10.3
 */
const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    data-slot="accordion-item"
    className={cn("border-b border-line", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Trigger
    ref={ref}
    data-slot="accordion-trigger"
    className={cn(
      "flex w-full flex-1 items-center justify-between gap-3 py-4 text-left",
      "min-h-[var(--size-touch)] font-semibold text-content [font-size:var(--text-body)]",
      "transition-[color,background-color,border-color,box-shadow,opacity]",
      "hover:text-tech-cyan hover:underline hover:underline-offset-4",
      "data-[state=open]:text-tech-cyan",
      "[&[data-state=open]>svg]:rotate-180",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown
      aria-hidden="true"
      className="size-[var(--size-icon-xs)] shrink-0 transition-transform duration-[var(--duration-fast)]"
    />
  </AccordionPrimitive.Trigger>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    data-slot="accordion-content"
    className="overflow-hidden text-content-muted [font-size:var(--text-body)] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
))

AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
