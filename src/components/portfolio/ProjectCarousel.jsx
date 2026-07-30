import { useCallback, useState } from 'react'

import SelectionGroup from '@/components/system/SelectionGroup'
import VisuallyHidden from '@/components/system/VisuallyHidden'
import { clampIndex, positionLabel } from '@/lib/carousel'
import defaultProjects from '@/content/projects'
import { cn } from '@/lib/utils'

import CarouselControls from './CarouselControls'
import ProjectCard from './ProjectCard'
import ProjectStage from './ProjectStage'

/**
 * `ProjectCarousel` - the portfolio carousel: one featured project, the
 * previous / next / slide-selector controls, and the selectable project cards.
 *
 * This component is the single owner of the carousel's selection state
 * (Requirement 6.2). It stores one index, derives the featured project from it,
 * and passes the same index to the controls and to the card group, so the
 * featured project and the one selected card can never disagree. The cards sit
 * inside a controlled `SelectionGroup`, which both narrows selection to a
 * single value and applies the development-time single-selection and
 * brand-accent audits.
 *
 * Every index change goes through `lib/carousel.js`. The controls resolve their
 * own target with the same helpers and hand back the resolved index, so the
 * cycle - previous from the first project lands on the final one, next from the
 * final project lands on the first - exists in exactly one place
 * (Requirements 6.3, 6.4, 6.5). The stored index is clamped on read as well, so
 * a shorter project list can never leave a stale index pointing past the end.
 *
 * The position announcement lives in a visually hidden polite live region that
 * is mounted with the carousel rather than added alongside its text: an
 * assistive technology only announces changes to a region it was already
 * observing, so mounting the region and its first message together would drop
 * the announcement. Its content is the selected project's one-based index, the
 * total count, and the project name, refreshed on every selection change
 * (Requirements 6.9, 10.9).
 *
 * The project list is a prop so a caller (or a test) can drive it; the default
 * is the portfolio content module. An empty list renders the shell and an empty
 * announcement instead of failing.
 *
 * Requirements: 6.2, 6.3, 6.4, 6.5, 6.9, 10.9
 *
 * @param {object} props
 * @param {Array<object>} [props.projects] Projects to browse, in display order.
 * @param {number} [props.defaultIndex=0] Initially featured project index.
 * @param {number} [props.headingLevel=3] Heading level of the featured project name.
 * @param {string} [props.headingId] Id applied to the featured project heading.
 * @param {string} [props.label] Accessible name of the control group.
 * @param {string} [props.cardsLabel] Accessible name of the project card group.
 * @param {(index: number, project: object | null) => void} [props.onSelectionChange]
 */
export default function ProjectCarousel({
  projects = defaultProjects,
  defaultIndex = 0,
  headingLevel = 3,
  headingId,
  label = 'Portfolio projects',
  cardsLabel = 'Select a project',
  onSelectionChange,
  className,
  ...rest
}) {
  const list = Array.isArray(projects) ? projects : []
  const count = list.length

  const [storedIndex, setStoredIndex] = useState(() => clampIndex(defaultIndex, count))

  // Clamped on read: the list can change under a stored index.
  const index = clampIndex(storedIndex, count)
  const featured = count > 0 ? list[index] : null

  const select = useCallback(
    (target) => {
      const next = clampIndex(target, count)
      setStoredIndex(next)
      if (onSelectionChange) onSelectionChange(next, count > 0 ? list[next] : null)
    },
    // `list` is read only for the callback payload; `count` covers its length.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, onSelectionChange],
  )

  const announcement = count > 0 ? positionLabel(index, count, featured?.name) : ''

  return (
    <div
      data-slot="project-carousel"
      data-count={count}
      data-index={index}
      className={cn('flex flex-col gap-[var(--space-6)]', className)}
      {...rest}
    >
      {/* Mounted with the carousel so later position changes are announced. */}
      <VisuallyHidden
        as="div"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-slot="carousel-live-region"
      >
        {announcement}
      </VisuallyHidden>

      {featured ? (
        <ProjectStage
          project={featured}
          headingLevel={headingLevel}
          headingId={headingId}
        />
      ) : null}

      {count > 0 ? (
        <CarouselControls
          index={index}
          count={count}
          label={label}
          onPrev={select}
          onNext={select}
          onSelect={select}
        />
      ) : null}

      {count > 0 ? (
        <SelectionGroup
          name="portfolio-projects"
          label={cardsLabel}
          value={index}
          onChange={select}
          data-slot="project-carousel-cards"
          className="grid grid-cols-2 gap-[var(--space-4)] sm:grid-cols-3 lg:grid-cols-4"
        >
          {list.map((project, i) => (
            <ProjectCard
              key={`${i}-${project?.name ?? ''}`}
              project={project}
              index={i}
              id={`project-${i}`}
              value={i}
            />
          ))}
        </SelectionGroup>
      ) : null}
    </div>
  )
}
