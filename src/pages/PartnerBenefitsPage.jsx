import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  DollarSign,
  Handshake,
  Shield,
  Star,
  TrendingUp,
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
 * `/partner-benefits` - a Legacy_Route page.
 *
 * `LegacyLayout` (applied in `App.jsx`) owns the legacy header, the `main`
 * landmark, and the compact footer, so this page renders content only and
 * declares no chrome of its own (Requirements 8.1, 2.1).
 *
 * Every benefit from the pre-redesign page survives verbatim: `partnerBenefits`
 * is the same array, in the same order, with the same title and description
 * strings and the same icon per entry. Each entry now renders as an icon `Card`
 * instead of a hand-rolled panel, which changes presentation only - no copy is
 * added, removed, or reworded anywhere on the route (Requirements 8.9, 11.3).
 *
 * The closing `Become a Partner` action keeps its baseline destination and
 * destination TYPE: a real in-app link to `/partner`, rendered through
 * `Button asChild` so it looks like the Primary_CTA while staying an anchor a
 * visitor can open in a new tab (Requirements 8.9, 11.6, 11.8).
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
 * Requirements: 1.1, 1.2, 8.1, 8.9, 10.5, 11.3, 11.6
 */

/**
 * The partner benefits, unchanged from the pre-redesign page. Exported so the
 * route's content can be asserted against the same data the page renders.
 */
export const partnerBenefits = [
  { icon: TrendingUp, title: 'Revenue Sharing', desc: 'Earn a share of project revenues generated through your referrals and partnerships.' },
  { icon: Shield, title: 'Priority Support', desc: 'Get dedicated account management and priority on project timelines.' },
  { icon: Users, title: 'Network Access', desc: 'Access our growing network of businesses, startups, and industry contacts.' },
  { icon: Briefcase, title: 'Co-Branded Projects', desc: 'Work on co-branded projects and build your portfolio alongside ours.' },
  { icon: Star, title: 'Early Access', desc: 'Get early access to new products, features, and business opportunities.' },
  { icon: DollarSign, title: 'Investment Opportunities', desc: 'Participate in investment rounds and share in company growth.' },
]

/** Entrance stagger per card, in ms. `Reveal` clamps the total for us. */
const CARD_STAGGER_MS = 60

export default function PartnerBenefitsPage() {
  return (
    <>
      <Section
        tone="surface"
        pad="lg"
        backdrop={<TechBackdrop variant="mesh" intensity="subtle" />}
        data-slot="partner-benefits-intro"
      >
        <Container className="flex flex-col items-start gap-[var(--space-4)]">
          <Eyebrow icon={<Handshake className="h-[var(--size-icon-xs)] w-[var(--size-icon-xs)]" />}>
            Why Partner
          </Eyebrow>
          <h1 className="text-[length:var(--text-display)] font-extrabold tracking-[-0.02em] text-content">
            Partner Benefits
          </h1>
          <p className="max-w-[var(--measure)] text-[length:var(--text-body)] leading-relaxed text-content-muted">
            Discover what you get when you partner with exflow — transparent terms, shared success, and real growth opportunities.
          </p>
        </Container>
      </Section>

      <Section
        tone="canvas"
        pad="lg"
        aria-label="Partner Benefits"
        data-slot="partner-benefits-list"
      >
        <Container>
          <ul className="grid list-none grid-cols-1 gap-[var(--space-4)] p-0 md:grid-cols-2 lg:grid-cols-3">
            {partnerBenefits.map((benefit, index) => {
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

      <Section tone="surface" pad="lg" data-slot="partner-benefits-cta">
        <Container
          width="prose"
          className="flex flex-col items-center gap-[var(--space-5)] text-center"
        >
          <SectionHeading
            level={2}
            align="center"
            title="Ready to Partner?"
            lede="Join our partner program and start growing together."
          />
          <Button asChild variant="brand" size="lg" data-slot="partner-benefits-cta-action">
            <Link to="/partner">
              <Handshake aria-hidden="true" />
              Become a Partner
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </Container>
      </Section>
    </>
  )
}
