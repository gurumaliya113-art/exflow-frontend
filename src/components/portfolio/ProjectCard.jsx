import { forwardRef } from 'react'

import Badge from '@/components/system/Badge'
import SafeImage from '@/components/system/SafeImage'
import { useSelectionMember } from '@/components/system/SelectionGroup'
import { cardVariants } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * `ProjectCard` - one selectable project in the portfolio carousel.
 *
 * It is a real `button` element, so pointer, Enter, and Space activation all
 * come from the platform rather than from a synthesized key handler, and the
 * control is reachable in the sequential focus order (Requirement 6.8). Its
 * accessible name always contains the project name, and the selected state is
 * exposed through `aria-pressed`, so assistive technologies can tell which
 * single card of the group matches the featured project (Requirements 6.8,
 * 6.9). Group membership goes through `useSelectionMember`, which also applies
 * the development-time accent guard: at most one card of a group may request
 * the Brand_Accent for its selected state.
 *
 * The preview renders through `SafeImage` with a reserved aspect box, so the
 * rendered ratio matches the intrinsic ratio while the asset loads, and a
 * failed load keeps the identical width and height and shows the non-empty
 * alternative text in that space (Requirements 12.1, 12.2).
 *
 * The selected treatment is the Card ring: an outline change, so selected
 * differs from unselected by a non-color signal as well as a color one.
 *
 * The project's own gradient and tag color are content values carried over
 * from the portfolio baseline, so they are applied as data through inline
 * style; every other value in this component is token-backed.
 *
 * Requirements: 6.8, 6.9, 12.1, 12.2
 *
 * @param {object} props
 * @param {{ name: string, description?: string, image?: string, gradient?: string, tag?: string, tagColor?: string, link?: string }} props.project
 * @param {number} [props.index] Zero-based position in the project list.
 * @param {string} [props.id] Selection-group member id; defaults to the project name.
 * @param {unknown} [props.value] Selection-group value; defaults to the member id.
 * @param {boolean} [props.selected] Explicit selected state; omit to read it from the group.
 * @param {'tech'|'brand'} [props.accent='tech'] Selected-state accent.
 * @param {string} [props.label] Accessible name override. Must contain the project name.
 * @param {string} [props.imageAlt] Alternative text override for the preview.
 * @param {(value: unknown, index?: number) => void} [props.onSelect] Called after activation.
 */

/** Reserved preview ratio; matches the featured stage image. */
export const PROJECT_CARD_RATIO = '16/9'

const ProjectCard = forwardRef(function ProjectCard(
  {
    project,
    index,
    id,
    value,
    selected,
    accent = 'tech',
    label,
    imageAlt,
    imageRatio = PROJECT_CARD_RATIO,
    onSelect,
    onClick,
    className,
    ...rest
  },
  ref,
) {
  const name = project?.name ?? ''
  const memberId = id ?? (name || `project-${index ?? 0}`)
  const memberValue = value === undefined ? memberId : value

  const {
    selected: isSelected,
    accent: resolvedAccent,
    select,
  } = useSelectionMember({ id: memberId, value: memberValue, accent, selected })

  // Guarded after the hooks so the hook order never depends on the prop.
  if (!project) return null

  // The accessible name is set explicitly so it is deterministic and always
  // contains the project name, whether or not the preview asset resolves.
  const accessibleName = label ?? name
  const previewAlt = imageAlt ?? (name ? `${name} project preview` : 'Project preview')

  function handleClick(event) {
    select()
    if (onSelect) onSelect(memberValue, index)
    if (onClick) onClick(event)
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label={accessibleName}
      aria-pressed={isSelected}
      data-slot="project-card"
      data-selected={isSelected ? 'true' : undefined}
      data-accent={resolvedAccent}
      onClick={handleClick}
      className={cn(
        cardVariants({ tone: 'surface', interactive: true, selected: isSelected }),
        'flex w-full flex-col items-stretch gap-[var(--space-3)] overflow-hidden',
        'p-[var(--space-3)] text-left',
        'min-h-[var(--size-touch)] min-w-[var(--size-touch)]',
        'focus-visible:outline-[var(--border-2)] focus-visible:outline-offset-2 focus-visible:outline-focus',
        // Brand-accent selection recolors the same ring, keeping the non-color
        // signal identical across accents.
        isSelected && resolvedAccent === 'brand' && 'ring-brand',
        className,
      )}
      {...rest}
    >
      <SafeImage
        as="span"
        src={project.image}
        alt={previewAlt}
        ratio={imageRatio}
        className="rounded-[var(--radius-sm)] border border-line"
      />

      {project.gradient ? (
        // Decorative: the project's own baseline gradient as a token-height rule.
        <span
          aria-hidden="true"
          data-slot="project-card-accent"
          className="block h-[var(--space-1)] w-full shrink-0 rounded-[var(--radius-pill)]"
          style={{ backgroundImage: project.gradient }}
        />
      ) : null}

      <span className="flex w-full flex-col items-start gap-[var(--space-2)]">
        <span
          data-slot="project-card-name"
          className="block text-[length:var(--text-label)] font-semibold leading-snug tracking-[0.01em] text-content"
        >
          {name}
        </span>

        {project.tag ? (
          <Badge
            as="span"
            tone="outline"
            accent={resolvedAccent === 'brand' ? 'brand' : 'tech'}
            data-slot="project-card-tag"
            style={
              project.tagColor
                ? { color: project.tagColor, borderColor: project.tagColor }
                : undefined
            }
          >
            {project.tag}
          </Badge>
        ) : null}
      </span>
    </button>
  )
})

export default ProjectCard
