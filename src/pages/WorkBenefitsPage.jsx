import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Briefcase,
  Clock,
  DollarSign,
  Rocket,
  Shield,
  Users,
} from 'lucide-react'

import Container from '@/components/system/Container'
import Eyebrow from '@/components/system/Eyebrow'
import Reveal from '@/components/system/Reveal'
import Section from '@/components/system/Section'
import SectionHeading from '@/components/system/SectionHeading'
import TechBackdrop from '@/components/system/TechBackdrop'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

/**
 * `/work-benefits` - a Legacy_Route page.
 *
 * `LegacyLayout` (applied in `App.jsx`) owns the legacy header, the `main`
 * landmark, and the compact footer, so this page renders content only and
 * declares no chrome of its own (Requirements 8.1, 2.1).
 *
 * Every benefit from the pre-redesign page survives verbatim: `workBenefits` is
 * the same array, in the same order, with the same title and description
 * strings and the same icon per entry. Each entry now renders as an icon `Card`
 * instead of a hand-rolled panel, which changes presentation only - no copy is
 * added, removed, or reworded anywhere on the route (Requirements 8.10, 11.3).
 *
 * The closing `Enquire Now` action keeps the enquiry workflow it had before the
 * redesign, and keeps its destination TYPE: the recorded baseline for this route
 * activates enquiry by navigating to the standalone `/enquire` page, not by
 * opening the modal, so this stays an in-app link rather than becoming a modal
 * trigger (Requirements 8.10, 11.6, 11.8). It is rendered through
 * `Button asChild`, so it carries the Primary_CTA treatment while remaining an
 * anchor a visitor can open in a new tab.
 *
 * Heading structure (Requirement 10.5): one `h1` for the route, then each
 * benefit card and the closing band at level 2, so no level is skipped. A
 * benefit `Card` is its own Content_Region, with exactly one heading in it and
 * no call to action, so the six sibling level-2 headings sit in six regions
 * rather than one (Requirement 1.8).
 *
 * Presentation is token-only: the page declares no literal color value in any
 * form, and every size and space comes from the token scales (Requirements
 * 1.1, 1.2).
 *
 * Requirements: 1.1, 1.2, 8.1, 8.10, 10.5, 11.3, 11.6
 */

/**
 * The work benefits, unchanged from the pre-redesign page. Exported so the
 * route's content can be asserted against the same data the page renders.
 */
export const workBenefits = [
  { icon: Clock, title: 'On-Time Delivery', desc: 'We commit to clear timelines and deliver on schedule — every single project.' },
  { icon: DollarSign, title: 'Industry Cheapest Price', desc: 'If anyone matches or goes below our price (verified), we do the entire work for free.' },
  { icon: Shield, title: 'No Full Advance Payment', desc: 'Work begins without demanding full payment upfront. Pay as milestones are completed.' },
  { icon: Users, title: 'Expert Workforce', desc: 'Experienced professionals across development, design, marketing, and operations.' },
  { icon: Rocket, title: 'Fast Turnaround', desc: 'We prioritize speed without compromising quality — minimum days, maximum impact.' },
  { icon: Award, title: 'Free Consulting', desc: 'Industry expertise, planning, and guidance included at no extra cost.' },
]

/** Entrance stagger per card, in ms. `Reveal` clamps the total for us. */
const CARD_STAGGER_MS = 60

export default function WorkBenefitsPage() {
  return (
    <>
      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="mesh" intensity="subtle" />}
        data-slot="work-benefits-intro"
      >
        <Container className="flex flex-col items-start gap-[var(--space-4)]">
          <Eyebrow icon={<Briefcase className="h-[var(--size-icon-xs)] w-[var(--size-icon-xs)]" />}>
            Work Benefits
          </Eyebrow>
          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Why Get Your Work Done With Us
          </h1>
          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            Simple, transparent terms. No hidden charges. Focused on outcomes and your satisfaction.
          </p>
        </Container>
      </Section>

      <Section
        tone="canvas"
        pad="lg"
        aria-label="Work Benefits"
        data-slot="work-benefits-list"
      >
        <Container>
          <ul className="grid list-none grid-cols-1 gap-[var(--space-4)] p-0 md:grid-cols-2 lg:grid-cols-3">
            {workBenefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <Reveal
                  key={benefit.title}
                  as="li"
                  delay={index * CARD_STAGGER_MS}
                  className="h-full"
                >
                  <Card tone="surface" className="flex h-full flex-col">
                    <CardHeader className="gap-[var(--space-4)]">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-[var(--space-7)] w-[var(--space-7)] items-center justify-center rounded-sm bg-surface-high text-tech-cyan"
                      >
                        <Icon className="h-[var(--size-icon-sm)] w-[var(--size-icon-sm)]" />
                      </span>
                      <h2 className="text-[length:var(--text-body)] font-semibold leading-tight tracking-[-0.01em] text-content">
                        {benefit.title}
                      </h2>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{benefit.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </Reveal>
              )
            })}
          </ul>
        </Container>
      </Section>

      <Section tone="surface" pad="lg" data-slot="work-benefits-cta">
        <Container
          width="prose"
          className="flex flex-col items-center gap-[var(--space-5)] text-center"
        >
          <SectionHeading
            level={2}
            align="center"
            title="Ready to Start?"
            lede="Tell us about your project and we'll take it from there."
          />
          <Button asChild variant="brand" size="lg" data-slot="work-benefits-cta-action">
            <Link to="/enquire">
              Enquire Now
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </Container>
      </Section>
    </>
  )
}
