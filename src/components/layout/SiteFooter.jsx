import { Link } from 'react-router-dom'
import { GiOwl } from 'react-icons/gi'

import Container from '../system/Container'
import { Button } from '../ui/button'
import { cn } from '../../lib/utils'
import {
  CONTACT,
  FOOTER_BRAND,
  FOOTER_HEADINGS,
  FOOTER_LEGAL_LINKS,
  FOOTER_QUICK_LINKS,
  FOOTER_RIGHTS,
  FOOTER_SOLUTION_LINKS,
} from '../../content/site'

/**
 * `SiteFooter` - the single footer for every route, in two variants.
 *
 * `full` (Public_Routes) reproduces the canonical `PublicFooter` content: the
 * brand blurb and conversion CTA, five solution links, six quick links, the
 * office / telephone / email values, the copyright line, and the two legal
 * placeholders. Every destination comes from `content/site.js`, which recorded
 * them verbatim from the pre-redesign source, so nothing can drift
 * (Requirements 2.8, 11.6). The telephone and email controls stay plain
 * anchors because their destinations are typed schemes, not routes; internal
 * destinations render as router links.
 *
 * `compact` (Legacy_Routes) reproduces the legacy `Layout` footer, which is the
 * copyright line only. No links are added there: the legacy routes expose no
 * footer interactions today and Requirement 11.1 forbids inventing new ones.
 *
 * The copyright reads the four-digit year at render time (Requirement 2.9).
 *
 * Column headings stay at the same level they use today so the heading order
 * of every route that renders the footer is unchanged (Requirement 10.5).
 *
 * Requirements: 2.8, 2.9, 10.5, 11.1, 11.6
 */

/** Footer variants. */
export const FOOTER_VARIANTS = ['full', 'compact']

const DEFAULT_VARIANT = 'full'

/** Four-digit calendar year at render time. */
export function currentYear(now = new Date()) {
  return now.getFullYear()
}

/**
 * Build the copyright statement: the year, the EXFLOW name, and the rights
 * statement, in the exact shape the baseline records.
 *
 * @param {number} [year]
 * @returns {string} e.g. `© 2025 exflow. All rights reserved.`
 */
export function copyrightText(year = currentYear()) {
  return `\u00A9 ${year} ${FOOTER_RIGHTS}`
}

const openEnquire = () => window.dispatchEvent(new CustomEvent('open-enquire'))

/** Shared classes for a muted footer link. */
const linkClass = cn(
  'text-content-muted transition-colors',
  'hover:text-tech-cyan focus-visible:text-tech-cyan',
  'text-[length:var(--text-label)]',
)

/** Column heading. Level is fixed at 4 to preserve route heading order. */
function FooterHeading({ children, className }) {
  return (
    <h4
      className={cn(
        'font-bold text-content text-[length:var(--text-body)]',
        className,
      )}
    >
      {children}
    </h4>
  )
}

function LinkColumn({ heading, links }) {
  return (
    <div>
      <FooterHeading className="mb-[var(--space-4)]">{heading}</FooterHeading>
      <ul className="flex flex-col gap-[var(--space-3)]">
        {links.map((link, index) => (
          <li key={`${link.label}-${index}`}>
            <Link to={link.to} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CopyrightLine({ className }) {
  return (
    <p className={cn('text-content-muted text-[length:var(--text-label)]', className)}>
      {copyrightText()}
    </p>
  )
}

export default function SiteFooter({
  variant = DEFAULT_VARIANT,
  onCtaClick = openEnquire,
  className,
}) {
  const resolved = FOOTER_VARIANTS.includes(variant) ? variant : DEFAULT_VARIANT

  if (resolved === 'compact') {
    return (
      <footer
        data-footer-variant="compact"
        className={cn(
          'border-t border-line bg-surface py-[var(--space-7)]',
          className,
        )}
      >
        <Container>
          <CopyrightLine className="text-center" />
        </Container>
      </footer>
    )
  }

  return (
    <footer
      data-footer-variant="full"
      className={cn(
        'border-t border-line bg-surface pt-[var(--space-8)] pb-[var(--space-6)]',
        className,
      )}
    >
      <Container>
        <div className="grid grid-cols-1 gap-[var(--space-7)] md:grid-cols-4 md:gap-[var(--space-6)]">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-[var(--space-4)] flex items-center gap-[var(--space-3)]">
              <GiOwl
                aria-hidden="true"
                focusable="false"
                className="size-[var(--size-icon-lg)] text-tech-cyan"
              />
              <span className="font-bold text-content text-[length:var(--text-heading)]">
                {FOOTER_BRAND.name}
              </span>
            </div>
            <p className="mb-[var(--space-5)] max-w-[var(--measure)] text-content-muted text-[length:var(--text-label)]">
              {FOOTER_BRAND.blurb}
            </p>
            <Button type="button" variant="brand" size="md" onClick={onCtaClick}>
              {FOOTER_BRAND.ctaLabel}
            </Button>
          </div>

          <LinkColumn
            heading={FOOTER_HEADINGS.solutions}
            links={FOOTER_SOLUTION_LINKS}
          />
          <LinkColumn
            heading={FOOTER_HEADINGS.quickLinks}
            links={FOOTER_QUICK_LINKS}
          />

          {/* Contact */}
          <div>
            <FooterHeading className="mb-[var(--space-2)]">
              {FOOTER_HEADINGS.office}
            </FooterHeading>
            <p className="mb-[var(--space-5)] text-content-muted text-[length:var(--text-label)]">
              {CONTACT.office.address}
            </p>

            <FooterHeading className="mb-[var(--space-2)]">
              {FOOTER_HEADINGS.phone}
            </FooterHeading>
            <a
              href={CONTACT.phone.href}
              className={cn(linkClass, 'mb-[var(--space-5)] block')}
            >
              {CONTACT.phone.label}
            </a>

            <FooterHeading className="mb-[var(--space-2)]">
              {FOOTER_HEADINGS.email}
            </FooterHeading>
            <a
              href={CONTACT.email.href}
              className={cn(linkClass, 'block break-all')}
            >
              {CONTACT.email.label}
            </a>
          </div>
        </div>

        <div className="mt-[var(--space-7)] flex flex-col items-center justify-between gap-[var(--space-3)] border-t border-line pt-[var(--space-5)] md:flex-row">
          <CopyrightLine />
          <div className="flex gap-[var(--space-4)]">
            {FOOTER_LEGAL_LINKS.map((legal) => (
              <a key={legal.label} href={legal.href} className={linkClass}>
                {legal.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  )
}
