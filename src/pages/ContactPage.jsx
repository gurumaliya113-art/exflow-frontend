import {
  Building2,
  Code2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  Truck,
  Utensils,
  Workflow,
} from 'lucide-react'

import { useEnquiry } from '@/components/enquiry/EnquiryProvider'
import Badge from '@/components/system/Badge'
import Container from '@/components/system/Container'
import ExternalLink from '@/components/system/ExternalLink'
import Section from '@/components/system/Section'
import SectionHeading from '@/components/system/SectionHeading'
import TechBackdrop from '@/components/system/TechBackdrop'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CONTACT } from '@/content/site'
import { cn } from '@/lib/utils'

/**
 * `/contact` - the contact route, on the uniform public page shell.
 *
 * The route shell (`PublicLayout`, applied in `App.jsx`) owns the header, the
 * footer, and the floating conversion action, so this page renders page content
 * only; the inline header and footer it used to mount are gone (Requirements
 * 2.1, 11.3).
 *
 * Shell order matches every other public route (Requirement 5.6): hero
 * `Section` with the route's single h1, then a content `Section` of `Card`s,
 * then a closing call-to-action `Section`.
 *
 * Every baseline value survives (Requirement 5.5): the email address, the
 * telephone number, the website address, the office line, the seven-item
 * service list, and both enquiry actions with their baseline labels. The phone
 * and email values come from `content/site.js` `CONTACT`, so there is one
 * source for them across the page and the footer.
 *
 * The website destination renders through `ExternalLink`, which is the only
 * approved way to emit an external destination: it always opens exactly one
 * new browser context and always carries both opener-blocking rel tokens
 * (Requirements 5.7, 11.6). The telephone and email destinations stay plain
 * anchors with byte-identical href values.
 *
 * Both enquiry actions go through the shared `useEnquiry()` opener, so the
 * Enquiry_Modal keeps exactly one activation surface (Requirement 6.10) with
 * the behavior it had before the redesign (Requirement 11.1).
 *
 * Presentation is token-only: no literal color values anywhere on the page
 * (Requirements 1.1, 1.2).
 *
 * Requirements: 1.1, 1.2, 5.5, 5.6, 5.7, 10.5, 11.1, 11.3, 11.6
 */

/** The EXFLOW website, verbatim from the pre-redesign page. */
export const WEBSITE = { label: 'exflow.in', href: 'https://exflow.in' }

/** Service list, verbatim (label and order) from the pre-redesign page. */
const services = [
  { icon: Code2, label: 'Custom Software Development' },
  { icon: Globe, label: 'Website Development' },
  { icon: Sparkles, label: 'AI Solutions' },
  { icon: Workflow, label: 'Business Automation' },
  { icon: Truck, label: 'Fleet Management Systems' },
  { icon: Utensils, label: 'Restaurant Management Systems' },
  { icon: Building2, label: 'Industry-Specific Platforms' },
]

/** Shared type/color treatment for the two typed (tel/mailto) destinations. */
const contactLinkClass =
  'font-semibold text-content underline-offset-4 transition-[color] hover:text-tech-cyan hover:underline'

/** Decorative icon chip used by both card lists. */
function IconChip({ icon: Icon }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex size-[var(--space-7)] shrink-0 items-center justify-center rounded-sm bg-tech-cyan/10 text-tech-cyan"
    >
      <Icon
        aria-hidden="true"
        focusable="false"
        className="size-[var(--size-icon-sm)]"
      />
    </span>
  )
}

/** One label/value pair in the "Reach Us Directly" list. */
function ContactRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-[var(--space-4)]">
      <IconChip icon={icon} />
      <div className="min-w-0 flex flex-col gap-[var(--space-1)]">
        <dt className="text-[length:var(--text-meta)] font-medium uppercase tracking-[0.08em] text-content-muted">
          {label}
        </dt>
        <dd className="text-[length:var(--text-body)] break-words">{children}</dd>
      </div>
    </div>
  )
}

export default function ContactPage() {
  // Single enquiry activation surface. Outside a provider the hook still
  // reaches the mounted modal through its window bridge, so no CTA is inert.
  const { openEnquiry } = useEnquiry()

  return (
    <>
      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="mesh" intensity="subtle" />}
        data-slot="contact-hero"
      >
        <Container className="flex flex-col items-start gap-[var(--space-5)]">
          <Badge accent="tech">
            <Send
              aria-hidden="true"
              focusable="false"
              className="size-[var(--size-icon-xs)]"
            />
            Get In Touch
          </Badge>

          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Let&apos;s Build Something Great Together.
          </h1>

          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            Need software, AI solutions, websites, automation systems, or custom
            digital products? Contact exflow.
          </p>

          <Button
            type="button"
            variant="brand"
            size="lg"
            onClick={openEnquiry}
            data-slot="contact-enquiry-cta"
          >
            Open Enquiry Form
          </Button>
        </Container>
      </Section>

      <Section tone="canvas" pad="lg" data-slot="contact-details">
        <Container className="grid grid-cols-1 gap-[var(--space-6)] md:grid-cols-2">
          <Card
            tone="surface"
            className="p-[var(--space-6)] md:p-[var(--space-7)]"
            data-slot="contact-reach-us"
          >
            <SectionHeading level={2} title="Reach Us Directly" />

            <dl className="mt-[var(--space-6)] flex flex-col gap-[var(--space-5)]">
              <ContactRow icon={Mail} label="Email">
                <a href={CONTACT.email.href} className={cn(contactLinkClass)}>
                  {CONTACT.email.label}
                </a>
              </ContactRow>

              <ContactRow icon={Phone} label="Phone">
                <a href={CONTACT.phone.href} className={cn(contactLinkClass)}>
                  {CONTACT.phone.label}
                </a>
              </ContactRow>

              <ContactRow icon={Globe} label="Website">
                {/* Only approved external destination surface. */}
                <ExternalLink href={WEBSITE.href} className="font-semibold">
                  {WEBSITE.label}
                </ExternalLink>
              </ContactRow>

              <ContactRow icon={MapPin} label={CONTACT.office.label}>
                <span className="font-semibold text-content">
                  {CONTACT.office.address}
                </span>
              </ContactRow>
            </dl>
          </Card>

          <Card
            tone="surface"
            className="p-[var(--space-6)] md:p-[var(--space-7)]"
            data-slot="contact-services"
          >
            <SectionHeading
              level={2}
              eyebrow="What We Build"
              title="Services Available"
            />

            <ul className="mt-[var(--space-6)] flex flex-col gap-[var(--space-3)]">
              {services.map((service) => (
                <li
                  key={service.label}
                  className="flex items-center gap-[var(--space-4)] rounded-sm border border-line bg-surface-high px-[var(--space-4)] py-[var(--space-3)]"
                >
                  <IconChip icon={service.icon} />
                  <span className="text-[length:var(--text-body)] font-semibold text-content">
                    {service.label}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </Container>
      </Section>

      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="grid" intensity="subtle" />}
        data-slot="contact-closing-cta"
      >
        <Container
          width="narrow"
          className="flex flex-col items-center gap-[var(--space-5)]"
        >
          <SectionHeading
            level={2}
            align="center"
            title="Partner with exflow to build technology designed for growth."
            lede="Tell us about your project. We respond within 24 hours."
          />

          <Button
            type="button"
            variant="brand"
            size="lg"
            onClick={openEnquiry}
            data-slot="contact-quote-cta"
          >
            Request A Quote
          </Button>
        </Container>
      </Section>
    </>
  )
}
