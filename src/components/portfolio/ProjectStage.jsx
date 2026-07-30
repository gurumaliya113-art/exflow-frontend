import Badge from '@/components/system/Badge'
import ExternalLink from '@/components/system/ExternalLink'
import SafeImage from '@/components/system/SafeImage'
import { cn } from '@/lib/utils'

/**
 * ProjectStage - the featured project of the portfolio carousel.
 *
 * Everything the stage shows comes from the project record unchanged: image,
 * name, description, category tag, and availability (Requirement 6.1). The
 * project's own `gradient` and `tagColor` are content values moved verbatim
 * from the pre-redesign page, so they are the one place a literal color is
 * allowed to reach an inline style; every other surface, border, and text
 * color here is token-backed.
 *
 * Availability drives exactly one presentation (Requirements 6.6, 6.7):
 * a project with a destination renders the "View Project" control through
 * `ExternalLink` - the only approved way to open an external destination, so
 * it always carries a new browsing context plus noopener and noreferrer - and
 * a project without one renders a de-emphasised "Coming Soon" status with no
 * navigable destination anywhere in its presentation.
 *
 * The image sits in a reserved aspect box via `SafeImage`, so its box exists
 * before the asset loads and a failed load keeps the layout intact
 * (Requirement 12.1).
 *
 * Requirements: 6.1, 6.6, 6.7, 12.1
 */

/** The exact baseline strings for the two availability presentations. */
export const VIEW_PROJECT_LABEL = 'View Project \u2192'
export const COMING_SOON_LABEL = 'Coming Soon'

/**
 * A project is available when it carries a non-empty destination. A missing,
 * null, or blank `link` means "Coming Soon".
 *
 * @param {{ link?: string | null } | null | undefined} project
 * @returns {boolean}
 */
export function isProjectAvailable(project) {
  return typeof project?.link === 'string' && project.link.trim() !== ''
}

export default function ProjectStage({
  project,
  headingLevel = 2,
  headingId,
  imageWidth = 1280,
  imageHeight = 720,
  className,
  ...rest
}) {
  if (!project) return null

  const level = Math.min(Math.max(Number(headingLevel) || 2, 1), 6)
  const Heading = `h${level}`
  const available = isProjectAvailable(project)

  return (
    <article
      data-project-stage=""
      data-availability={available ? 'available' : 'coming-soon'}
      className={cn(
        'relative isolate overflow-hidden rounded-lg border border-line bg-surface',
        className,
      )}
      {...rest}
    >
      {/* Wash painted from the project's own content gradient. Decorative. */}
      <div
        aria-hidden="true"
        data-project-wash=""
        className="pointer-events-none absolute inset-0 opacity-30"
        style={project.gradient ? { background: project.gradient } : undefined}
      />

      <div className="relative grid gap-[var(--space-6)] p-[var(--space-5)] md:grid-cols-2 md:items-center md:p-[var(--space-7)]">
        <SafeImage
          src={project.image}
          alt={project.name}
          ratio="16/9"
          width={imageWidth}
          height={imageHeight}
          className="rounded-md border border-line shadow-raise"
        />

        <div className="flex flex-col items-start gap-[var(--space-3)]">
          <Badge
            tone="outline"
            data-project-tag=""
            style={
              project.tagColor
                ? { color: project.tagColor, borderColor: project.tagColor }
                : undefined
            }
          >
            {project.tag}
          </Badge>

          <Heading
            id={headingId}
            data-project-name=""
            className="text-[length:var(--text-heading)] font-bold tracking-[-0.01em] text-content"
          >
            {project.name}
          </Heading>

          <p
            data-project-description=""
            className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted"
          >
            {project.description}
          </p>

          {available ? (
            <ExternalLink
              href={project.link}
              data-project-action=""
              className="min-h-[var(--size-touch)] items-center gap-[var(--space-2)] text-[length:var(--text-label)] font-semibold"
            >
              {VIEW_PROJECT_LABEL}
            </ExternalLink>
          ) : (
            <Badge tone="muted" data-project-status="">
              {COMING_SOON_LABEL}
            </Badge>
          )}
        </div>
      </div>
    </article>
  )
}
