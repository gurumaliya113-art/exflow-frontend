"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

/**
 * Calendar primitive, restyled onto the tokens (task 6.8).
 *
 * Selected day (Requirement 4.8): `react-day-picker` puts `aria-selected` on
 * the day's `gridcell`, and in `mode="single"` exactly one cell carries it.
 * That cell's button renders as a single `--color-tech-cyan` filled pill, a
 * treatment no unselected day has.
 *
 * State signalling (Property 8, Requirements 9.1, 9.2) - each state adds a
 * non-color cue on top of its color change:
 *   hover    -> `hover:bg-surface-high` + underline, inherited from `Button`'s
 *               `ghost` variant
 *   focus    -> the unlayered 2px `:focus-visible` outline from
 *               `styles/index.css`, plus a `--color-focus` ring while
 *               `react-day-picker` marks the day focused
 *   selected -> pill radius + bolder digits + `--shadow-glow`, not colour alone
 *   today    -> a raised `--color-surface-high` cell
 *   disabled -> reduced opacity, as `Button` does
 *
 * Boundaries that identify a control (the caption dropdown) use
 * `--color-content-muted` so they clear 3:1; the `line` tokens stay
 * decorative (Requirement 10.3).
 *
 * `--cell-size` steps up to 44px from `sm` so a 320px viewport cannot be
 * pushed into horizontal scrolling, while `Button size="icon"` keeps every
 * day's height at `--size-touch` regardless.
 *
 * Requirements: 1.1, 1.2, 4.8, 9.1, 9.2, 10.3
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-transparent p-3 text-content [--cell-size:2.25rem] sm:[--cell-size:2.75rem]",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "w-[var(--cell-size)] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant, size: "icon" }),
          "w-[var(--cell-size)] select-none p-0 aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex min-h-[var(--cell-size)] w-full items-center justify-center px-[var(--cell-size)]",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex min-h-[var(--cell-size)] w-full items-center justify-center gap-2 font-semibold [font-size:var(--text-label)]",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          // Control-identifying boundary -> 3:1 (Requirement 10.3).
          "relative rounded-sm border border-content-muted shadow-flat has-focus:border-content",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-surface opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-semibold text-content",
          captionLayout === "label"
            ? "[font-size:var(--text-label)]"
            : "flex h-8 items-center gap-1 rounded-sm pl-2 pr-1 [font-size:var(--text-label)] [&>svg]:size-3.5 [&>svg]:text-content-muted",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 select-none rounded-sm font-medium text-content-muted [font-size:var(--text-meta)]",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-[var(--cell-size)] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "select-none text-content-muted [font-size:var(--text-meta)]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center",
          defaultClassNames.day
        ),
        range_start: cn("rounded-l-sm bg-surface-high", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-sm bg-surface-high", defaultClassNames.range_end),
        today: cn(
          "rounded-sm bg-surface-high data-[selected=true]:bg-transparent",
          defaultClassNames.today
        ),
        outside: cn(
          "text-content-muted aria-selected:text-content-muted",
          defaultClassNames.outside
        ),
        disabled: cn("text-content-muted opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[var(--cell-size)] items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

/**
 * A single day control. The selected-single treatment is the cyan pill that
 * Requirement 4.8 asks for: filled `--color-tech-cyan`, pill radius, bolder
 * digits, and `--shadow-glow` - none of which an unselected day carries.
 */
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const isSingleSelected =
    modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={isSingleSelected}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square h-auto w-full min-w-[var(--cell-size)] flex-col gap-1 font-normal leading-none",
        // Selected single: the cyan pill (Requirement 4.8).
        "data-[selected-single=true]:rounded-pill data-[selected-single=true]:bg-tech-cyan data-[selected-single=true]:font-bold data-[selected-single=true]:text-canvas data-[selected-single=true]:shadow-glow",
        // Range edges and interior.
        "data-[range-start=true]:rounded-l-sm data-[range-start=true]:bg-tech-cyan data-[range-start=true]:font-bold data-[range-start=true]:text-canvas",
        "data-[range-end=true]:rounded-r-sm data-[range-end=true]:bg-tech-cyan data-[range-end=true]:font-bold data-[range-end=true]:text-canvas",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-surface-high data-[range-middle=true]:text-content",
        // Keyboard roving focus, on top of the global :focus-visible outline.
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-focus group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-focus",
        "[&>span]:opacity-70 [&>span]:[font-size:var(--text-meta)]",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
